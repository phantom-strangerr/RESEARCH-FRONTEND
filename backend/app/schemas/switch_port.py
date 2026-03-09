from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class SwitchPortBase(BaseModel):
    port_number: int
    status: str = Field(default="active", max_length=20)
    device_ip: Optional[str] = None
    device_mac: Optional[str] = None
    device_name: Optional[str] = None
    vlan: Optional[int] = None
    speed: Optional[str] = None
    bytes_sent: float = 0
    bytes_received: float = 0
    errors: int = 0
    drops: int = 0


class SwitchPortCreate(SwitchPortBase):
    port_id: Optional[UUID] = None
    last_activity: Optional[datetime] = None


class SwitchPortUpdate(BaseModel):
    status: Optional[str] = None
    device_ip: Optional[str] = None
    device_mac: Optional[str] = None
    device_name: Optional[str] = None
    vlan: Optional[int] = None
    speed: Optional[str] = None
    bytes_sent: Optional[float] = None
    bytes_received: Optional[float] = None
    errors: Optional[int] = None
    drops: Optional[int] = None
    last_activity: Optional[datetime] = None
    original_vlan: Optional[int] = None


class SwitchPortIsolate(BaseModel):
    reason: str = Field(..., max_length=500)
    isolated_by: str = Field(default="manual", max_length=20)
    alert_event_id: Optional[UUID] = None


class SwitchPortOut(SwitchPortBase):
    port_id: UUID
    isolation_reason: Optional[str] = None
    isolated_at: Optional[datetime] = None
    isolated_by: Optional[str] = None
    original_vlan: Optional[int] = None
    last_activity: Optional[datetime] = None
    alert_event_id: Optional[UUID] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
