from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone


class TrafficFeaturesBase(BaseModel):
    src_ip: str = Field(..., max_length=45)
    dst_ip: str = Field(..., max_length=45)
    protocol: str = Field(..., max_length=10)
    byte_count: int
    packet_size: float
    ttl: float
    timestamp: Optional[datetime] = None
    classification: str = Field(..., max_length=50)
    ml: bool | None = None
    dl: bool | None = None


class TrafficFeaturesCreate(TrafficFeaturesBase):
    feature_id: Optional[UUID] = None
    event_id: UUID


class TrafficFeatures(TrafficFeaturesBase):
    feature_id: UUID
    event_id: UUID
    timestamp: datetime

    @field_validator('timestamp', mode='before')
    @classmethod
    def ensure_utc(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    class Config:
        from_attributes = True