from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.traffic_features import TrafficFeatures
from app.models.detection_event import DetectionEvents
from app.models.switch_port import SwitchPort
from datetime import datetime, timedelta, timezone


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
            TrafficFeatures.ml,
            TrafficFeatures.dl,
        )
        .outerjoin(TrafficFeatures, DetectionEvents.event_id == TrafficFeatures.event_id)
        .filter(DetectionEvents.attack_type != "Normal")
        .order_by(DetectionEvents.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "event_id": r.event_id,
            "timestamp": r.timestamp,
            "attack_type": r.attack_type,
            "mitigation": r.mitigation,
            "src_ip": r.src_ip,
            "ml": r.ml,
            "dl": r.dl,
        }
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


def get_dashboard_stats(db: Session):
    total_devices = db.query(SwitchPort).count()
    isolated_ports = db.query(SwitchPort).filter(SwitchPort.status == "isolated").count()
    return {"total_devices": total_devices, "isolated_ports": isolated_ports}


def get_traffic_timeline(db: Session, minutes: int = 10):
    """Aggregate traffic_features into per-minute buckets for the last N minutes."""
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=minutes)

    rows = (
        db.query(TrafficFeatures.timestamp, TrafficFeatures.classification)
        .filter(TrafficFeatures.timestamp >= start)
        .all()
    )

    # Build per-minute buckets
    buckets: dict[str, dict[str, int]] = {}
    for i in range(minutes):
        t = start + timedelta(minutes=i)
        label = t.strftime("%H:%M")
        buckets[label] = {"normal": 0, "attack": 0}

    for row in rows:
        ts = row.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        label = ts.strftime("%H:%M")
        if label in buckets:
            if row.classification and row.classification.lower() == "normal":
                buckets[label]["normal"] += 1
            else:
                buckets[label]["attack"] += 1

    return [
        {"time": label, "normal": v["normal"], "attack": v["attack"]}
        for label, v in buckets.items()
    ]


def get_link_health(db: Session, minutes: int = 10):
    """Derive link health metrics from traffic_features (last N minutes)."""
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=minutes)

    rows = (
        db.query(TrafficFeatures.classification, TrafficFeatures.timestamp)
        .filter(TrafficFeatures.timestamp >= start)
        .all()
    )

    total = len(rows)
    normal = sum(1 for r in rows if r.classification and r.classification.lower() == "normal")
    attack = total - normal
    success_rate = round((normal / total) * 100, 1) if total > 0 else 0.0
    packet_rate = round(total / minutes, 1)

    return {
        "total_packets": total,
        "normal_packets": normal,
        "attack_packets": attack,
        "success_rate": success_rate,
        "packet_rate_per_min": packet_rate,
        "window_minutes": minutes,
    }


def get_model_health(db: Session):
    """Count detections attributed to ML vs DL models from traffic_features."""
    rows = db.query(TrafficFeatures.ml, TrafficFeatures.dl, TrafficFeatures.classification).all()

    total = len(rows)
    ml_detections = sum(1 for r in rows if r.ml is True)
    dl_detections = sum(1 for r in rows if r.dl is True)
    ml_attacks = sum(1 for r in rows if r.ml is True and r.classification and r.classification.lower() != "normal")
    dl_attacks = sum(1 for r in rows if r.dl is True and r.classification and r.classification.lower() != "normal")

    return {
        "total_records": total,
        "ml_detections": ml_detections,
        "dl_detections": dl_detections,
        "ml_attacks_flagged": ml_attacks,
        "dl_attacks_flagged": dl_attacks,
    }