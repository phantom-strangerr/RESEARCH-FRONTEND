from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.device_health import DeviceHealthLogsCreate, DeviceHealthLogs
from app.services.device_health_service import create_device_health_log, get_device_health_logs, get_latest_device_health_log

router = APIRouter()


@router.post("")
def create_health_log(log: DeviceHealthLogsCreate, db: Session = Depends(get_db)):
    try:
        create_device_health_log(db, log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Device health log successfully added!"}


@router.get("", response_model=list[DeviceHealthLogs])
def get_health_logs(db: Session = Depends(get_db)):
    return get_device_health_logs(db)


@router.get("/latest", response_model=DeviceHealthLogs)
def get_latest_health_log(db: Session = Depends(get_db)):
    log = get_latest_device_health_log(db)
    if not log:
        raise HTTPException(status_code=404, detail="No health logs found")
    return log


