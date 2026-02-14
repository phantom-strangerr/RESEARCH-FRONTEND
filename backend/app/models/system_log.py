from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class SystemLogs(Base):
    __tablename__ = "system_logs"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False, index=True)
    log_level = Column(String(20), nullable=False)
    log_source = Column(String(100), nullable=False)
    message = Column(String(1000), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("detection_events.event_id"), nullable=True, index=True)

    # Relationship
    detection_event = relationship("DetectionEvents", back_populates="system_logs")