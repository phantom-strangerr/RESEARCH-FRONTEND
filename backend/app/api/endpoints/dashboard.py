from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import RecentPacket, RecentEvent, AlertDetail
from app.services.dashboard_service import get_recent_packets, get_recent_events, get_alerts

router = APIRouter()


@router.get("/recent-packets", response_model=list[RecentPacket])
def recent_packets(limit: int = 5, db: Session = Depends(get_db)):
    """Get recent packets for dashboard Packet Monitoring section."""
    return get_recent_packets(db, limit)


@router.get("/recent-events", response_model=list[RecentEvent])
def recent_events(limit: int = 5, db: Session = Depends(get_db)):
    """Get recent detection events for dashboard Recent Events section."""
    return get_recent_events(db, limit)


@router.get("/alerts", response_model=list[AlertDetail])
def alerts(db: Session = Depends(get_db)):
    """Get all alerts with full details for Alerts page."""
    return get_alerts(db)