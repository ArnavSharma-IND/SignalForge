"""SignalForge API. DemoAgent serves structured demo data; replace its stage methods with real search + LLM calls."""
import json, pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DEMO = pathlib.Path(__file__).parent.parent / "frontend/src/demo.json"  # single source of demo truth

class Query(BaseModel):
    company: str
    question: str
    focus: str = "Growth sustainability"

class DemoAgent:
    # Extension points: plan -> hypothesize -> collect (search API) -> triangulate -> falsify -> score (LLM)
    def run(self, q: Query) -> dict:
        d = json.loads(DEMO.read_text())
        d.update(company=q.company, question=q.question, focus=q.focus)
        return d

app = FastAPI(title="SignalForge")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
agent = DemoAgent()

@app.get("/api/health")
def health(): return {"ok": True, "mode": "demo"}

@app.post("/api/research")
def research(q: Query): return agent.run(q)
