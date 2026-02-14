from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class SystemLogsBase(BaseModel):
    log_level: str = Field(..., max_length=20)
    log_source: str = Field(..., max_length=100)
    message: str = Field(..., max_length=1000)


class SystemLogsCreate(SystemLogsBase):
    log_id: Optional[UUID] = None
    event_id: Optional[UUID] = None
    timestamp: Optional[datetime] = None


class SystemLogs(SystemLogsBase):
    log_id: UUID
    timestamp: datetime
    event_id: Optional[UUID] = None

    class Config:
        from_attributes = True