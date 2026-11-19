import hashlib
import secrets
from datetime import timedelta, timezone
import jwt
from argon2 import PasswordHasher
from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from .config import config
from .db import database
from .models import User, AuthSession, now

hasher = PasswordHasher()
DUMMY_HASH = hasher.hash(secrets.token_urlsafe(32))
def digest(value): return hashlib.sha256(value.encode()).hexdigest()
def verify(password, hashed):
    try: return hasher.verify(hashed, password)
    except Exception: return False
def set_cookie(response, key, value, seconds, path='/'):
    response.set_cookie(key, value, max_age=seconds, path=path, httponly=True, secure=config.cookie_secure, samesite=config.cookie_samesite)
def issue(response: Response, db: Session, user: User, existing=None):
    raw = secrets.token_urlsafe(48)
    session = existing or AuthSession(user_id=user.id)
    session.token_hash = digest(raw)
    session.csrf_token = secrets.token_urlsafe(32)
    session.expires_at = now() + timedelta(days=config.refresh_token_expire_days)
    db.add(session); db.flush()
    access = jwt.encode({'sub':user.id, 'sid':session.id, 'exp':now()+timedelta(minutes=config.access_token_expire_minutes), 'type':'access'}, config.jwt_secret_key, algorithm='HS256')
    db.commit()
    set_cookie(response, 'visionary_access', access, config.access_token_expire_minutes*60)
    set_cookie(response, 'visionary_refresh', raw, config.refresh_token_expire_days*86400, '/api/v1/auth')
    return session.csrf_token
def auth_session(request: Request, db: Session):
    try:
        token = jwt.decode(request.cookies.get('visionary_access',''), config.jwt_secret_key, algorithms=['HS256'])
        if token.get('type') != 'access': raise ValueError()
        session = db.get(AuthSession, token['sid'])
        if not session or session.user_id != token['sub'] or session.expires_at.replace(tzinfo=timezone.utc) <= now(): raise ValueError()
    except Exception: raise HTTPException(401, 'Please sign in to continue')
    if request.method not in ('GET','HEAD','OPTIONS') and not secrets.compare_digest(request.headers.get('X-CSRF-Token',''),session.csrf_token): raise HTTPException(403, 'Invalid CSRF token')
    return session
def current_user(request: Request, db: Session = Depends(database)):
    session = auth_session(request, db)
    user = db.get(User, session.user_id)
    if not user: raise HTTPException(401,'Please sign in to continue')
    return user
def public_user(user): return {'id':user.id, 'full_name':user.full_name, 'email':user.email, 'created_at':user.created_at}
