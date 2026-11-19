import os
import tempfile
os.environ['DATABASE_URL']='sqlite:///'+tempfile.mktemp(suffix='.db')
os.environ['JWT_SECRET_KEY']='test-only-secret-with-at-least-32-characters'
os.environ['CLOUDINARY_CLOUD_NAME']='test'
os.environ['FRONTEND_URL']='http://localhost:5173'
from fastapi.testclient import TestClient
from app.main import app
from app.db import engine, Base
from app import storage
from app.models import User, AuthSession, StorageDeletion
from app.schemas import DetectionInput
from sqlalchemy import select
from app.db import Session
import pytest

Base.metadata.create_all(engine)
def account(email):
    c=TestClient(app,headers={'Origin':'http://localhost:5173'})
    r=c.post('/api/v1/auth/register',json={'full_name':'Integration Test','email':email,'password':'A-real-test-pass123','confirm_password':'A-real-test-pass123'})
    assert r.status_code==201,r.text
    c.headers['X-CSRF-Token']=r.json()['csrf_token']
    return c

def test_auth_csrf_rotation_and_logout():
    c=account('auth@example.com')
    assert 'HttpOnly' in c.get('/api/v1/auth/me').request.headers.get('cookie','') or c.cookies.get('visionary_access')
    assert c.get('/api/v1/auth/me').status_code==200
    token=c.headers.pop('X-CSRF-Token')
    assert c.patch('/api/v1/users/me',json={'full_name':'Changed'}).status_code==403
    c.headers['X-CSRF-Token']=token
    r=c.post('/api/v1/auth/refresh');assert r.status_code==200
    assert r.json()['csrf_token']!=token
    c.headers['X-CSRF-Token']=r.json()['csrf_token']
    assert c.patch('/api/v1/users/me',json={'full_name':'Changed'}).status_code==200
    assert c.post('/api/v1/auth/logout').status_code==204
    assert c.get('/api/v1/auth/me').status_code==401
    assert c.post('/api/v1/auth/login',json={'email':'auth@example.com','password':'incorrect'}).status_code==401
    assert c.post('/api/v1/auth/login',json={'email':'auth@example.com','password':'A-real-test-pass123'}).status_code==200

def test_history_ownership_idempotency_analytics_and_cleanup(monkeypatch):
    monkeypatch.setattr(storage,'upload_signature',lambda pid:{'public_id':pid})
    monkeypatch.setattr(storage,'inspect_asset',lambda pid:{'bytes':500,'format':'jpg','width':640,'height':480})
    monkeypatch.setattr(storage,'image_url',lambda *a:'https://private.example/temporary')
    monkeypatch.setattr(storage,'delete_asset',lambda pid:None)
    a,b=account('owner@example.com'),account('other@example.com')
    upload=a.post('/api/v1/storage/uploads').json()['upload_id']
    payload={'upload_id':upload,'idempotency_key':'test-idempotency-key-123','source_type':'image','model_version':'test','confidence_threshold':.5,'width':640,'height':480,'detected_at':'2026-11-19T00:00:00Z','objects':[{'class_id':0,'object_name':'person','confidence':.9,'bounding_box':[10,20,100,200],'segmentation_data':{'width':2,'height':2,'rle':[0,4]}}]}
    r=a.post('/api/v1/detections',json=payload);assert r.status_code==201,r.text
    id=r.json()['id'];assert a.post('/api/v1/detections',json=payload).json()['id']==id
    assert b.get('/api/v1/detections/'+id).status_code==404
    assert b.delete('/api/v1/detections/'+id).status_code==404
    assert b.get('/api/v1/detections').json()['total']==0
    assert a.get('/api/v1/detections?q=person&source=image').json()['total']==1
    assert a.get('/api/v1/detections?q=bottle').json()['total']==0
    summary=a.get('/api/v1/analytics/summary?days=0').json()
    assert summary['total_detections']==1 and summary['total_objects']==1 and summary['average_confidence']==.9
    assert a.get('/api/v1/analytics/objects?days=0').json()==[{'label':'person','count':1}]
    monkeypatch.setattr(storage,'delete_asset',lambda pid:(_ for _ in []).throw(RuntimeError('Storage unavailable')))
    assert a.delete('/api/v1/detections/'+id).status_code==204
    assert a.get('/api/v1/analytics/summary?days=0').json()['total_objects']==0
    with Session() as db:assert db.scalar(select(StorageDeletion)) is not None

def test_validation_settings_password_and_origin():
    c=account('settings@example.com')
    settings={'confidence_threshold':.75,'visualization_mode':'mask','show_confidence':False,'preferred_camera':None}
    assert c.patch('/api/v1/users/settings',json=settings).status_code==200
    assert c.get('/api/v1/users/settings').json()==settings
    assert c.patch('/api/v1/users/settings',json={**settings,'confidence_threshold':1.5}).status_code==422
    assert c.patch('/api/v1/users/me',json={'full_name':'x'},headers={'Origin':'https://evil.example'}).status_code==403
    assert c.patch('/api/v1/auth/password',json={'current_password':'wrong','new_password':'password1234'}).status_code==400
    assert c.patch('/api/v1/auth/password',json={'current_password':'A-real-test-pass123','new_password':'password1234'}).status_code==204
    assert c.get('/api/v1/auth/me').status_code==401

def test_extended_vocabulary_validation():
    from app.schemas import ObjectInput
    obj=ObjectInput(class_id=1155,object_name='wallet',confidence=.8,bounding_box=(0,0,100,100))
    assert obj.class_id==1155
    with pytest.raises(ValueError):ObjectInput(class_id=10000,object_name='invalid',confidence=.8,bounding_box=(0,0,100,100))

def test_loopback_login_refresh_and_origin_bounds():
    from app.config import config
    for index, origin in enumerate(config.allowed_origins):
        c=TestClient(app,base_url=origin,headers={'Origin':origin})
        payload={'full_name':'Local origin test','email':f'loopback-{index}@example.com','password':'A-real-test-pass123','confirm_password':'A-real-test-pass123'}
        r=c.post('/api/v1/auth/register',json=payload)
        assert r.status_code==201,r.text
        c.headers['X-CSRF-Token']=r.json()['csrf_token']
        assert c.post('/api/v1/auth/logout').status_code==204
        r=c.post('/api/v1/auth/login',json={'email':payload['email'],'password':payload['password']})
        assert r.status_code==200,r.text
        c.headers.pop('X-CSRF-Token')
        assert c.post('/api/v1/auth/refresh').status_code==200
        assert c.patch('/api/v1/users/me',json={'full_name':'Needs CSRF'}).status_code==403
        preflight=c.options('/api/v1/auth/login',headers={'Access-Control-Request-Method':'POST'})
        assert preflight.headers['access-control-allow-origin']==origin
    for origin in ['http://localhost:5199','https://localhost:5173','http://localhost.evil.example:5173','https://evil.example','null']:
        assert TestClient(app).post('/api/v1/auth/login',headers={'Origin':origin},json={}).status_code==403

def test_production_origin_stays_exact():
    from app.config import Config
    for frontend, secure in [('https://visionary.example',False),('http://127.0.0.1:5173',True)]:
        settings=Config(frontend_url=frontend,cookie_secure=secure)
        assert settings.allowed_origins==[frontend]
