from sqlalchemy.orm import Session
from app.models.traffic_features import TrafficFeatures


def get_recent_packets(db: Session, limit: int = 5):
    """Get the most recent packets for dashboard Packet Monitoring section."""
    return (
        db.query(TrafficFeatures)
        .order_by(TrafficFeatures.timestamp.desc())
        .limit(limit)
        .all()
    )