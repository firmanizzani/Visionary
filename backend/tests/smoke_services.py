"""Real Neon + Cloudinary smoke test. Creates and removes only its own ephemeral resources."""
import io
import secrets
from uuid import uuid4
from PIL import Image
import cloudinary.uploader
from fastapi.testclient import TestClient
from sqlalchemy import delete, select
from app.main import app
from app.db import Session
from app.models import User, UserSettings, AuthSession, UploadIntent, Detection, RateBucket
from app.config import config

def run():
    email=f'visionary-smoke-{uuid4().hex[:12]}@example.com';password=secrets.token_urlsafe(24)
    client=TestClient(app,headers={'Origin':config.frontend_url});uid=None;public_id=None;did=None
    try:
        r=client.post('/api/v1/auth/register',json={'full_name':'Service verification','email':email,'password':password,'confirm_password':password});assert r.status_code==201,r.status_code
        uid=r.json()['user']['id'];client.headers['X-CSRF-Token']=r.json()['csrf_token']
        print('PASS: register, Argon2id, session cookies, Neon persistence')
        r=client.post('/api/v1/storage/uploads');assert r.status_code==201,r.status_code
        signed=r.json();public_id=signed['public_id'];buf=io.BytesIO();Image.new('RGB',(64,48),(80,140,155)).save(buf,format='JPEG');buf.seek(0)
        result=cloudinary.uploader.upload(buf,public_id=public_id,type='authenticated',overwrite=False,allowed_formats=['jpg','jpeg','png','webp'])
        print('PASS: authenticated Cloudinary upload')
        payload={'upload_id':signed['upload_id'],'idempotency_key':str(uuid4()),'source_type':'image','model_version':'service-smoke-no-inference','confidence_threshold':.5,'width':64,'height':48,'detected_at':'2026-11-19T00:00:00Z','objects':[]}
        r=client.post('/api/v1/detections',json=payload);assert r.status_code==201,r.status_code
        did=r.json()['id'];url=r.json()['image_url']
        import httpx
        delivery=httpx.get(url);assert delivery.status_code==200,delivery.status_code
        print('PASS: metadata save, private signed delivery, image dimensions')
        assert client.post('/api/v1/detections',json=payload).json()['id']==did
        assert client.get('/api/v1/detections').json()['total']==1
        assert client.get('/api/v1/analytics/summary?days=0').json()['total_detections']==1
        assert client.get('/api/v1/detections/'+did).status_code==200
        print('PASS: idempotency, history, detail, database analytics')
        assert client.delete('/api/v1/detections/'+did).status_code==204;did=None;public_id=None
        assert client.get('/api/v1/analytics/summary?days=0').json()['total_detections']==0
        assert client.post('/api/v1/auth/logout').status_code==204
        assert client.get('/api/v1/auth/me').status_code==401
        print('PASS: delete, analytics update, logout revocation')
    finally:
        if public_id:
            cloudinary.uploader.destroy(public_id,type='authenticated',invalidate=True)
        if uid:
            with Session() as db:
                # Production has FK cascades. Explicit cleanup is intentionally restricted to this test identity.
                for cls in (AuthSession,UserSettings,UploadIntent,Detection):db.execute(delete(cls).where(cls.user_id==uid))
                db.execute(delete(User).where(User.id==uid));db.commit()
        print('Removed ephemeral service-test resources')
if __name__=='__main__':run()
