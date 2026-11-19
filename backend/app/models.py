from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import String, DateTime, ForeignKey, Float, Integer, Boolean, JSON, UniqueConstraint, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

def now(): return datetime.now(timezone.utc)
def uid(): return str(uuid4())
json_type = JSON().with_variant(JSONB, 'postgresql')

class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class UserSettings(Base):
    __tablename__ = 'user_settings'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    confidence_threshold: Mapped[float] = mapped_column(Float, default=.5)
    visualization_mode: Mapped[str] = mapped_column(String(8), default='both')
    show_confidence: Mapped[bool] = mapped_column(Boolean, default=True)
    preferred_camera: Mapped[str | None] = mapped_column(String(256), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    __table_args__ = (CheckConstraint('confidence_threshold >= 0.1 AND confidence_threshold <= 0.95'),)

class AuthSession(Base):
    __tablename__ = 'auth_sessions'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    csrf_token: Mapped[str] = mapped_column(String(128))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

class Detection(Base):
    __tablename__ = 'detections'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    idempotency_key: Mapped[str] = mapped_column(String(64))
    source_type: Mapped[str] = mapped_column(String(8))
    image_public_id: Mapped[str] = mapped_column(String(256))
    image_format: Mapped[str] = mapped_column(String(8), default='jpg')
    width: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)
    model_version: Mapped[str] = mapped_column(String(100))
    confidence_threshold: Mapped[float] = mapped_column(Float)
    total_objects: Mapped[int] = mapped_column(Integer)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    objects: Mapped[list['DetectedObject']] = relationship(cascade='all, delete-orphan', lazy='selectin')
    __table_args__ = (UniqueConstraint('user_id', 'idempotency_key'), Index('ix_detection_owner_time', 'user_id', 'detected_at'), CheckConstraint("source_type IN ('camera','image')"), CheckConstraint('total_objects >= 0'))

class DetectedObject(Base):
    __tablename__ = 'detected_objects'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    detection_id: Mapped[str] = mapped_column(ForeignKey('detections.id', ondelete='CASCADE'), index=True)
    class_id: Mapped[int] = mapped_column(Integer)
    object_name: Mapped[str] = mapped_column(String(80))
    confidence: Mapped[float] = mapped_column(Float)
    bounding_box: Mapped[list] = mapped_column(json_type)
    segmentation_data: Mapped[dict | None] = mapped_column(json_type, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class UploadIntent(Base):
    __tablename__ = 'upload_intents'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    public_id: Mapped[str] = mapped_column(String(256), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    consumed: Mapped[bool] = mapped_column(Boolean, default=False)

class StorageDeletion(Base):
    __tablename__ = 'storage_deletions'
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    public_id: Mapped[str] = mapped_column(String(256), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class RateBucket(Base):
    __tablename__ = 'rate_buckets'
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    window: Mapped[int] = mapped_column(Integer)
    count: Mapped[int] = mapped_column(Integer, default=1)
