from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.traffic_features import TrafficFeaturesCreate, TrafficFeatures
from app.services.traffic_service import create_traffic_features, get_traffic_features

router = APIRouter()


@router.post("")
def create_features(features: TrafficFeaturesCreate, db: Session = Depends(get_db)):
    try:
        create_traffic_features(db, features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Traffic metadata successfully created!"}


@router.get("", response_model=list[TrafficFeatures])
def get_features(db: Session = Depends(get_db)):
    return get_traffic_features(db)