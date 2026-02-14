from sqlalchemy import Column, Float, BigInteger, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class DeviceHealthLogs(Base):
    __tablename__ = "device_health_logs"

    health_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False, index=True)
    cpu_usage_percent = Column(Float, nullable=False)
    memory_usage_percent = Column(Float, nullable=False)
    disk_usage_percent = Column(Float, nullable=False)
    network_rx_bytes = Column(BigInteger, nullable=False)
    network_tx_bytes = Column(BigInteger, nullable=False)