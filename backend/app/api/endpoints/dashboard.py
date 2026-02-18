from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import RecentPacket
from app.services.dashboard_service import get_recent_packets

router = APIRouter()


@router.get("/recent-packets", response_model=list[RecentPacket])
def recent_packets(limit: int = 5, db: Session = Depends(get_db)):
    """Get recent packets for dashboard Packet Monitoring section."""
    return get_recent_packets(db, limit)