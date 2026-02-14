from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class EventContextBase(BaseModel):
    src_mac: str = Field(..., max_length=17)
    dst_mac: str = Field(..., max_length=17)


class EventContextCreate(EventContextBase):
    context_id: Optional[UUID] = None
    event_id: UUID


class EventContext(EventContextBase):
    context_id: UUID
    event_id: UUID

    class Config:
        from_attributes = True