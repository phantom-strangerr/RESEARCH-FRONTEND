from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import RecentPacket, RecentEvent, AlertDetail
from app.services.dashboard_service import get_recent_packets, get_recent_events, get_alerts, get_dashboard_stats, get_traffic_timeline, get_link_health, get_model_health

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


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    """Get key dashboard metrics: total devices and isolated ports."""
    return get_dashboard_stats(db)


@router.get("/traffic-timeline")
def traffic_timeline(minutes: int = 10, db: Session = Depends(get_db)):
    """Get per-minute normal vs attack packet counts for the last N minutes."""
    return get_traffic_timeline(db, minutes)


@router.get("/link-health")
def link_health(db: Session = Depends(get_db)):
    """Get live link health metrics derived from traffic_features."""
    return get_link_health(db)


@router.get("/model-health")
def model_health(db: Session = Depends(get_db)):
    """Get ML vs DL detection counts from traffic_features."""
    return get_model_health(db)