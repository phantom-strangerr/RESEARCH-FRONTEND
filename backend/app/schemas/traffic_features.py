from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class TrafficFeaturesBase(BaseModel):
    src_ip: str = Field(..., max_length=45)
    dst_ip: str = Field(..., max_length=45)
    protocol: str = Field(..., max_length=10)
    byte_count: int
    packet_size: float
    ttl: float
    timestamp: Optional[datetime] = None
    classification: str = Field(..., max_length=50)


class TrafficFeaturesCreate(TrafficFeaturesBase):
    feature_id: Optional[UUID] = None
    event_id: UUID


class TrafficFeatures(TrafficFeaturesBase):
    feature_id: UUID
    event_id: UUID

    class Config:
        from_attributes = True