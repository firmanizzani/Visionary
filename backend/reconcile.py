"""Run hourly using an external scheduler: python reconcile.py. Idempotent storage cleanup."""
from datetime import timedelta
from sqlalchemy import select, delete
from app.db import Session
from app.models import UploadIntent, StorageDeletion, RateBucket, AuthSession, now
from app.storage import delete_asset

def reconcile():
    with Session() as db:
        stale=db.scalars(select(UploadIntent).where(UploadIntent.consumed==False,UploadIntent.expires_at<now()-timedelta(hours=1)).limit(100)).all()
        for intent in stale:
            try:delete_asset(intent.public_id);db.delete(intent);db.commit()
            except Exception:db.rollback()
        for job in db.scalars(select(StorageDeletion).limit(100)).all():
            try:delete_asset(job.public_id);db.delete(job);db.commit()
            except Exception:db.rollback()
        db.execute(delete(AuthSession).where(AuthSession.expires_at<now()))
        db.execute(delete(RateBucket).where(RateBucket.window<int(now().timestamp()//900)-4))
        db.execute(delete(UploadIntent).where(UploadIntent.consumed==True,UploadIntent.created_at<now()-timedelta(days=7)))
        db.commit()
if __name__=='__main__':reconcile()
