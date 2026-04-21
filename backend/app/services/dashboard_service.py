from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.traffic_features import TrafficFeatures
from app.models.detection_event import DetectionEvents
from app.models.switch_port import SwitchPort
from datetime import datetime, timedelta, timezone


def get_recent_packets(db: Session, limit: int = 5):
    results = (
        db.query(TrafficFeatures.timestamp, TrafficFeatures.src_ip, TrafficFeatures.classification)
        .order_by(TrafficFeatures.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {"timestamp": r.timestamp, "src_ip": r.src_ip, "classification": r.classification}
        for r in results
    ]


_ATTACK_TYPE_ALIASES = {
    "spoof":    "Spoofing",
    "spoofing": "Spoofing",
    "dos":      "DOS",
    "mirai":    "Mirai",
    "replay":   "Replay",
}

def _normalize_attack_type(raw: str) -> str:
    return _ATTACK_TYPE_ALIASES.get(raw.strip().lower(), raw)


def get_recent_events(db: Session, limit: int = 5):
    # Query directly from TrafficFeatures — it holds src_ip, ml, dl, and
    # classification, so no join is needed.  event_id is the FK to
    # detection_events and doubles as the unique event identifier.
    results = (
        db.query(
            TrafficFeatures.event_id,
            TrafficFeatures.timestamp,
            TrafficFeatures.classification,
            TrafficFeatures.src_ip,
            TrafficFeatures.ml,
            TrafficFeatures.dl,
        )
        .filter(TrafficFeatures.classification != "Normal")
        .order_by(TrafficFeatures.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "event_id": str(r.event_id),
            "timestamp": r.timestamp,
            "attack_type": _normalize_attack_type(r.classification),
            "src_ip": r.src_ip,
            "ml": r.ml,
            "dl": r.dl,
        }
        for r in results
    ]


def get_alerts(db: Session, limit: int = 50, offset: int = 0):
    """Get detection events with joined traffic data for Alerts page (paginated)."""
    results = (
        db.query(
            TrafficFeatures.event_id,
            TrafficFeatures.timestamp,
            TrafficFeatures.classification,
            TrafficFeatures.src_ip,
            TrafficFeatures.dst_ip,
            TrafficFeatures.protocol,
            TrafficFeatures.byte_count,
            TrafficFeatures.packet_size,
            TrafficFeatures.ml,
            TrafficFeatures.dl,
            DetectionEvents.severity,
            DetectionEvents.model_name,
            DetectionEvents.processing_latency_ms,
            DetectionEvents.mitigation,
        )
        .join(DetectionEvents, TrafficFeatures.event_id == DetectionEvents.event_id)
        .order_by(TrafficFeatures.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "event_id": str(r.event_id),
            "timestamp": r.timestamp,
            "attack_type": _normalize_attack_type(r.classification),
            "severity": r.severity,
            "model_name": r.model_name,
            "processing_latency_ms": r.processing_latency_ms,
            "mitigation": r.mitigation,
            "src_ip": r.src_ip,
            "dst_ip": r.dst_ip,
            "protocol": r.protocol,
            "byte_count": r.byte_count,
            "packet_size": r.packet_size,
            "ml": r.ml,
            "dl": r.dl,
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
    """Aggregate traffic_features into per-minute buckets for the last N minutes.

    Anchors the window to the most recent timestamp in the table so the chart
    always shows data regardless of timezone differences between the edge device
    and the backend server.
    """
    from sqlalchemy import func as sqlfunc

    # Use the latest stored timestamp as anchor (timezone-safe)
    latest_ts = db.query(sqlfunc.max(TrafficFeatures.timestamp)).scalar()
    if latest_ts is None:
        return [{"time": "—", "normal": 0, "attack": 0}]

    # Keep timezone info consistent: strip tz for label arithmetic,
    # but use the original tz-aware value for the DB filter.
    latest_ts_aware = latest_ts  # used for DB filter (preserves tz)
    latest_ts_naive = (
        latest_ts.replace(tzinfo=None)
        if hasattr(latest_ts, "tzinfo") and latest_ts.tzinfo is not None
        else latest_ts
    )

    # Round down to the minute so the newest bucket always contains latest_ts
    latest_minute = latest_ts_naive.replace(second=0, microsecond=0)
    # Window: (minutes-1) buckets before latest_minute + latest_minute = N buckets
    start_naive = latest_minute - timedelta(minutes=minutes - 1)

    # For the DB filter, use the same offset as latest_ts_aware
    if hasattr(latest_ts_aware, "tzinfo") and latest_ts_aware.tzinfo is not None:
        start_filter = start_naive.replace(tzinfo=latest_ts_aware.tzinfo)
    else:
        start_filter = start_naive

    rows = (
        db.query(TrafficFeatures.timestamp, TrafficFeatures.classification)
        .filter(TrafficFeatures.timestamp >= start_filter)
        .all()
    )

    # Build per-minute buckets: start_naive … latest_minute (inclusive, N buckets)
    buckets: dict[str, dict[str, int]] = {}
    for i in range(minutes):
        t = start_naive + timedelta(minutes=i)
        label = t.strftime("%H:%M")
        buckets[label] = {"normal": 0, "attack": 0}

    for row in rows:
        ts = row.timestamp
        if hasattr(ts, "tzinfo") and ts.tzinfo is not None:
            ts = ts.replace(tzinfo=None)
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
    from sqlalchemy import func as sqlfunc

    latest_ts = db.query(sqlfunc.max(TrafficFeatures.timestamp)).scalar()
    if latest_ts is None:
        return {
            "total_packets": 0, "normal_packets": 0, "attack_packets": 0,
            "success_rate": 0.0, "packet_rate_per_min": 0.0, "window_minutes": minutes,
        }

    latest_ts_aware = latest_ts
    latest_ts_naive = (
        latest_ts.replace(tzinfo=None)
        if hasattr(latest_ts, "tzinfo") and latest_ts.tzinfo is not None
        else latest_ts
    )
    start_naive = latest_ts_naive - timedelta(minutes=minutes)
    start_filter = (
        start_naive.replace(tzinfo=latest_ts_aware.tzinfo)
        if hasattr(latest_ts_aware, "tzinfo") and latest_ts_aware.tzinfo is not None
        else start_naive
    )

    rows = (
        db.query(TrafficFeatures.classification, TrafficFeatures.timestamp)
        .filter(TrafficFeatures.timestamp >= start_filter)
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


def get_extractor_health(db: Session, minutes: int = 10):
    """Derive feature extractor health from traffic_features and detection_events."""
    from sqlalchemy import func as sqlfunc

    # Total features ever extracted
    total_features = db.query(sqlfunc.count(TrafficFeatures.feature_id)).scalar() or 0

    # Anchor recent window to latest timestamp
    latest_ts = db.query(sqlfunc.max(TrafficFeatures.timestamp)).scalar()

    throughput_per_min = 0.0
    recent_count = 0
    if latest_ts is not None:
        latest_ts_naive = (
            latest_ts.replace(tzinfo=None)
            if hasattr(latest_ts, "tzinfo") and latest_ts.tzinfo is not None
            else latest_ts
        )
        start_naive = latest_ts_naive - timedelta(minutes=minutes)
        start_filter = (
            start_naive.replace(tzinfo=latest_ts.tzinfo)
            if hasattr(latest_ts, "tzinfo") and latest_ts.tzinfo is not None
            else start_naive
        )
        recent_count = (
            db.query(sqlfunc.count(TrafficFeatures.feature_id))
            .filter(TrafficFeatures.timestamp >= start_filter)
            .scalar() or 0
        )
        throughput_per_min = round(recent_count / minutes, 1)

    # Protocol distribution
    protocol_rows = (
        db.query(TrafficFeatures.protocol, sqlfunc.count(TrafficFeatures.feature_id))
        .group_by(TrafficFeatures.protocol)
        .all()
    )
    protocol_counts = {row[0]: row[1] for row in protocol_rows}

    # Packet size stats (avg, min, max)
    size_stats = db.query(
        sqlfunc.avg(TrafficFeatures.packet_size),
        sqlfunc.min(TrafficFeatures.packet_size),
        sqlfunc.max(TrafficFeatures.packet_size),
    ).one()
    avg_packet_size = round(float(size_stats[0]), 2) if size_stats[0] else 0.0
    min_packet_size = round(float(size_stats[1]), 2) if size_stats[1] else 0.0
    max_packet_size = round(float(size_stats[2]), 2) if size_stats[2] else 0.0

    # Byte count stats
    byte_stats = db.query(
        sqlfunc.avg(TrafficFeatures.byte_count),
        sqlfunc.min(TrafficFeatures.byte_count),
        sqlfunc.max(TrafficFeatures.byte_count),
    ).one()
    avg_byte_count = round(float(byte_stats[0]), 2) if byte_stats[0] else 0.0
    min_byte_count = int(byte_stats[1]) if byte_stats[1] else 0
    max_byte_count = int(byte_stats[2]) if byte_stats[2] else 0

    # Avg processing latency from detection_events
    latency_avg = db.query(sqlfunc.avg(DetectionEvents.processing_latency_ms)).scalar()
    avg_latency_ms = round(float(latency_avg), 2) if latency_avg else 0.0

    # Latest timestamp as a status indicator
    last_seen = latest_ts.isoformat() if latest_ts else None

    return {
        "total_features_extracted": total_features,
        "recent_features": recent_count,
        "throughput_per_min": throughput_per_min,
        "window_minutes": minutes,
        "protocol_counts": protocol_counts,
        "avg_packet_size": avg_packet_size,
        "min_packet_size": min_packet_size,
        "max_packet_size": max_packet_size,
        "avg_byte_count": avg_byte_count,
        "min_byte_count": min_byte_count,
        "max_byte_count": max_byte_count,
        "avg_processing_latency_ms": avg_latency_ms,
        "last_seen": last_seen,
    }


def get_alert_stats(db: Session):
    """Return total alert counts grouped by severity across all detection_events."""
    rows = (
        db.query(DetectionEvents.severity, func.count(DetectionEvents.event_id))
        .group_by(DetectionEvents.severity)
        .all()
    )
    counts: dict[str, int] = {}
    for severity, count in rows:
        counts[severity.lower()] = count
    return {
        "total": sum(counts.values()),
        "critical": counts.get("critical", 0),
        "high": counts.get("high", 0),
        "medium": counts.get("medium", 0),
        "low": counts.get("low", 0),
    }


def get_attack_distribution(db: Session):
    """Count total attack events grouped by attack type across all traffic_features."""
    rows = (
        db.query(TrafficFeatures.classification, func.count(TrafficFeatures.event_id))
        .filter(TrafficFeatures.classification != "Normal")
        .group_by(TrafficFeatures.classification)
        .all()
    )
    counts: dict[str, int] = {}
    total = 0
    for classification, count in rows:
        normalized = _normalize_attack_type(classification)
        counts[normalized] = counts.get(normalized, 0) + count
        total += count
    return {"total": total, "counts": counts}


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