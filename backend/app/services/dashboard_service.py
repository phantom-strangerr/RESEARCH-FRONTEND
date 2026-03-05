from sqlalchemy.orm import Session
from app.models.traffic_features import TrafficFeatures
from app.models.detection_event import DetectionEvents


def get_recent_packets(db: Session, limit: int = 5):
    return (
        db.query(TrafficFeatures)
        .order_by(TrafficFeatures.timestamp.desc())
        .limit(limit)
        .all()
    )


def get_recent_events(db: Session, limit: int = 5):
    results = (
        db.query(
            DetectionEvents.event_id,
            DetectionEvents.timestamp,
            DetectionEvents.attack_type,
            DetectionEvents.mitigation,
            TrafficFeatures.src_ip,
        )
        .outerjoin(TrafficFeatures, DetectionEvents.event_id == TrafficFeatures.event_id)
        .filter(DetectionEvents.attack_type != "Normal")
        .order_by(DetectionEvents.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {"event_id": r.event_id, "timestamp": r.timestamp, "attack_type": r.attack_type, "mitigation": r.mitigation, "src_ip": r.src_ip}
        for r in results
    ]


def get_alerts(db: Session):
    """Get all detection events with joined traffic data for Alerts page."""
    results = (
        db.query(
            DetectionEvents.event_id,
            DetectionEvents.timestamp,
            DetectionEvents.attack_type,
            DetectionEvents.severity,
            DetectionEvents.model_name,
            DetectionEvents.processing_latency_ms,
            DetectionEvents.mitigation,
            TrafficFeatures.src_ip,
            TrafficFeatures.dst_ip,
            TrafficFeatures.protocol,
            TrafficFeatures.byte_count,
            TrafficFeatures.packet_size,
        )
        .outerjoin(TrafficFeatures, DetectionEvents.event_id == TrafficFeatures.event_id)
        .order_by(DetectionEvents.timestamp.desc())
        .all()
    )

    return [
        {
            "event_id": r.event_id,
            "timestamp": r.timestamp,
            "attack_type": r.attack_type,
            "severity": r.severity,
            "model_name": r.model_name,
            "processing_latency_ms": r.processing_latency_ms,
            "mitigation": r.mitigation,
            "src_ip": r.src_ip,
            "dst_ip": r.dst_ip,
            "protocol": r.protocol,
            "byte_count": r.byte_count,
            "packet_size": r.packet_size,
            "src_mac": None,
            "dst_mac": None,
        }
        for r in results
    ]