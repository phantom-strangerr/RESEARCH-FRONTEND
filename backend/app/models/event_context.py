from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class EventContext(Base):
    __tablename__ = "event_context"

    context_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("detection_events.event_id"), nullable=False, index=True)
    

    # Relationship
    detection_event = relationship("DetectionEvents", back_populates="event_context")