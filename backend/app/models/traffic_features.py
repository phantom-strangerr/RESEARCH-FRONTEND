from sqlalchemy import Column, Integer, String, Float, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class TrafficFeatures(Base):
    __tablename__ = "traffic_features"

    feature_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("detection_events.event_id"), nullable=False, index=True)
    src_ip = Column(String(45), nullable=False, index=True)
    dst_ip = Column(String(45), nullable=False, index=True)
    src_port = Column(Integer, nullable=False)
    dst_port = Column(Integer, nullable=False)
    protocol = Column(String(10), nullable=False)
    packet_count = Column(BigInteger, nullable=False)
    byte_count = Column(BigInteger, nullable=False)
    packet_rate = Column(Float, nullable=False)
    flow_duration_ms = Column(Float, nullable=False)
    avg_inter_arrival_time_ms = Column(Float, nullable=False)
    avg_packet_size = Column(Float, nullable=False)
    ttl_avg = Column(Float, nullable=False)

    # Relationship
    detection_event = relationship("DetectionEvents", back_populates="traffic_features")