import firebase_admin
from fastapi import Depends, HTTPException, Request
from firebase_admin import auth as fb
from .config import settings

def _init():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(options={"projectId": settings.firebase_project})

def current_user(request: Request) -> dict:
    """Verifies the Firebase ID token (signature, expiry, audience). Identity comes only from the verified token."""
    if settings.auth_disabled:
        return {"uid": "dev-user", "email_verified": True}
    h = request.headers.get("authorization", "")
    if not h.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    if not settings.firebase_project:
        raise HTTPException(503, "Authentication is not configured (FIREBASE_PROJECT_ID)")
    try:
        _init()
        return fb.verify_id_token(h[7:])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

def verified_user(u: dict = Depends(current_user)) -> dict:
    if not (u.get("email_verified") or u.get("phone_number")):
        raise HTTPException(403, "Verify your email address or phone number first")
    return u

def delete_identity(uid: str):
    try:
        _init(); fb.delete_user(uid)
    except Exception:
        return False
    return True
