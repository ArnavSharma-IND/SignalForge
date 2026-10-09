import asyncio, logging, random, time, uuid
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from . import pipeline
from .auth import current_user, delete_identity, verified_user
from .config import settings
from .db import make_repo
from .providers import ProviderError, configured

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("signalforge")
repo = make_repo()
tasks: set = set()
hits: dict = defaultdict(list)
MAX_RETRIES, STALE_AFTER = 2, 300

def spawn(id):
    t = asyncio.create_task(execute(id)); tasks.add(t); t.add_done_callback(tasks.discard)

async def execute(id):
    inv = await repo.transition(id, ["queued"], "running")  # atomic claim: only one worker runs a job
    if not inv: return
    async def stage(s): await repo.touch(id, {"stage": s, "updated": time.time()})
    try:
        data = await pipeline.run(inv, stage)
        await repo.touch(id, {"status": "completed", "stage": "done", "data": data, "error": None, "updated": time.time()})
    except ProviderError as e:
        if e.transient and inv["retries"] < MAX_RETRIES:
            await asyncio.sleep(5 * 2 ** inv["retries"] + random.random())
            await repo.touch(id, {"status": "queued", "retries": inv["retries"] + 1, "updated": time.time()}); spawn(id)
        else:
            log.warning("investigation %s failed: %s", id, e)
            await repo.touch(id, {"status": "failed", "error": str(e), "updated": time.time()})
    except Exception:
        log.exception("investigation %s crashed", id)
        await repo.touch(id, {"status": "failed", "error": "Internal error during research", "updated": time.time()})

@asynccontextmanager
async def lifespan(app):
    await repo.init()
    for id in await repo.stale(time.time() - STALE_AFTER):  # recover jobs orphaned by a restart
        await repo.touch(id, {"status": "queued", "updated": time.time()}); spawn(id)
    yield
    await repo.close()

app = FastAPI(title="SignalForge", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors, allow_methods=["GET", "POST", "DELETE"], allow_headers=["Authorization", "Content-Type"], allow_credentials=False)

@app.middleware("http")
async def mw(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    try: resp = await call_next(request)
    except Exception:
        log.exception("unhandled error rid=%s path=%s", rid, request.url.path)
        resp = JSONResponse({"detail": "Internal server error", "request_id": rid}, 500)
    resp.headers.update({"X-Request-ID": rid, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store"})
    return resp

class InvIn(BaseModel):
    company: str = Field(min_length=1, max_length=120)
    question: str = Field(min_length=10, max_length=500)
    focus: str = Field("Growth sustainability", max_length=60)

def view(i, data=False):
    o = {k: i.get(k) for k in ("company", "question", "focus", "status", "stage", "error", "retries", "created", "updated")}
    o["id"] = i["_id"]
    if data: o["data"] = i.get("data")
    return o

def limit(uid):
    now = time.time(); hits[uid] = [t for t in hits[uid] if now - t < 3600]
    if len(hits[uid]) >= settings.runs_per_hour: raise HTTPException(429, "Hourly research limit reached. Try again later.")
    hits[uid].append(now)

async def owned(id, u):
    i = await repo.get(id, u["uid"])  # ownership enforced in the query: other users' ids look like 404
    if not i: raise HTTPException(404, "Investigation not found")
    return i

api = APIRouter(prefix="/api/v1")

@api.get("/health")
async def health(): return {"ok": True}

@api.get("/ready")
async def ready():
    return {"database": await repo.ready(), "auth": bool(settings.firebase_project) or settings.auth_disabled,
            "missing_provider_config": configured()}

@api.get("/me")
async def me(u=Depends(current_user)):
    return {"uid": u["uid"], "email_verified": bool(u.get("email_verified")), "phone_verified": bool(u.get("phone_number"))}

@api.delete("/me", status_code=204)
async def delete_me(u=Depends(verified_user)):
    await repo.delete_owner(u["uid"])
    if not settings.auth_disabled: delete_identity(u["uid"])
    return Response(status_code=204)

@api.post("/investigations", status_code=201)
async def create(b: InvIn, u=Depends(verified_user)):
    now = time.time()
    i = {"_id": uuid.uuid4().hex, "owner": u["uid"], **b.model_dump(), "status": "created", "stage": None, "error": None, "retries": 0, "created": now, "updated": now, "data": None}
    return view(await repo.create(i))

@api.get("/investigations")
async def list_(skip: int = 0, limit: int = 20, u=Depends(verified_user)):
    return [view(i) for i in await repo.list(u["uid"], max(skip, 0), min(max(limit, 1), 50))]

@api.get("/investigations/{id}")
async def get(id: str, u=Depends(verified_user)): return view(await owned(id, u), data=True)

@api.delete("/investigations/{id}", status_code=204)
async def delete(id: str, u=Depends(verified_user)):
    if not await repo.delete(id, u["uid"]): raise HTTPException(404, "Investigation not found")
    return Response(status_code=204)

async def start(id, u, allowed):
    i = await owned(id, u)
    if i["status"] in ("queued", "running"): return view(i)  # idempotent
    if i["status"] not in allowed: raise HTTPException(409, f"Cannot start an investigation that is {i['status']}")
    missing = configured()
    if missing: raise HTTPException(503, f"Research providers not configured: {', '.join(missing)}")
    limit(u["uid"])
    j = await repo.transition(id, allowed, "queued")
    if j:
        await repo.touch(id, {"error": None, "retries": 0}); spawn(id)
    return view(await repo.get(id))

@api.post("/investigations/{id}/run")
async def run(id: str, u=Depends(verified_user)): return await start(id, u, ["created", "failed"])

@api.post("/investigations/{id}/retry")
async def retry(id: str, u=Depends(verified_user)): return await start(id, u, ["failed"])

@app.get("/api/health")
async def root_health(): return {"ok": True}

@app.post("/api/research")
async def direct_research(b: InvIn):
    missing = configured()
    if missing: raise HTTPException(503, f"Research providers not configured: {', '.join(missing)}")
    async def noop(s): pass
    try:
        return await pipeline.run(b.model_dump(), noop)
    except ProviderError as e:
        raise HTTPException(502, str(e))
    except Exception:
        raise HTTPException(500, "Internal error during research")

app.include_router(api)

