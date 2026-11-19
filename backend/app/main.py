import hashlib
import secrets
import time
from collections import Counter
from datetime import timedelta, timezone
from uuid import uuid4
from fastapi import FastAPI, APIRouter, Depends, Request, Response, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, delete, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from .config import config
from .db import database
from .models import User, UserSettings, Detection, DetectedObject, AuthSession, UploadIntent, StorageDeletion, RateBucket, now
from .schemas import Register, Login, Profile, Password, Settings, DetectionInput
from .security import current_user, auth_session, public_user, hasher, verify, DUMMY_HASH, issue, digest
from . import storage

app = FastAPI(title='Visionary AI', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=[config.frontend_url], allow_credentials=True, allow_methods=['GET','POST','PATCH','DELETE','OPTIONS'], allow_headers=['Content-Type','X-CSRF-Token'])

@app.middleware('http')
async def security_headers(request: Request, call_next):
    if request.method not in ('GET','HEAD','OPTIONS'):
        origin=request.headers.get('origin')
        if origin and origin != config.frontend_url:
            from starlette.responses import JSONResponse
            return JSONResponse({'detail':'Origin is not allowed'},403)
    try: declared_size=int(request.headers.get('content-length','0') or 0)
    except ValueError:
        from starlette.responses import JSONResponse
        return JSONResponse({'detail':'Invalid content length'},400)
    if declared_size>2_000_000:
        from starlette.responses import JSONResponse
        return JSONResponse({'detail':'Request is too large'},413)
    if request.method in ('POST','PATCH','PUT'):
        chunks=[];received=0
        async for chunk in request.stream():
            received+=len(chunk)
            if received>2_000_000:
                from starlette.responses import JSONResponse
                return JSONResponse({'detail':'Request is too large'},413)
            chunks.append(chunk)
        request._body=b''.join(chunks)
    response=await call_next(request)
    response.headers.update({'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':'no-store'})
    return response

api=APIRouter(prefix='/api/v1')
def rate_limit(request: Request, db: Session, identity: str):
    # Durable counters shared across serverless instances; do not trust forwarded headers.
    for kind,value,limit in [('identity',identity.lower(),15),('ip',request.client.host if request.client else 'unknown',60)]:
        key=hashlib.sha256(f'{kind}:{value}'.encode()).hexdigest(); window=int(time.time()//900)
        row=db.scalar(select(RateBucket).where(RateBucket.key==key).with_for_update())
        if row is None:
            row=RateBucket(key=key,window=window,count=1);db.add(row)
        elif row.window!=window: row.window=window;row.count=1
        elif row.count>=limit: raise HTTPException(429,'Too many attempts. Please try again in 15 minutes.')
        else: row.count+=1
        try: db.commit()
        except IntegrityError: db.rollback();raise HTTPException(429,'Please retry shortly')

@api.get('/health')
def health(): return {'status':'ok','inference':'browser-only'}

@api.get('/internal/reconcile',include_in_schema=False)
def scheduled_reconciliation(request:Request):
    if not config.cron_secret or not secrets.compare_digest(request.headers.get('authorization',''),f'Bearer {config.cron_secret}'):
        raise HTTPException(401,'Unauthorized scheduler')
    from reconcile import reconcile
    reconcile()
    return {'status':'reconciled'}

@api.post('/auth/register', status_code=201)
def register(data:Register, request:Request, response:Response, db:Session=Depends(database)):
    rate_limit(request,db,str(data.email))
    u=User(full_name=data.full_name,email=str(data.email).lower(),password_hash=hasher.hash(data.password));db.add(u)
    try: db.flush();db.add(UserSettings(user_id=u.id));db.commit()
    except IntegrityError: db.rollback();raise HTTPException(409,'Unable to register with these details. Try signing in.')
    csrf=issue(response,db,u)
    return {'user':public_user(u),'csrf_token':csrf}

@api.post('/auth/login')
def login(data:Login,request:Request,response:Response,db:Session=Depends(database)):
    rate_limit(request,db,str(data.email))
    u=db.scalar(select(User).where(User.email==str(data.email).lower()))
    valid=verify(data.password,u.password_hash if u else DUMMY_HASH)
    if not u or not valid: raise HTTPException(401,'Email or password is incorrect')
    return {'user':public_user(u),'csrf_token':issue(response,db,u)}

@api.post('/auth/refresh')
def refresh(request:Request,response:Response,db:Session=Depends(database)):
    raw=request.cookies.get('visionary_refresh','')
    s=db.scalar(select(AuthSession).where(AuthSession.token_hash==digest(raw)).with_for_update())
    if not s or s.expires_at.replace(tzinfo=timezone.utc)<=now(): raise HTTPException(401,'Session expired')
    # Origin verification also permits a page reload when the in-memory CSRF value was lost.
    if request.headers.get('origin')!=config.frontend_url and not secrets.compare_digest(request.headers.get('X-CSRF-Token',''),s.csrf_token): raise HTTPException(403,'Invalid refresh origin')
    u=db.get(User,s.user_id)
    return {'csrf_token':issue(response,db,u,s)}

@api.post('/auth/logout',status_code=204)
def logout(request:Request,response:Response,u=Depends(current_user),db:Session=Depends(database)):
    s=auth_session(request,db);db.delete(s);db.commit()
    response.delete_cookie('visionary_access',path='/');response.delete_cookie('visionary_refresh',path='/api/v1/auth')

@api.get('/auth/me')
@api.get('/users/me')
def me(request:Request,u=Depends(current_user),db:Session=Depends(database)):
    return {**public_user(u),'csrf_token':auth_session(request,db).csrf_token}

@api.patch('/users/me')
def profile(data:Profile,u=Depends(current_user),db:Session=Depends(database)):
    name=data.full_name.strip()
    if not name: raise HTTPException(422,'Name is required')
    u.full_name=name;db.commit();return public_user(u)

@api.patch('/auth/password',status_code=204)
def password(data:Password,response:Response,u=Depends(current_user),db:Session=Depends(database)):
    if not verify(data.current_password,u.password_hash): raise HTTPException(400,'Current password is incorrect')
    u.password_hash=hasher.hash(data.new_password)
    db.execute(delete(AuthSession).where(AuthSession.user_id==u.id));db.commit()
    response.delete_cookie('visionary_access',path='/');response.delete_cookie('visionary_refresh',path='/api/v1/auth')

@api.get('/users/settings',response_model=Settings)
def get_settings(u=Depends(current_user),db:Session=Depends(database)):
    return db.scalar(select(UserSettings).where(UserSettings.user_id==u.id))

@api.patch('/users/settings',response_model=Settings)
def set_settings(data:Settings,u=Depends(current_user),db:Session=Depends(database)):
    s=get_settings(u,db)
    for key,value in data.model_dump().items():setattr(s,key,value)
    db.commit();return s

@api.post('/storage/uploads',status_code=201)
def upload(u=Depends(current_user),db:Session=Depends(database)):
    # Limit pending uploads and rate so signed upload cannot be used without bounds.
    count=db.scalar(select(func.count()).select_from(UploadIntent).where(UploadIntent.user_id==u.id,UploadIntent.created_at>now()-timedelta(hours=1)))
    if count>=60: raise HTTPException(429,'Hourly save limit reached. Try again later.')
    pid=f'visionary/{u.id}/{uuid4()}'
    signed=storage.upload_signature(pid)
    intent=UploadIntent(user_id=u.id,public_id=pid,expires_at=now()+timedelta(hours=2));db.add(intent);db.commit()
    return {'upload_id':intent.id,**signed}

def serialize(d):
    return {'id':d.id,'source_type':d.source_type,'image_url':storage.image_url(d.image_public_id,d.image_format),'width':d.width,'height':d.height,'model_version':d.model_version,'confidence_threshold':d.confidence_threshold,'total_objects':d.total_objects,'detected_at':d.detected_at,'objects':[{'class_id':o.class_id,'object_name':o.object_name,'confidence':o.confidence,'bounding_box':o.bounding_box,'segmentation_data':o.segmentation_data} for o in d.objects]}

@api.post('/detections',status_code=201)
def save(data:DetectionInput,u=Depends(current_user),db:Session=Depends(database)):
    existing=db.scalar(select(Detection).where(Detection.user_id==u.id,Detection.idempotency_key==data.idempotency_key))
    if existing:return serialize(existing)
    intent=db.scalar(select(UploadIntent).where(UploadIntent.id==data.upload_id,UploadIntent.user_id==u.id).with_for_update())
    if not intent or intent.consumed or intent.expires_at.replace(tzinfo=timezone.utc)<now():raise HTTPException(422,'Upload authorization expired. Save again.')
    asset=storage.inspect_asset(intent.public_id)
    if asset.get('bytes',0)>3_000_000 or asset.get('format') not in ('jpg','jpeg','png','webp') or asset.get('width')!=data.width or asset.get('height')!=data.height: raise HTTPException(422,'Uploaded image dimensions or size do not match')
    d=Detection(user_id=u.id,image_public_id=intent.public_id,image_format=asset['format'],total_objects=len(data.objects),**data.model_dump(exclude={'upload_id','objects'}))
    d.objects=[DetectedObject(**o.model_dump(mode='json')) for o in data.objects];db.add(d);intent.consumed=True
    try:db.commit()
    except IntegrityError:
        db.rollback();existing=db.scalar(select(Detection).where(Detection.user_id==u.id,Detection.idempotency_key==data.idempotency_key))
        if existing:return serialize(existing)
        raise HTTPException(409,'Save conflict. Please retry.')
    # Failed commits leave a durable upload intent, collected by the reconciliation job.
    return serialize(d)

@api.get('/detections')
def history(q:str=Query('',max_length=80),source:str=Query('all',pattern='^(all|image|camera)$'),page:int=Query(1,ge=1),u=Depends(current_user),db:Session=Depends(database)):
    filters=[Detection.user_id==u.id]
    if source!='all':filters.append(Detection.source_type==source)
    if q:filters.append(Detection.objects.any(DetectedObject.object_name.ilike('%'+q.replace('%','\\%').replace('_','\\_')+'%',escape='\\')))
    total=db.scalar(select(func.count()).select_from(Detection).where(*filters))
    rows=db.scalars(select(Detection).where(*filters).order_by(Detection.detected_at.desc()).offset((page-1)*12).limit(12)).all()
    return {'items':[serialize(d) for d in rows],'total':total,'page':page,'pages':(total+11)//12}

def owned(id,u,db):
    d=db.scalar(select(Detection).where(Detection.id==id,Detection.user_id==u.id))
    if not d:raise HTTPException(404,'Detection not found')
    return d

@api.get('/detections/{id}')
def detail(id:str,u=Depends(current_user),db:Session=Depends(database)):return serialize(owned(id,u,db))

@api.delete('/detections/{id}',status_code=204)
def remove(id:str,u=Depends(current_user),db:Session=Depends(database)):
    d=owned(id,u,db);job=StorageDeletion(public_id=d.image_public_id);db.add(job);db.delete(d);db.commit()
    try:storage.delete_asset(job.public_id);db.delete(job);db.commit()
    except Exception:db.rollback()  # durable retry queue; inaccessible via app immediately

def stats(u,db,days):
    filters=[Detection.user_id==u.id]
    if days:filters.append(Detection.detected_at>=now()-timedelta(days=days))
    total=db.scalar(select(func.count()).select_from(Detection).where(*filters))
    objects=db.execute(select(DetectedObject.object_name,func.count(),func.sum(DetectedObject.confidence)).join(Detection).where(*filters).group_by(DetectedObject.object_name).order_by(func.count().desc())).all()
    count=sum(r[1] for r in objects)
    summary={'total_detections':total,'total_objects':count,'unique_categories':len(objects),'average_confidence':sum(r[2] for r in objects)/count if count else 0,'most_detected':objects[0][0] if objects else None}
    return filters,summary,objects

@api.get('/dashboard/overview')
def overview(u=Depends(current_user),db:Session=Depends(database)):
    _,summary,_=stats(u,db,0)
    recent=db.scalars(select(Detection).where(Detection.user_id==u.id).order_by(Detection.detected_at.desc()).limit(4)).all()
    return {**summary,'recent':[serialize(d) for d in recent]}

@api.get('/analytics/summary')
def summary(days:int=Query(30,pattern=None),u=Depends(current_user),db:Session=Depends(database)):
    if days not in (0,7,30,90):raise HTTPException(422,'Invalid period')
    return stats(u,db,days)[1]

@api.get('/analytics/objects')
def objects(days:int=Query(30,ge=0,le=90),u=Depends(current_user),db:Session=Depends(database)):
    return [{'label':r[0],'count':r[1]} for r in stats(u,db,days)[2]]

@api.get('/analytics/sources')
def sources(days:int=Query(30,ge=0,le=90),u=Depends(current_user),db:Session=Depends(database)):
    filters,_,_=stats(u,db,days)
    return [{'label':r[0],'count':r[1]} for r in db.execute(select(Detection.source_type,func.count()).where(*filters).group_by(Detection.source_type))]

@api.get('/analytics/activity')
def activity(days:int=Query(30,ge=0,le=90),u=Depends(current_user),db:Session=Depends(database)):
    filters,_,_=stats(u,db,days)
    rows=db.execute(select(func.date(Detection.detected_at),func.count()).where(*filters).group_by(func.date(Detection.detected_at)).order_by(func.date(Detection.detected_at))).all()
    return [{'date':str(r[0]),'count':r[1]} for r in rows]

app.include_router(api)
