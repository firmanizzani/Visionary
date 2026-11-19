from pydantic_settings import BaseSettings, SettingsConfigDict
from urllib.parse import urlsplit

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

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_url]
        frontend = urlsplit(self.frontend_url)
        # Local development supports the two explicit loopback hostnames at the same
        # configured port. Production and other ports still require an exact origin.
        if not self.cookie_secure and frontend.scheme == 'http' and frontend.hostname in ('localhost', '127.0.0.1'):
            alias = 'localhost' if frontend.hostname == '127.0.0.1' else '127.0.0.1'
            port = f':{frontend.port}' if frontend.port is not None else ''
            origins.append(f'http://{alias}{port}')
        return origins

config = Config()
if len(config.jwt_secret_key) < 32:
    raise RuntimeError('JWT_SECRET_KEY must contain at least 32 characters')
