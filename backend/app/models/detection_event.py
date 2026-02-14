from sqlalchemy import Column, String, Float, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class DetectionEvents(Base):
    __tablename__ = "detection_events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False, index=True)
    attack_type = Column(String(100), nullable=False)
    confidence_score = Column(Float, nullable=False)
    severity = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    processing_latency_ms = Column(Float, nullable=False)

    # Relationships
    traffic_features = relationship("TrafficFeatures", back_populates="detection_event", cascade="all, delete-orphan")
    event_context = relationship("EventContext", back_populates="detection_event", cascade="all, delete-orphan")
    system_logs = relationship("SystemLogs", back_populates="detection_event", cascade="all, delete-orphan")