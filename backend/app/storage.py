import time
import cloudinary
import cloudinary.api
import cloudinary.uploader
import cloudinary.utils
from fastapi import HTTPException
from .config import config

cloudinary.config(cloud_name=config.cloudinary_cloud_name, api_key=config.cloudinary_api_key, api_secret=config.cloudinary_api_secret, secure=True)
def ensure_storage():
    if not all([config.cloudinary_cloud_name,config.cloudinary_api_key,config.cloudinary_api_secret]): raise HTTPException(503,'Private image storage is not configured')
def upload_signature(public_id):
    ensure_storage()
    params={'timestamp':int(time.time()), 'public_id':public_id, 'type':'authenticated', 'overwrite':'false', 'allowed_formats':'jpg,jpeg,png,webp'}
    return {**params, 'signature':cloudinary.utils.api_sign_request(params,config.cloudinary_api_secret), 'api_key':config.cloudinary_api_key, 'cloud_name':config.cloudinary_cloud_name}
def inspect_asset(public_id):
    ensure_storage()
    try: return cloudinary.api.resource(public_id, resource_type='image', type='authenticated')
    except Exception: raise HTTPException(422,'Uploaded image could not be verified. Please retry the save.')
def image_url(public_id, fmt):
    return cloudinary.utils.private_download_url(public_id, fmt, type='authenticated', expires_at=int(time.time())+300, attachment=False)
def delete_asset(public_id):
    ensure_storage()
    result=cloudinary.uploader.destroy(public_id, resource_type='image', type='authenticated', invalidate=True)
    if result.get('result') not in ('ok','not found'): raise RuntimeError('Storage deletion failed')
