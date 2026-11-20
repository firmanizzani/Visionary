import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from urllib.parse import urlsplit, parse_qs

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

    @field_validator('frontend_url')
    @classmethod
    def frontend_origin(cls, value):
        value=value.strip().rstrip('/')
        u=urlsplit(value)
        if u.scheme not in ('http','https') or not u.hostname or u.username or u.password or u.path or u.query or u.fragment:
            raise ValueError('FRONTEND_URL must be a complete frontend origin without a path')
        return value

    @model_validator(mode='after')
    def production_settings(self):
        if self.cookie_samesite not in ('lax','strict','none'):
            raise ValueError('COOKIE_SAMESITE must be lax, strict, or none')
        if self.cookie_samesite=='none' and not self.cookie_secure:
            raise ValueError('SameSite=None requires COOKIE_SECURE=true')
        if os.getenv('VERCEL','').lower() in ('1','true'):
            if not self.frontend_url.startswith('https://') or not self.cookie_secure:
                raise ValueError('Vercel requires an HTTPS FRONTEND_URL and COOKIE_SECURE=true')
            if len(self.jwt_secret_key)<32 or 'replace-with' in self.jwt_secret_key:
                raise ValueError('Set a stable JWT_SECRET_KEY of at least 32 characters')
            if not all((self.cloudinary_cloud_name,self.cloudinary_api_key,self.cloudinary_api_secret)) or len(self.cron_secret)<32:
                raise ValueError('Set all Cloudinary credentials and a CRON_SECRET of at least 32 characters')
            u=urlsplit(self.database_url)
            if not u.scheme.startswith('postgresql') or parse_qs(u.query).get('sslmode',[''])[0] not in ('require','verify-ca','verify-full'):
                raise ValueError('Use a PostgreSQL DATABASE_URL with TLS (sslmode=require) on Vercel')
        return self

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
