from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class DeviceHealthLogsBase(BaseModel):
    cpu_usage_percent: float = Field(..., ge=0.0, le=100.0)
    memory_usage_percent: float = Field(..., ge=0.0, le=100.0)
    disk_usage_percent: float = Field(..., ge=0.0, le=100.0)
    network_rx_bytes: int
    network_tx_bytes: int


class DeviceHealthLogsCreate(DeviceHealthLogsBase):
    health_id: Optional[UUID] = None
    timestamp: Optional[datetime] = None


class DeviceHealthLogs(DeviceHealthLogsBase):
    health_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True