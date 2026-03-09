from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone


def _ensure_utc(v: datetime) -> datetime:
    if v.tzinfo is None:
        return v.replace(tzinfo=timezone.utc)
    return v


class RecentPacket(BaseModel):
    timestamp: datetime
    src_ip: str
    classification: str

    @field_validator('timestamp', mode='before')
    @classmethod
    def normalize_timestamp(cls, v):
        if isinstance(v, datetime):
            return _ensure_utc(v)
        return v

    class Config:
        from_attributes = True


class RecentEvent(BaseModel):
    event_id: UUID
    timestamp: datetime
    attack_type: str
    src_ip: Optional[str] = None
    mitigation: Optional[str] = None
    ml: Optional[bool] = None
    dl: Optional[bool] = None

    @field_validator('timestamp', mode='before')
    @classmethod
    def normalize_timestamp(cls, v):
        if isinstance(v, datetime):
            return _ensure_utc(v)
        return v

    class Config:
        from_attributes = True


class AlertDetail(BaseModel):
    event_id: UUID
    timestamp: datetime
    attack_type: str
    severity: str
    model_name: str
    processing_latency_ms: float
    mitigation: Optional[str] = None
    # Joined from traffic_features
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    protocol: Optional[str] = None
    byte_count: Optional[int] = None
    packet_size: Optional[float] = None
    ml: Optional[bool] = None
    dl: Optional[bool] = None
    # Joined from event_context
    src_mac: Optional[str] = None
    dst_mac: Optional[str] = None

    class Config:
        from_attributes = True
