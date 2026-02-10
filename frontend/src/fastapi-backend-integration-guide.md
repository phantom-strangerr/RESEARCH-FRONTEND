# FastAPI Backend Integration Guide for IoT SOC Dashboard

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Setup](#backend-setup)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [WebSocket Implementation](#websocket-implementation)
6. [Frontend Integration](#frontend-integration)
7. [Authentication & Authorization](#authentication--authorization)
8. [Deployment Considerations](#deployment-considerations)

---

## Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     React Dashboard (Frontend)               │
│  - Dashboard Overview    - Alerts Management                 │
│  - Live Packets         - Port Management                    │
│  - System Health        - System Logs                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP REST + WebSocket
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│  - REST API Endpoints                                        │
│  - WebSocket Server                                          │
│  - Authentication/Authorization                              │
│  - ML Model Integration (XGBoost)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ SQL
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  - Device Information    - Attack Logs                       │
│  - Network Traffic       - System Logs                       │
│  - User Management       - Port Isolation Records            │
└─────────────────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Edge Devices (Raspberry Pi)                     │
│  - Feature Extraction (4GB)                                  │
│  - Edge ML Processing (8GB)                                  │
│  - MQTT Publishers                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Setup

### Step 1: Project Structure

Create the following directory structure:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection setup
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── device.py
│   │   ├── packet.py
│   │   ├── alert.py
│   │   ├── user.py
│   │   └── port_isolation.py
│   │
│   ├── schemas/                # Pydantic schemas for validation
│   │   ├── __init__.py
│   │   ├── device.py
│   │   ├── packet.py
│   │   ├── alert.py
│   │   ├── user.py
│   │   └── response.py
│   │
│   ├── api/                    # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (auth, db session)
│   │   ├── endpoints/
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py
│   │   │   ├── devices.py
│   │   │   ├── packets.py
│   │   │   ├── alerts.py
│   │   │   ├── ports.py
│   │   │   ├── logs.py
│   │   │   └── auth.py
│   │   └── websocket.py        # WebSocket handlers
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── ml_service.py       # XGBoost model integration
│   │   ├── mqtt_service.py     # MQTT client for edge devices
│   │   ├── alert_service.py    # Alert management
│   │   └── port_service.py     # Port isolation logic
│   │
│   └── utils/
│       ├── __init__.py
│       ├── security.py         # Password hashing, JWT
│       └── helpers.py
│
├── alembic/                    # Database migrations
│   └── versions/
├── tests/
├── requirements.txt
├── .env.example
└── README.md
```

### Step 2: Install Dependencies

Create `requirements.txt`:

```txt
# FastAPI and server
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0

# WebSocket
websockets==12.0

# MQTT for edge device communication
paho-mqtt==1.6.1

# ML Model
xgboost==2.0.3
scikit-learn==1.4.0
numpy==1.26.3
pandas==2.2.0

# Utilities
pydantic==2.5.3
pydantic-settings==2.1.0
```

Install dependencies:
```bash
pip install -r requirements.txt --break-system-packages
```

### Step 3: Environment Configuration

Create `.env`:

```env
# Application
APP_NAME=IoT SOC Backend
DEBUG=True
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://soc_user:secure_password@localhost:5432/iot_soc_db

# Security
SECRET_KEY=your-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MQTT Broker (for edge devices)
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=soc_mqtt
MQTT_PASSWORD=mqtt_password

# CORS
FRONTEND_URL=http://localhost:5173

# ML Model
ML_MODEL_PATH=./models/xgboost_model.json
CONFIDENCE_THRESHOLD=0.85
```

---

## Database Schema

### Step 4: Define SQLAlchemy Models

**`app/models/device.py`**:
```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base

class DeviceType(str, enum.Enum):
    FEATURE_EXTRACTION = "feature_extraction"
    EDGE_ML = "edge_ml"

class DeviceStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"
    ERROR = "error"

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(DeviceType), nullable=False)
    ip_address = Column(String)
    mac_address = Column(String)
    location = Column(String)
    
    # Health metrics
    status = Column(Enum(DeviceStatus), default=DeviceStatus.OFFLINE)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    temperature = Column(Float)
    uptime = Column(Integer, default=0)  # in seconds
    
    # Metadata
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**`app/models/packet.py`**:
```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Packet(Base):
    __tablename__ = "packets"

    id = Column(Integer, primary_key=True, index=True)
    packet_id = Column(String, unique=True, index=True)
    
    # Network information
    src_ip = Column(String, index=True)
    dst_ip = Column(String, index=True)
    src_port = Column(Integer)
    dst_port = Column(Integer)
    src_mac = Column(String)
    dst_mac = Column(String)
    protocol = Column(String)
    
    # Packet characteristics
    packet_size = Column(Integer)
    ttl = Column(Integer)
    flags = Column(String)
    
    # ML features (extracted by edge devices)
    feature_vector = Column(Text)  # JSON string of features
    
    # Detection
    is_malicious = Column(Boolean, default=False)
    attack_type = Column(String)  # DOS, Botnet, Replay, MITM
    confidence = Column(Float)
    
    # Device association
    captured_by_device_id = Column(Integer, ForeignKey("devices.id"))
    
    # Timestamps
    captured_at = Column(DateTime(timezone=True))
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
```

**`app/models/alert.py`**:
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, Text, Float
from sqlalchemy.sql import func
import enum
from app.database import Base

class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    
    # Alert details
    attack_type = Column(String, index=True)  # DOS, Botnet, Replay, MITM
    severity = Column(Enum(AlertSeverity), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    
    # Attack information
    src_ip = Column(String, index=True)
    dst_ip = Column(String)
    src_mac = Column(String)
    affected_device_id = Column(Integer, ForeignKey("devices.id"))
    
    # ML Explainability
    confidence = Column(Float)
    shap_values = Column(Text)  # JSON string of SHAP values
    top_features = Column(Text)  # JSON string of top contributing features
    
    # Mitigation actions
    mitigation_applied = Column(Boolean, default=False)
    mitigation_details = Column(Text)  # JSON: port isolation, MAC blocking
    
    # Timestamps
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    # User actions
    acknowledged_by_user_id = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
```

**`app/models/user.py`**:
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    ANALYST = "analyst"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
```

**`app/models/port_isolation.py`**:
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class PortIsolation(Base):
    __tablename__ = "port_isolations"

    id = Column(Integer, primary_key=True, index=True)
    
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    
    # Isolation details
    isolated_mac = Column(String, nullable=False)
    isolated_port = Column(Integer)
    reason = Column(String)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    isolated_at = Column(DateTime(timezone=True), server_default=func.now())
    lifted_at = Column(DateTime(timezone=True))
    
    # Authorization
    lifted_by_user_id = Column(Integer, ForeignKey("users.id"))
    authorization_code = Column(String)  # For security override
    notes = Column(Text)
```

### Step 5: Database Connection Setup

**`app/database.py`**:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**`app/config.py`**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "IoT SOC Backend"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MQTT
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # ML Model
    ML_MODEL_PATH: str = "./models/xgboost_model.json"
    CONFIDENCE_THRESHOLD: float = 0.85
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## API Endpoints

### Step 6: Define Pydantic Schemas

**`app/schemas/device.py`**:
```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.device import DeviceType, DeviceStatus

class DeviceBase(BaseModel):
    device_id: str
    name: str
    type: DeviceType
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    location: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[DeviceStatus] = None

class DeviceHealthUpdate(BaseModel):
    cpu_usage: float = Field(..., ge=0, le=100)
    memory_usage: float = Field(..., ge=0, le=100)
    temperature: Optional[float] = None
    uptime: int

class Device(DeviceBase):
    id: int
    status: DeviceStatus
    cpu_usage: float
    memory_usage: float
    temperature: Optional[float]
    uptime: int
    last_seen: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
```

**`app/schemas/alert.py`**:
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List
from app.models.alert import AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    attack_type: str
    severity: AlertSeverity
    src_ip: str
    dst_ip: Optional[str] = None
    src_mac: Optional[str] = None

class AlertCreate(AlertBase):
    confidence: float
    shap_values: Optional[str] = None
    top_features: Optional[str] = None
    affected_device_id: Optional[int] = None

class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    notes: Optional[str] = None

class Alert(AlertBase):
    id: int
    alert_id: str
    status: AlertStatus
    confidence: float
    mitigation_applied: bool
    detected_at: datetime
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class AlertWithExplainability(Alert):
    shap_values: Optional[Dict] = None
    top_features: Optional[List[Dict]] = None
```

### Step 7: Create API Endpoints

**`app/api/endpoints/dashboard.py`**:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models.alert import Alert, AlertSeverity
from app.models.device import Device, DeviceStatus
from app.models.packet import Packet

router = APIRouter()

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    """Get dashboard overview statistics"""
    
    # Total alerts in last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    total_alerts = db.query(Alert).filter(Alert.detected_at >= yesterday).count()
    
    # Critical alerts
    critical_alerts = db.query(Alert).filter(
        Alert.severity == AlertSeverity.CRITICAL,
        Alert.detected_at >= yesterday
    ).count()
    
    # Active devices
    active_devices = db.query(Device).filter(
        Device.status == DeviceStatus.ONLINE
    ).count()
    
    # Total packets processed
    total_packets = db.query(Packet).filter(
        Packet.processed_at >= yesterday
    ).count()
    
    # Attack type distribution
    attack_distribution = db.query(
        Alert.attack_type,
        func.count(Alert.id).label('count')
    ).filter(
        Alert.detected_at >= yesterday
    ).group_by(Alert.attack_type).all()
    
    # Recent alerts
    recent_alerts = db.query(Alert).order_by(
        desc(Alert.detected_at)
    ).limit(10).all()
    
    return {
        "stats": {
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "active_devices": active_devices,
            "total_packets": total_packets
        },
        "attack_distribution": [
            {"type": item[0], "count": item[1]} 
            for item in attack_distribution
        ],
        "recent_alerts": recent_alerts
    }

@router.get("/timeline")
def get_alert_timeline(
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get alert timeline data for charts"""
    
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    # Group alerts by hour
    timeline = db.query(
        func.date_trunc('hour', Alert.detected_at).label('hour'),
        func.count(Alert.id).label('count')
    ).filter(
        Alert.detected_at >= start_time
    ).group_by('hour').order_by('hour').all()
    
    return {
        "timeline": [
            {"timestamp": item[0].isoformat(), "count": item[1]}
            for item in timeline
        ]
    }
```

**`app/api/endpoints/devices.py`**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.device import Device
from app.schemas.device import Device as DeviceSchema, DeviceHealthUpdate

router = APIRouter()

@router.get("/", response_model=List[DeviceSchema])
def get_devices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all devices"""
    devices = db.query(Device).offset(skip).limit(limit).all()
    return devices

@router.get("/{device_id}", response_model=DeviceSchema)
def get_device(device_id: str, db: Session = Depends(get_db)):
    """Get specific device by device_id"""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put("/{device_id}/health")
def update_device_health(
    device_id: str,
    health: DeviceHealthUpdate,
    db: Session = Depends(get_db)
):
    """Update device health metrics (called by edge devices via MQTT)"""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.cpu_usage = health.cpu_usage
    device.memory_usage = health.memory_usage
    device.temperature = health.temperature
    device.uptime = health.uptime
    device.last_seen = datetime.utcnow()
    
    # Determine status based on health metrics
    if health.cpu_usage > 90 or health.memory_usage > 90:
        device.status = DeviceStatus.WARNING
    elif health.temperature and health.temperature > 80:
        device.status = DeviceStatus.ERROR
    else:
        device.status = DeviceStatus.ONLINE
    
    db.commit()
    db.refresh(device)
    
    return {"message": "Health updated", "device": device}
```

**`app/api/endpoints/alerts.py`**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.alert import Alert, AlertStatus, AlertSeverity
from app.schemas.alert import Alert as AlertSchema, AlertUpdate, AlertWithExplainability
import json

router = APIRouter()

@router.get("/", response_model=List[AlertSchema])
def get_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
    attack_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get alerts with optional filters"""
    query = db.query(Alert)
    
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if attack_type:
        query = query.filter(Alert.attack_type == attack_type)
    
    alerts = query.order_by(Alert.detected_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertWithExplainability)
def get_alert_details(alert_id: str, db: Session = Depends(get_db)):
    """Get detailed alert information with ML explainability"""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Parse JSON fields for explainability
    result = AlertWithExplainability.from_orm(alert)
    if alert.shap_values:
        result.shap_values = json.loads(alert.shap_values)
    if alert.top_features:
        result.top_features = json.loads(alert.top_features)
    
    return result

@router.patch("/{alert_id}", response_model=AlertSchema)
def update_alert(
    alert_id: str,
    update: AlertUpdate,
    db: Session = Depends(get_db)
):
    """Update alert status"""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if update.status:
        alert.status = update.status
        if update.status == AlertStatus.ACKNOWLEDGED:
            alert.acknowledged_at = datetime.utcnow()
        elif update.status == AlertStatus.RESOLVED:
            alert.resolved_at = datetime.utcnow()
    
    if update.notes:
        alert.notes = update.notes
    
    db.commit()
    db.refresh(alert)
    
    return alert
```

**`app/api/endpoints/ports.py`**:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.port_isolation import PortIsolation
from app.api.deps import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/isolations")
def get_port_isolations(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get port isolation records"""
    query = db.query(PortIsolation)
    if active_only:
        query = query.filter(PortIsolation.is_active == True)
    
    isolations = query.order_by(PortIsolation.isolated_at.desc()).all()
    return isolations

@router.post("/lift-isolation/{isolation_id}")
def lift_port_isolation(
    isolation_id: int,
    authorization_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lift port isolation (requires admin/operator role)"""
    
    # Check user authorization
    if current_user.role not in [UserRole.ADMIN, UserRole.OPERATOR]:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )
    
    # Verify authorization code (implement your verification logic)
    if not verify_authorization_code(authorization_code):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization code"
        )
    
    isolation = db.query(PortIsolation).filter(
        PortIsolation.id == isolation_id
    ).first()
    
    if not isolation:
        raise HTTPException(status_code=404, detail="Isolation record not found")
    
    if not isolation.is_active:
        raise HTTPException(status_code=400, detail="Isolation already lifted")
    
    # Lift isolation
    isolation.is_active = False
    isolation.lifted_at = datetime.utcnow()
    isolation.lifted_by_user_id = current_user.id
    isolation.authorization_code = authorization_code
    
    db.commit()
    
    # TODO: Send command to edge device to actually lift the port isolation
    
    return {
        "message": "Port isolation lifted successfully",
        "isolation": isolation
    }

def verify_authorization_code(code: str) -> bool:
    """Verify authorization code (implement your logic)"""
    # This could be a time-based code, admin password, etc.
    return len(code) >= 6
```

---

## WebSocket Implementation

### Step 8: WebSocket Server

**`app/api/websocket.py`**:
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

    async def send_personal(self, message: dict, websocket: WebSocket):
        """Send message to specific client"""
        await websocket.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            # Handle client requests if needed
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper functions to broadcast events from other parts of the application

async def broadcast_new_alert(alert_data: dict):
    """Broadcast new alert to all connected clients"""
    await manager.broadcast({
        "type": "new_alert",
        "data": alert_data
    })

async def broadcast_device_health(device_id: str, health_data: dict):
    """Broadcast device health update"""
    await manager.broadcast({
        "type": "device_health",
        "device_id": device_id,
        "data": health_data
    })

async def broadcast_detection_event(detection_data: dict):
    """Broadcast real-time detection event"""
    await manager.broadcast({
        "type": "detection",
        "data": detection_data
    })
```

---

## Frontend Integration

### Step 9: Update Frontend API Service

Create `src/services/api.ts` in your React project:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard APIs
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getTimeline: (hours: number = 24) => api.get(`/dashboard/timeline?hours=${hours}`),
};

// Device APIs
export const deviceAPI = {
  getDevices: () => api.get('/devices'),
  getDevice: (deviceId: string) => api.get(`/devices/${deviceId}`),
  updateHealth: (deviceId: string, health: any) => 
    api.put(`/devices/${deviceId}/health`, health),
};

// Alert APIs
export const alertAPI = {
  getAlerts: (params?: {
    status?: string;
    severity?: string;
    attack_type?: string;
    skip?: number;
    limit?: number;
  }) => api.get('/alerts', { params }),
  
  getAlertDetails: (alertId: string) => api.get(`/alerts/${alertId}`),
  
  updateAlert: (alertId: string, update: { status?: string; notes?: string }) =>
    api.patch(`/alerts/${alertId}`, update),
};

// Port Management APIs
export const portAPI = {
  getIsolations: (activeOnly: boolean = true) => 
    api.get('/ports/isolations', { params: { active_only: activeOnly } }),
  
  liftIsolation: (isolationId: number, authCode: string) =>
    api.post(`/ports/lift-isolation/${isolationId}`, { authorization_code: authCode }),
};

// Authentication APIs
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  logout: () => {
    localStorage.removeItem('access_token');
  },
};

export default api;
```

### Step 10: WebSocket Connection

Create `src/services/websocket.ts`:

```typescript
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handlers = this.handlers.get(message.type) || [];
      handlers.forEach(handler => handler(message.data));
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      this.handlers.set(type, handlers.filter(h => h !== handler));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
```

### Step 11: Update Dashboard Component

Example usage in `src/pages/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { wsService } from '../services/websocket';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch initial data
    dashboardAPI.getOverview().then(response => {
      setStats(response.data.stats);
      setAlerts(response.data.recent_alerts);
    });

    // Connect WebSocket
    wsService.connect();

    // Handle real-time alerts
    const handleNewAlert = (data: any) => {
      setAlerts(prev => [data, ...prev].slice(0, 10));
    };

    wsService.on('new_alert', handleNewAlert);

    return () => {
      wsService.off('new_alert', handleNewAlert);
      wsService.disconnect();
    };
  }, []);

  // Rest of component...
}
```

---

## Authentication & Authorization

### Step 12: JWT Authentication

**`app/utils/security.py`**:
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

**`app/api/deps.py`**:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user
```

---

## Deployment Considerations

### Step 13: Main Application Setup

**`app/main.py`**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.endpoints import dashboard, devices, alerts, ports, auth
from app.api import websocket

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix=f"{settings.API_V1_PREFIX}/dashboard", tags=["dashboard"])
app.include_router(devices.router, prefix=f"{settings.API_V1_PREFIX}/devices", tags=["devices"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_PREFIX}/alerts", tags=["alerts"])
app.include_router(ports.router, prefix=f"{settings.API_V1_PREFIX}/ports", tags=["ports"])
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(websocket.router, prefix=f"{settings.API_V1_PREFIX}")

@app.get("/")
def root():
    return {"message": "IoT SOC Backend API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### Step 14: Run the Application

Create a startup script `run.sh`:

```bash
#!/bin/bash

# Run database migrations
alembic upgrade head

# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

For production:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 15: Environment Variables for Frontend

Create `.env` in your React project:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/api/v1/ws
```

---

## Next Steps

1. **Database Setup**: Install PostgreSQL and create the database
2. **Database Migrations**: Set up Alembic for schema migrations
3. **ML Model Integration**: Load XGBoost model and create prediction endpoints
4. **MQTT Integration**: Connect edge devices to send data to backend
5. **Testing**: Create unit tests and integration tests
6. **Deployment**: Deploy to AWS with proper security groups
7. **Monitoring**: Add logging and monitoring (Prometheus, Grafana)

---

## Testing the Integration

### Test REST API:
```bash
# Get dashboard overview
curl http://localhost:8000/api/v1/dashboard/overview

# Get devices
curl http://localhost:8000/api/v1/devices

# Get alerts
curl http://localhost:8000/api/v1/alerts
```

### Test WebSocket:
Use a WebSocket client or your React app to connect to:
```
ws://localhost:8000/api/v1/ws
```

---

This guide provides a complete foundation for connecting your React SOC dashboard to a FastAPI backend with PostgreSQL database, WebSocket support, and proper authentication/authorization.
