from sqlalchemy.orm import Session
from app.models.system_log import SystemLogs
from app.schemas.system_log import SystemLogsCreate


def create_system_log(db: Session, log: SystemLogsCreate):
    payload = log.model_dump(exclude_unset=True)
    db_log = SystemLogs(**payload)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_system_logs(db: Session):
    return db.query(SystemLogs).all()