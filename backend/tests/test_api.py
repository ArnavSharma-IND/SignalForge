import asyncio, os, time
os.environ["DATABASE"] = "memory"
import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from app import pipeline as P
from app.auth import current_user
from app.config import settings
from app.main import app, repo

def as_user(request: Request):
    return {"uid": request.headers["x-test-user"], "email_verified": True}

@pytest.fixture
def client():
    app.dependency_overrides[current_user] = as_user
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()

A, B = {"x-test-user": "alice"}, {"x-test-user": "bob"}
BODY = {"company": "Acme", "question": "Is growth sustainable over the next year?"}

def test_requires_token():
    with TestClient(app) as c:
        assert c.get("/api/v1/investigations").status_code == 401
        assert c.get("/api/v1/investigations", headers={"Authorization": "Bearer junk"}).status_code in (401, 503)

def test_unverified_user_blocked(client):
    app.dependency_overrides[current_user] = lambda: {"uid": "x", "email_verified": False}
    assert client.get("/api/v1/investigations").status_code == 403

def test_ownership_isolation(client):
    id = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    assert client.get(f"/api/v1/investigations/{id}", headers=A).status_code == 200
    assert client.get(f"/api/v1/investigations/{id}", headers=B).status_code == 404
    assert client.delete(f"/api/v1/investigations/{id}", headers=B).status_code == 404
    assert client.post(f"/api/v1/investigations/{id}/run", headers=B).status_code == 404
    assert client.get("/api/v1/investigations", headers=B).json() == []

def test_validation(client):
    assert client.post("/api/v1/investigations", json={"company": "", "question": "x"}, headers=A).status_code == 422

def test_run_requires_providers(client, monkeypatch):
    monkeypatch.setattr(settings, "llm_key", ""); monkeypatch.setattr(settings, "search_key", "")
    id = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    r = client.post(f"/api/v1/investigations/{id}/run", headers=A)
    assert r.status_code == 503 and "not configured" in r.json()["detail"]
    assert client.get(f"/api/v1/investigations/{id}", headers=A).json()["status"] == "created"

def test_run_lifecycle_and_failure(client, monkeypatch):
    monkeypatch.setattr(settings, "llm_key", "k"); monkeypatch.setattr(settings, "search_key", "k")
    async def ok(inv, stage): await stage("planning"); return {"evidence": []}
    monkeypatch.setattr(P, "run", ok)
    id = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    assert client.post(f"/api/v1/investigations/{id}/run", headers=A).status_code == 200
    for _ in range(40):
        s = client.get(f"/api/v1/investigations/{id}", headers=A).json()
        if s["status"] == "completed": break
        time.sleep(0.05)
    assert s["status"] == "completed" and s["data"] == {"evidence": []}
    async def bad(inv, stage): raise P.ProviderError("Search provider rejected the request (401)")
    monkeypatch.setattr(P, "run", bad)
    id2 = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    client.post(f"/api/v1/investigations/{id2}/run", headers=A)
    for _ in range(40):
        s = client.get(f"/api/v1/investigations/{id2}", headers=A).json()
        if s["status"] == "failed": break
        time.sleep(0.05)
    assert s["status"] == "failed" and "rejected" in s["error"]

def test_score_is_transparent():
    evs = [{"cls": "SUPPORTS", "url": "https://www.sec.gov/a"}, {"cls": "CONTRADICTS", "url": "https://x.com/b"}]
    sc = P.score(evs, 6)
    assert sc["Contradiction Risk"] == 5.0 and sc["Source Quality"] == 7.0 and sc["Evidence Strength"] == 1.7 and sc["Novelty"] == 6

def test_pipeline_drops_unverifiable_excerpts(monkeypatch):
    async def fake_search(q, n=6): return [{"title": "T", "url": "https://www.sec.gov/x", "content": "Revenue rose twelve percent year on year.", "date": None}]
    async def fake_llm(system, user, cls):
        if cls is P.Plan: return P.Plan(subquestions=["a"], hypotheses=["H1", "H2"], queries=["q1"], falsifiers=[P.Falsifier(name="Costs", query="q2")])
        if cls is P.Extraction:
            return P.Extraction(evidence=[P.Ev(src=0, claim="c", excerpt="revenue rose twelve percent", cls="SUPPORTS"),
                                          P.Ev(src=0, claim="made up", excerpt="this sentence is not in the source", cls="SUPPORTS")])
        return P.Analysis(hypotheses=[P.Hyp(text="H1", status="Supported", support=[0, 9])], contradictions=[], falsification=[], thesis="H1", assessment="a",
                          signal="s", triangulation="t", alternative="alt", novelty=5, monitor=[])
    monkeypatch.setattr(P, "search", fake_search); monkeypatch.setattr(P, "llm_json", fake_llm)
    stages = []
    async def stage(s): stages.append(s)
    d = asyncio.run(P.run({"company": "A", "question": "Q?", "focus": "f"}, stage))
    assert len(d["evidence"]) == 1 and d["evidence"][0]["url"] == "https://www.sec.gov/x"
    assert d["falsification"]["tests"][0]["searched"] == "q2" and d["falsification"]["tests"][0]["risk"] == "Unknown"
    assert d["hypotheses"][0]["conf"] == 100 and d["signal"]["confidence"] is None
    assert stages == ["planning", "searching", "extracting", "analysing"]

def test_health_and_ready(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200 and r.json() == {"ok": True}
    assert "X-Request-ID" in r.headers
    assert r.headers.get("X-Content-Type-Options") == "nosniff"

    r_ready = client.get("/api/v1/ready")
    assert r_ready.status_code == 200
    data = r_ready.json()
    assert "database" in data and "auth" in data

def test_me_and_delete_account(client):
    r = client.get("/api/v1/me", headers=A)
    assert r.status_code == 200
    assert r.json()["uid"] == "alice"

    # Create investigation for alice
    inv_id = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    assert client.get(f"/api/v1/investigations/{inv_id}", headers=A).status_code == 200

    # Delete alice's account
    del_r = client.delete("/api/v1/me", headers=A)
    assert del_r.status_code == 204

    # Investigation should be removed
    assert client.get(f"/api/v1/investigations/{inv_id}", headers=A).status_code == 404

def test_retry_endpoint(client, monkeypatch):
    monkeypatch.setattr(settings, "llm_key", "k"); monkeypatch.setattr(settings, "search_key", "k")
    # Fail first
    async def bad(inv, stage): raise P.ProviderError("Temporary failure")
    monkeypatch.setattr(P, "run", bad)
    id = client.post("/api/v1/investigations", json=BODY, headers=A).json()["id"]
    client.post(f"/api/v1/investigations/{id}/run", headers=A)
    for _ in range(40):
        s = client.get(f"/api/v1/investigations/{id}", headers=A).json()
        if s["status"] == "failed": break
        time.sleep(0.05)
    assert s["status"] == "failed"

    # Now retry with ok
    async def ok(inv, stage): return {"evidence": []}
    monkeypatch.setattr(P, "run", ok)
    retry_r = client.post(f"/api/v1/investigations/{id}/retry", headers=A)
    assert retry_r.status_code == 200
    for _ in range(40):
        s = client.get(f"/api/v1/investigations/{id}", headers=A).json()
        if s["status"] == "completed": break
        time.sleep(0.05)
    assert s["status"] == "completed"

def test_rate_limiting(client, monkeypatch):
    monkeypatch.setattr(settings, "llm_key", "k"); monkeypatch.setattr(settings, "search_key", "k")
    monkeypatch.setattr(settings, "runs_per_hour", 2)
    async def ok(inv, stage): return {}
    monkeypatch.setattr(P, "run", ok)

    user_headers = {"x-test-user": "ratelimited_user"}
    id1 = client.post("/api/v1/investigations", json=BODY, headers=user_headers).json()["id"]
    id2 = client.post("/api/v1/investigations", json=BODY, headers=user_headers).json()["id"]
    id3 = client.post("/api/v1/investigations", json=BODY, headers=user_headers).json()["id"]

    assert client.post(f"/api/v1/investigations/{id1}/run", headers=user_headers).status_code == 200
    assert client.post(f"/api/v1/investigations/{id2}/run", headers=user_headers).status_code == 200
    # 3rd run should hit 429
    r3 = client.post(f"/api/v1/investigations/{id3}/run", headers=user_headers)
    assert r3.status_code == 429

def test_root_health_and_direct_research(client, monkeypatch):
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/health").json() == {"ok": True}

    # Direct research requires providers
    monkeypatch.setattr(settings, "llm_key", ""); monkeypatch.setattr(settings, "search_key", "")
    assert client.post("/api/research", json=BODY).status_code == 503

    # With providers configured
    monkeypatch.setattr(settings, "llm_key", "k"); monkeypatch.setattr(settings, "search_key", "k")
    async def ok(inv, stage): return {"status": "direct_ok"}
    monkeypatch.setattr(P, "run", ok)
    res = client.post("/api/research", json=BODY)
    assert res.status_code == 200 and res.json() == {"status": "direct_ok"}


