from sqlalchemy import Column, Integer, String, Float, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from sqlalchemy import TIMESTAMP
from sqlalchemy.sql import func


class TrafficFeatures(Base):
    __tablename__ = "traffic_features"

    feature_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("detection_events.event_id"), nullable=False, index=True)
    src_ip = Column(String(45), nullable=False, index=True)
    dst_ip = Column(String(45), nullable=False, index=True)
    protocol = Column(String(10), nullable=False)
    byte_count = Column(BigInteger, nullable=False)
    packet_size = Column(Float, nullable=False)
    ttl = Column(Float, nullable=False)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False, index=True)
    classification = Column(String(50), nullable=False)

    # Relationship
    detection_event = relationship("DetectionEvents", back_populates="traffic_features")