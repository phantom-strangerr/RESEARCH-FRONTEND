from sqlalchemy.orm import Session
from app.models.traffic_features import TrafficFeatures
from app.schemas.traffic_features import TrafficFeaturesCreate


def create_traffic_features(db: Session, features: TrafficFeaturesCreate):
    payload = features.model_dump(exclude_unset=True)
    db_tf = TrafficFeatures(**payload)
    db.add(db_tf)
    db.commit()
    db.refresh(db_tf)
    return db_tf


def get_traffic_features(db: Session):
    return db.query(TrafficFeatures).all()