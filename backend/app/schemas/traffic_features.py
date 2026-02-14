from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class TrafficFeaturesBase(BaseModel):
    src_ip: str = Field(..., max_length=45)
    dst_ip: str = Field(..., max_length=45)
    protocol: str = Field(..., max_length=10)
    packet_count: int
    byte_count: int
    packet_rate: float
    flow_duration_ms: float
    avg_inter_arrival_time_ms: float
    avg_packet_size: float
    ttl_avg: float


class TrafficFeaturesCreate(TrafficFeaturesBase):
    feature_id: Optional[UUID] = None
    event_id: UUID


class TrafficFeatures(TrafficFeaturesBase):
    feature_id: UUID
    event_id: UUID

    class Config:
        from_attributes = True