from pydantic import BaseModel
from datetime import datetime


class RecentPacket(BaseModel):
    timestamp: datetime
    src_ip: str
    classification: str

    class Config:
        from_attributes = True