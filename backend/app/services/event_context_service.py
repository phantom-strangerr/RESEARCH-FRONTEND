from sqlalchemy.orm import Session
from app.models.event_context import EventContext
from app.schemas.event_context import EventContextCreate


def create_event_context(db: Session, context: EventContextCreate):
    payload = context.model_dump(exclude_unset=True)
    db_ctx = EventContext(**payload)
    db.add(db_ctx)
    db.commit()
    db.refresh(db_ctx)
    return db_ctx


def get_event_context(db: Session):
    return db.query(EventContext).all()