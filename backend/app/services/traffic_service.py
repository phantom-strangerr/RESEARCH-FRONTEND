from sqlalchemy.orm import Session
from app.models.traffic_features import TrafficFeatures
from app.models.detection_event import DetectionEvents
from app.schemas.traffic_features import TrafficFeaturesCreate

_SEVERITY_MAP = {
    "dos":      "critical",
    "mirai":    "high",
    "replay":   "high",
    "spoofing": "medium",
}


def create_traffic_features(db: Session, features: TrafficFeaturesCreate):
    payload = features.model_dump(exclude_unset=True)
    # Discard any timestamp from the batch processor — edge device clocks can drift.
    # Let PostgreSQL server_default=func.now() stamp the record at server (UTC) time.
    payload.pop('timestamp', None)

    # Auto-create detection event if the FK target doesn't exist yet.
    # This handles batch processors that post traffic features before (or
    # instead of) posting to /detection-events separately.
    event_id = payload.get("event_id")
    if event_id and not db.query(DetectionEvents.event_id).filter(
        DetectionEvents.event_id == event_id
    ).first():
        classification = (payload.get("classification") or "Unknown").strip()
        is_dl = bool(payload.get("dl"))
        is_ml = bool(payload.get("ml"))
        model_name = "DL" if is_dl else ("ML" if is_ml else "Unknown")
        severity = _SEVERITY_MAP.get(classification.lower(), "medium")
        db.add(DetectionEvents(
            event_id=event_id,
            attack_type=classification,
            severity=severity,
            model_name=model_name,
            processing_latency_ms=0.0,
            mitigation=None,
        ))
        db.flush()

    db_tf = TrafficFeatures(**payload)
    db.add(db_tf)
    db.commit()
    db.refresh(db_tf)
    return db_tf


# Maps filter button values to all possible DB variants (batch_processor stores abbreviated forms)
_FILTER_ALIASES: dict[str, list[str]] = {
    "spoofing": ["spoof", "spoofing"],
    "dos":      ["dos"],
    "mirai":    ["mirai"],
    "replay":   ["replay"],
    "normal":   ["normal"],
}


def get_traffic_features(db: Session, limit: int = 100, offset: int = 0, classification: str | None = None):
    from sqlalchemy import func as sqlfunc
    q = db.query(TrafficFeatures)
    if classification:
        variants = _FILTER_ALIASES.get(classification.lower(), [classification.lower()])
        q = q.filter(sqlfunc.lower(TrafficFeatures.classification).in_(variants))
    return q.order_by(TrafficFeatures.timestamp.desc()).offset(offset).limit(limit).all()