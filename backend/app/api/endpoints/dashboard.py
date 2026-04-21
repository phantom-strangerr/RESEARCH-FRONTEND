from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dashboard import RecentPacket, RecentEvent, AlertDetail
from app.services.dashboard_service import get_recent_packets, get_recent_events, get_alerts, get_dashboard_stats, get_traffic_timeline, get_link_health, get_model_health, get_attack_distribution

router = APIRouter()


@router.get("/recent-packets", response_model=list[RecentPacket])
def recent_packets(limit: int = Query(default=5, ge=1, le=100), db: Session = Depends(get_db)):
    """Get recent packets for dashboard Packet Monitoring section."""
    return get_recent_packets(db, limit)


@router.get("/recent-events", response_model=list[RecentEvent])
def recent_events(limit: int = Query(default=5, ge=1, le=100), db: Session = Depends(get_db)):
    """Get recent detection events for dashboard Recent Events section."""
    return get_recent_events(db, limit)


@router.get("/alerts", response_model=list[AlertDetail])
def alerts(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """Get alerts with full details for Alerts page (paginated)."""
    return get_alerts(db, limit, offset)


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    """Get key dashboard metrics: total devices and isolated ports."""
    return get_dashboard_stats(db)


@router.get("/traffic-timeline")
def traffic_timeline(minutes: int = Query(default=10, ge=1, le=60), db: Session = Depends(get_db)):
    """Get per-minute normal vs attack packet counts for the last N minutes."""
    return get_traffic_timeline(db, minutes)


@router.get("/link-health")
def link_health(minutes: int = Query(default=10, ge=1, le=60), db: Session = Depends(get_db)):
    """Get live link health metrics derived from traffic_features."""
    return get_link_health(db, minutes)


@router.get("/attack-distribution")
def attack_distribution(db: Session = Depends(get_db)):
    """Get total attack event counts grouped by attack type across all records."""
    return get_attack_distribution(db)


@router.get("/model-health")
def model_health(db: Session = Depends(get_db)):
    """Get ML vs DL detection counts from traffic_features."""
    return get_model_health(db)