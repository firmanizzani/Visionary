from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    database_url: str
    jwt_secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cloudinary_cloud_name: str = ''
    cloudinary_api_key: str = ''
    cloudinary_api_secret: str = ''
    frontend_url: str = 'http://127.0.0.1:5173'
    cookie_secure: bool = False
    cookie_samesite: str = 'lax'
    cron_secret: str = ''
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

config = Config()
if len(config.jwt_secret_key) < 32:
    raise RuntimeError('JWT_SECRET_KEY must contain at least 32 characters')
