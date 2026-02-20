from sqlalchemy import Column, Integer, String, Float, BigInteger, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class SwitchPort(Base):
    __tablename__ = "switch_ports"

    port_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    port_number = Column(Integer, unique=True, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active")  # active / isolated / disabled / warning
    device_ip = Column(String(45), nullable=True)
    device_mac = Column(String(17), nullable=True)
    device_name = Column(String(255), nullable=True)
    vlan = Column(Integer, nullable=True)
    speed = Column(String(10), nullable=True)  # 10M / 100M / 1G / 10G
    isolation_reason = Column(String(500), nullable=True)
    isolated_at = Column(TIMESTAMP(timezone=True), nullable=True)
    isolated_by = Column(String(20), nullable=True)  # edge_ml / cloud / manual
    last_activity = Column(TIMESTAMP(timezone=True), server_default=func.now())
    bytes_sent = Column(Float, nullable=False, default=0)  # MB
    bytes_received = Column(Float, nullable=False, default=0)  # MB
    errors = Column(Integer, nullable=False, default=0)
    drops = Column(Integer, nullable=False, default=0)
    alert_event_id = Column(UUID(as_uuid=True), ForeignKey("detection_events.event_id"), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())