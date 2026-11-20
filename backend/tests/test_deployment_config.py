from app.config import Config
import pytest
from pathlib import Path
import tomllib


def test_project_declares_every_runtime_dependency():
    root = Path(__file__).resolve().parents[1]
    project = tomllib.loads((root/'pyproject.toml').read_text())
    requirements = {line.strip() for line in (root/'requirements.txt').read_text().splitlines() if line.strip() and not line.startswith('#')}
    assert set(project['project']['dependencies']) == requirements
    assert any(item.startswith('fastapi==') for item in project['project']['dependencies'])
    assert project['tool']['vercel']['entrypoint'] == 'app.main:app'

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
