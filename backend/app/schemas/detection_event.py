from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class DetectionEventsBase(BaseModel):
    attack_type: str = Field(..., max_length=100)
    severity: str = Field(..., max_length=50)
    model_name: str = Field(..., max_length=100)
    processing_latency_ms: float


class DetectionEventsCreate(DetectionEventsBase):
    event_id: Optional[UUID] = None
    timestamp: Optional[datetime] = None


class DetectionEvents(DetectionEventsBase):
    event_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True