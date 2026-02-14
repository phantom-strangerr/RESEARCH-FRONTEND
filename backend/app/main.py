from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.database import init_db

# Import all models so SQLAlchemy registers them with Base.metadata
# This is critical — without these imports, init_db() won't create the tables
from app.models.user import User
from app.models.detection_event import DetectionEvents
from app.models.traffic_features import TrafficFeatures
from app.models.event_context import EventContext
from app.models.device_health import DeviceHealthLogs
from app.models.system_log import SystemLogs

# Import routers
from app.api.endpoints import auth
from app.api.endpoints import detection
from app.api.endpoints import traffic
from app.api.endpoints import event_context
from app.api.endpoints import device_health
from app.api.endpoints import system_logs

# Load env
load_dotenv()

# Initialize database and create tables
init_db()

app = FastAPI(
    title="IoT SOC Dashboard API",
    description="Backend API for the IoT Security Operations Center Dashboard",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(detection.router, prefix="/api/v1/detection-events", tags=["detection-events"])
app.include_router(traffic.router, prefix="/api/v1/traffic-features", tags=["traffic-features"])
app.include_router(event_context.router, prefix="/api/v1/event-context", tags=["event-context"])
app.include_router(device_health.router, prefix="/api/v1/device-health-logs", tags=["device-health-logs"])
app.include_router(system_logs.router, prefix="/api/v1/system-logs", tags=["system-logs"])


# Startup event
@app.on_event("startup")
async def startup_event():
    try:
        created_tables = init_db()
        if created_tables:
            print(f"Database initialized. Tables: {', '.join(created_tables)}")
    except Exception as e:
        print(f"Error initializing database: {e}")


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "IoT SOC Dashboard API"}


@app.get("/")
def root():
    return {"message": "IoT SOC Backend API", "version": "1.0.0"}