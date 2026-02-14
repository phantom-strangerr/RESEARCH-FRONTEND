from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.event_context import EventContextCreate, EventContext
from app.services.event_context_service import create_event_context, get_event_context

router = APIRouter()


@router.post("")
def create_context(context: EventContextCreate, db: Session = Depends(get_db)):
    try:
        create_event_context(db, context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "MAC info metadata successfully added!"}


@router.get("", response_model=list[EventContext])
def get_contexts(db: Session = Depends(get_db)):
    return get_event_context(db)