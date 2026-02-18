from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class RecentPacket(BaseModel):
    timestamp: datetime
    src_ip: str
    classification: str

    class Config:
        from_attributes = True


class RecentEvent(BaseModel):
    event_id: UUID
    timestamp: datetime
    attack_type: str
    src_ip: Optional[str] = None
    mitigation: str

    class Config:
        from_attributes = True


class AlertDetail(BaseModel):
    event_id: UUID
    timestamp: datetime
    attack_type: str
    severity: str
    model_name: str
    processing_latency_ms: float
    mitigation: str
    # Joined from traffic_features
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    protocol: Optional[str] = None
    byte_count: Optional[int] = None
    packet_size: Optional[int] = None
    # Joined from event_context
    src_mac: Optional[str] = None
    dst_mac: Optional[str] = None

    class Config:
        from_attributes = True