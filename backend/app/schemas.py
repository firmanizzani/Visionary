from typing import Literal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

class Schema(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='forbid', allow_inf_nan=False)
class Register(Schema):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str
    @model_validator(mode='after')
    def passwords(self):
        if self.password != self.confirm_password: raise ValueError('Passwords do not match')
        self.full_name = self.full_name.strip()
        if not self.full_name: raise ValueError('Name is required')
        return self
class Login(Schema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
class Profile(Schema):
    full_name: str = Field(min_length=1, max_length=120)
class Password(Schema):
    current_password: str = Field(max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
class Settings(Schema):
    confidence_threshold: float = Field(ge=.1, le=.95)
    visualization_mode: Literal['box','mask','both']
    show_confidence: bool
    preferred_camera: str | None = Field(default=None, max_length=256)
class Mask(Schema):
    width: int = Field(ge=1, le=160)
    height: int = Field(ge=1, le=160)
    rle: list[int] = Field(max_length=25601)
    @model_validator(mode='after')
    def validate_runs(self):
        if any(v < 0 for v in self.rle) or sum(self.rle) != self.width*self.height: raise ValueError('Invalid mask RLE')
        return self
class ObjectInput(Schema):
    class_id: int = Field(ge=0, le=79)
    object_name: str = Field(min_length=1, max_length=80)
    confidence: float = Field(ge=0, le=1)
    bounding_box: tuple[float,float,float,float]
    segmentation_data: Mask | None = None
class DetectionInput(Schema):
    upload_id: str = Field(max_length=36)
    idempotency_key: str = Field(min_length=16, max_length=64)
    source_type: Literal['image','camera']
    model_version: str = Field(min_length=1, max_length=100)
    confidence_threshold: float = Field(ge=.1, le=.95)
    width: int = Field(ge=1, le=4096)
    height: int = Field(ge=1, le=4096)
    detected_at: datetime
    objects: list[ObjectInput] = Field(max_length=100)
    @model_validator(mode='after')
    def validate_boxes(self):
        if self.detected_at.tzinfo is None: raise ValueError('Timestamp must include timezone')
        for o in self.objects:
            x1,y1,x2,y2 = o.bounding_box
            if not (0 <= x1 < x2 <= self.width and 0 <= y1 < y2 <= self.height): raise ValueError('Box is outside image')
            if o.confidence < self.confidence_threshold: raise ValueError('Object confidence below threshold')
        return self
