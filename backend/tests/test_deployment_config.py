from app.config import Config
import pytest

def settings(**overrides):
    values=dict(database_url='postgresql://user:pass@database.example/test?sslmode=require',jwt_secret_key='a'*48,frontend_url='https://web.example',cookie_secure=True,cloudinary_cloud_name='test',cloudinary_api_key='test-key',cloudinary_api_secret='test-secret',cron_secret='b'*48)
    return Config(_env_file=None,**(values|overrides))

def test_vercel_production_configuration(monkeypatch):
    monkeypatch.setenv('VERCEL','1')
    assert settings().allowed_origins==['https://web.example']
    for invalid in [dict(cookie_secure=False),dict(frontend_url='http://web.example'),dict(database_url='sqlite:///test.db'),dict(cron_secret=''),dict(cloudinary_api_secret='')]:
        with pytest.raises(ValueError):settings(**invalid)

def test_origins_and_cookie_combinations_are_validated(monkeypatch):
    monkeypatch.delenv('VERCEL',raising=False)
    assert settings(frontend_url='https://web.example/').frontend_url=='https://web.example'
    for invalid in [dict(frontend_url='https://web.example/path'),dict(cookie_samesite='invalid'),dict(cookie_samesite='none',cookie_secure=False)]:
        with pytest.raises(ValueError):settings(**invalid)
