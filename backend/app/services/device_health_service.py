from sqlalchemy.orm import Session
from app.models.device_health import DeviceHealthLogs
from app.schemas.device_health import DeviceHealthLogsCreate


def create_device_health_log(db: Session, log: DeviceHealthLogsCreate):
    payload = log.model_dump(exclude_unset=True)
    db_log = DeviceHealthLogs(**payload)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_device_health_logs(db: Session):
    return db.query(DeviceHealthLogs).all()