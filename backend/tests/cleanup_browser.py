"""Delete only the exact ephemeral browser-test identity supplied on the command line."""
import sys
from sqlalchemy import select,delete
from app.db import Session
from app.models import User,UserSettings,AuthSession,UploadIntent,Detection,StorageDeletion
from app.storage import delete_asset

if __name__=='__main__':
    with Session() as db:
        user=db.get(User,sys.argv[1])
        if user and user.email.startswith('browser-check-') and user.email.endswith('@example.com'):
            detections=db.scalars(select(Detection).where(Detection.user_id==user.id)).all()
            for d in detections:delete_asset(d.image_public_id);db.delete(d)
            for intent in db.scalars(select(UploadIntent).where(UploadIntent.user_id==user.id)).all():
                if not intent.consumed:delete_asset(intent.public_id)
                db.delete(intent)
            for cls in (AuthSession,UserSettings):db.execute(delete(cls).where(cls.user_id==user.id))
            db.delete(user);db.commit();print('Removed ephemeral browser-test account')
