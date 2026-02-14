from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.detection_event import DetectionEventsCreate, DetectionEvents
from app.services.detection_service import create_detection_event, get_detection_events

router = APIRouter()


@router.post("")
def create_event(event: DetectionEventsCreate, db: Session = Depends(get_db)):
    try:
        create_detection_event(db, event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Detection event successfully created!"}


@router.get("", response_model=list[DetectionEvents])
def get_events(db: Session = Depends(get_db)):
    return get_detection_events(db)