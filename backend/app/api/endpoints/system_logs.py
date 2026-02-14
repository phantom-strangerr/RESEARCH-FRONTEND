from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.system_log import SystemLogsCreate, SystemLogs
from app.services.system_log_service import create_system_log, get_system_logs

router = APIRouter()


@router.post("")
def create_log(log: SystemLogsCreate, db: Session = Depends(get_db)):
    try:
        create_system_log(db, log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "System log successfully added!"}


@router.get("", response_model=list[SystemLogs])
def get_logs(db: Session = Depends(get_db)):
    return get_system_logs(db)