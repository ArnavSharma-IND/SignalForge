import asyncio, random, re
import httpx
from pydantic import ValidationError
from .config import settings

class ProviderError(Exception):
    def __init__(self, msg, transient=False): super().__init__(msg); self.transient = transient

def configured():
    return [n for n, v in (("ANTHROPIC_API_KEY", settings.llm_key), ("TAVILY_API_KEY", settings.search_key)) if not v]

async def search(q: str, n: int = 6) -> list[dict]:
    """Web search adapter (Tavily). Replace this function to use another provider."""
    if not settings.search_key: raise ProviderError("Search provider not configured")
    try:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.post("https://api.tavily.com/search", headers={"Authorization": f"Bearer {settings.search_key}"},
                             json={"query": q, "max_results": n, "search_depth": "basic"})
    except httpx.HTTPError:
        raise ProviderError("Search provider unreachable", True)
    if r.status_code in (429, 500, 502, 503, 504): raise ProviderError(f"Search provider busy ({r.status_code})", True)
    if r.status_code >= 400: raise ProviderError(f"Search provider rejected the request ({r.status_code})")
    return [{"title": x.get("title") or x["url"], "url": x["url"], "content": x.get("content") or "", "date": x.get("published_date")}
            for x in r.json().get("results", []) if str(x.get("url", "")).startswith(("http://", "https://"))]

async def llm_json(system: str, user: str, cls, attempts: int = 3):
    """Calls the LLM and validates the reply against a Pydantic model. Never trusts raw model output."""
    if not settings.llm_key: raise ProviderError("LLM provider not configured")
    prompt = f"{user}\n\nReply with ONE JSON object matching this JSON Schema and nothing else:\n{cls.model_json_schema()}"
    last = "invalid output"
    for a in range(attempts):
        try:
            async with httpx.AsyncClient(timeout=90) as c:
                r = await c.post("https://api.anthropic.com/v1/messages", headers={"x-api-key": settings.llm_key, "anthropic-version": "2023-06-01"},
                                 json={"model": settings.llm_model, "max_tokens": 4000, "system": system, "messages": [{"role": "user", "content": prompt}]})
            if r.status_code in (429, 500, 502, 503, 529): last = f"LLM busy ({r.status_code})"
            elif r.status_code >= 400: raise ProviderError(f"LLM rejected the request ({r.status_code})")
            else:
                m = re.search(r"\{.*\}", r.json()["content"][0]["text"], re.S)
                if m: return cls.model_validate_json(m.group(0))
                last = "model returned no JSON"
        except (httpx.HTTPError, ValidationError, KeyError, IndexError, ValueError) as e:
            last = "model returned invalid structured output" if isinstance(e, ValidationError) else "LLM unreachable"
        await asyncio.sleep(2 ** a + random.random())
    raise ProviderError(f"LLM failed: {last}", True)
