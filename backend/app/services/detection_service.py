from sqlalchemy.orm import Session
from app.models.detection_event import DetectionEvents
from app.schemas.detection_event import DetectionEventsCreate


def create_detection_event(db: Session, event: DetectionEventsCreate):
    payload = event.model_dump(exclude_unset=True)
    db_event = DetectionEvents(**payload)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_detection_events(db: Session):
    return db.query(DetectionEvents).all()