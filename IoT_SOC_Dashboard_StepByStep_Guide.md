# IoT Security Operations Center (SOC) — Cloud Monitoring Admin Dashboard

## Complete Step-by-Step Development Guide

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Planning Phase](#2-planning-phase)
   - 2.1 [Define Primary Users](#21-define-primary-users)
   - 2.2 [Define Core Functionality](#22-define-core-functionality)
3. [Tech Stack Selection](#3-tech-stack-selection)
   - 3.1 [Frontend](#31-frontend)
   - 3.2 [Backend](#32-backend)
   - 3.3 [Database](#33-database)
4. [System Architecture (High Level)](#4-system-architecture-high-level)
5. [Project Setup](#5-project-setup)
6. [Backend Setup](#6-backend-setup)
   - 6.1 [Initialize Backend](#61-initialize-backend)
   - 6.2 [Create Basic Server](#62-create-basic-server)
7. [Database Design](#7-database-design)
   - 7.1 [User Collection](#71-user-collection)
   - 7.2 [Server / Device Collection](#72-server--device-collection)
   - 7.3 [Metrics Collection](#73-metrics-collection)
   - 7.4 [Alert Collection](#74-alert-collection)
   - 7.5 [Log Collection](#75-log-collection)
8. [Authentication System](#8-authentication-system)
9. [Frontend Setup](#9-frontend-setup)
   - 9.1 [Create Web App](#91-create-web-app)
   - 9.2 [Frontend Folder Structure](#92-frontend-folder-structure)
10. [UI Layout Design](#10-ui-layout-design)
    - 10.1 [Design Goals](#101-design-goals)
    - 10.2 [Design Style and Direction](#102-design-style-and-direction)
    - 10.3 [Color Theme Systems](#103-color-theme-systems)
    - 10.4 [Component Design Patterns](#104-component-design-patterns)
    - 10.5 [UX Patterns for Monitoring Dashboards](#105-ux-patterns-for-monitoring-dashboards)
    - 10.6 [Frontend Architecture Pattern](#106-frontend-architecture-pattern)
    - 10.7 [Backend Architecture Pattern](#107-backend-architecture-pattern)
    - 10.8 [State Management Strategy (Frontend)](#108-state-management-strategy-frontend)
    - 10.9 [Accessibility Basics](#109-accessibility-basics)
11. [Development Order](#11-development-order)
12. [Security Requirements](#12-security-requirements)
13. [Deployment Plan](#13-deployment-plan)
14. [Versioning & Git Workflow](#14-versioning--git-workflow)
15. [Requirements Engineering](#15-requirements-engineering)
    - 15.1 [Functional Requirements](#151-functional-requirements)
    - 15.2 [Non-Functional Requirements](#152-non-functional-requirements)
    - 15.3 [Dataflow Diagram](#153-dataflow-diagram)
    - 15.4 [API Design](#154-api-design)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Loading & Empty States](#17-loading--empty-states)
18. [Logging & Monitoring of the Dashboard](#18-logging--monitoring-of-the-dashboard)
19. [Testing](#19-testing)
20. [Performance Considerations](#20-performance-considerations)
21. [Scalability Considerations](#21-scalability-considerations)
22. [Backup and Data Retention Policy](#22-backup-and-data-retention-policy)
23. [Environment Configuration](#23-environment-configuration)
24. [Documentation Plan](#24-documentation-plan)
25. [Risk Analysis](#25-risk-analysis)

---

## 1. Project Overview

This project builds a **Cloud Monitoring + IoT Security Admin Dashboard** for a research-grade Security Operations Center (SOC). The system monitors an IoT cyber-security infrastructure that performs:

- **Real-time anomaly detection at the edge** using ML models (XGBoost / Decision Tree) running on Edge ML hardware (Raspberry Pi 4, 8 GB RAM, TensorFlow Lite C++ runtime).
- **Automatic isolation of compromised IoT devices** by disabling switch ports (err-disable via SSH CLI) or blocking MAC addresses on access points.
- **Cloud-based validation** of incidents using a more powerful ML model (XGBoost on AWS).
- **Manual override by administrators** to maintain or lift isolation decisions.
- **Real-time streaming** of security and network metrics via a hybrid REST + WebSocket communication model.

### Attack Detection Scope

The system detects and mitigates four specific network attack types:

| # | Attack Type | Description |
|---|-------------|-------------|
| 1 | **DOS (Denial-of-Service)** | Flooding attacks that overwhelm IoT devices or network resources |
| 2 | **Botnet** | Exploitation of IoT devices to join botnets for coordinated attacks |
| 3 | **Replay** | Capture and retransmission of valid data packets to gain unauthorized access |
| 4 | **Man-in-the-Middle (MitM)** | Interception and potential alteration of communication between devices |

### System Mechanism

A **feature extraction device** (Raspberry Pi 4, 4 GB) is placed inline between the router and the managed switch of the IoT network. It captures only **packet metadata** (IP/MAC addresses, ports, packet/byte counts, flow statistics, protocol flags) without inspecting payloads, reducing overhead. Metadata is forwarded in real time to the **Edge ML module** via local MQTT (Protobuf message format).

The Edge ML module runs lightweight ML models that determine whether traffic is anomalous. If an anomaly is detected:

- **Wired IoT devices:** Edge ML sends SSH CLI commands to the managed switch to disable the specific port (err-disable).
- **Wireless IoT devices:** Edge ML instructs the access point to block the corresponding MAC address.

In parallel, metadata is sent securely to the **cloud layer** (via MQTT over TLS), where a more powerful ML model performs a second validation. The cloud system notifies the administrator through the **SOC dashboard**, allowing them to review incidents and decide whether to maintain or lift the isolation.

---

## 2. Planning Phase

### 2.1 Define Primary Users

| Role | Description | Access Level |
|------|-------------|-------------|
| **Security Administrator** | Primary user — monitors threats, manages isolation, reviews forensics | Full access to all dashboard features |
| **Network Operator** | Manages devices and port states, performs manual overrides | Access to device management, port control |
| **Security Analyst** | Reviews historical data, attack timelines, false positives | Read access to forensics, logs, metrics |
| **System Administrator** | Manages the dashboard platform itself, user accounts, configuration | Platform configuration access |

> **TBD:** Final role definitions and granular permissions are subject to requirements finalization. The UI should be designed to support **role-based access control (RBAC)** that can be configured later.

### 2.2 Define Core Functionality

#### 2.2.1 Authentication

- Login page with username/password fields.
- **TBD:** OAuth/SSO integration, MFA, session management details.
- **TBD:** Backend authentication endpoint structure.
- UI must support future RBAC gating of features.

#### 2.2.2 System Overview Dashboard

The main dashboard is the SOC command center and includes:

| Component | Purpose |
|-----------|---------|
| **Overall Status Panel** | High-level system health: total devices, active threats, isolated ports, edge device status |
| **Live Packet/Flow Table** | Real-time table of incoming packets showing source/destination IP, port, protocol, classification (normal/attack), confidence score |
| **Attack-Specific Views (×4)** | Dedicated panels for each attack type: DOS, Botnet, Replay, MitM — each showing active detections, affected ports/devices, mitigation status |
| **Port & Device Management** | Real-time port state visualization, manual override controls (Unblock / Re-isolate) |
| **Incoming Packet Graph** | Time-series chart showing packet flow — normal traffic vs. attack traffic, segmented by attack type |
| **Recent Isolation Events Table** | Log of recent automated and manual isolation actions |

#### 2.2.3 Server / Device Management

- **ML Edge Device Health Monitoring:** CPU, memory, temperature, uptime, model inference latency for the Edge ML module (Raspberry Pi 4, 8 GB).
- **Feature Extraction Device Health Monitoring:** CPU, memory, capture rate, packets processed, uptime for the Feature Extraction device (Raspberry Pi 4, 4 GB).
- **Managed Switch Status:** Port states, connected devices, isolation status.
- **Access Point Status:** Connected wireless devices, MAC blacklist status.
- Actions: View device details, isolation status, manual override (Unblock / Isolate).

#### 2.2.4 Metrics & Analysis

- CPU usage chart (Edge ML, Feature Extraction, Cloud).
- Memory usage chart.
- Network throughput chart.
- Packet classification distribution (normal vs. each attack type).
- Model inference time chart.
- Time-range selector.
- **TBD:** Exact time-range selector behavior and available presets.

#### 2.2.5 Alert System

- Alerts table with severity badges (Critical, High, Medium, Low, Info).
- Alert details panel showing full detection context.
- Actions: Mark resolved, Maintain isolation, Lift isolation, Mark as False Positive.
- Attack Timeline view for forensic analysis.
- Confidence & Model Explainability section showing ML model confidence score and feature importance for each detection.

#### 2.2.6 Logs Viewer

- Logs table displaying system events, isolation actions, manual overrides, model decisions.
- Filter panel (fields TBD — likely: timestamp, severity, source device, event type, attack type).
- Pagination component.
- Audit trail for every isolation event.

---

## 3. Tech Stack Selection

### 3.1 Frontend

| Technology | Purpose |
|------------|---------|
| **Vite** | Build tool (chosen over CRA for performance and modern tooling) |
| **React** | UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Chart.js (react-chartjs-2)** | Charts and time-series visualizations |
| **React Router** | Client-side routing |
| **Context API** | State management (initial; may evolve to Zustand or Redux if needed) |
| **Axios** | REST API communication |
| **WebSocket (native or socket.io-client)** | Real-time streaming data |

### 3.2 Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI (Python)** | Backend REST API and WebSocket server |
| **MQTT Broker (Mosquitto)** or **AWS IoT Core** | Messaging between edge devices and cloud |
| **XGBoost** | Cloud ML model for second-pass validation |

### 3.3 Database

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary relational database |
| **TimescaleDB** (future) | Time-series extension for metrics data |

### Infrastructure (Cloud — AWS IaaS)

| Component | Specs |
|-----------|-------|
| DB Instance | 2–4 vCPU, 8–16 GB RAM, 200 GB SSD |
| ML Instance | 4 vCPU, 16 GB RAM, 100 GB SSD |
| MQTT Broker | 1 vCPU, 2 GB RAM |

---

## 4. System Architecture (High Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                        IoT Network                              │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │ IoT      │◄──►│ Feature          │◄──►│ Managed Switch   │  │
│  │ Devices   │    │ Extraction       │    │ (SSH CLI ctrl)   │  │
│  └──────────┘    │ (RPi4 4GB)       │    └──────────────────┘  │
│                  │ libpcap + mmap   │              ▲            │
│                  └────────┬─────────┘              │            │
│                           │ Local MQTT             │ err-disable│
│                           │ (Protobuf)             │ commands   │
│                           ▼                        │            │
│                  ┌──────────────────┐               │            │
│                  │ Edge ML Module   ├───────────────┘            │
│                  │ (RPi4 8GB)       │                            │
│                  │ TF Lite + XGBoost│──────► Access Point       │
│                  │ Paramiko SSH     │        (MAC blacklist)     │
│                  └────────┬─────────┘                            │
│                           │ MQTT over TLS                        │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Cloud Layer                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ MQTT Broker  │  │ ML Validation│  │ FastAPI Backend       │  │
│  │ (Mosquitto)  │──►│ (XGBoost)    │──►│ REST + WebSocket     │  │
│  └──────────────┘  └──────────────┘  └──────────┬───────────┘  │
│                                                   │              │
│  ┌──────────────┐                                │              │
│  │ PostgreSQL   │◄───────────────────────────────┘              │
│  │ (+ future    │                                                │
│  │  TimescaleDB)│                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SOC Admin Dashboard                            │
│            (React + Vite + TypeScript + Tailwind)               │
│                                                                  │
│  REST API ◄───── Static/config/historical data                  │
│  WebSocket ◄──── Real-time alerts, metrics, device health       │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Model: Hybrid REST + WebSocket

| Channel | Used For | Examples |
|---------|----------|---------|
| **REST API** | Static, historical, and configuration data | Login/auth, device config, historical logs, alert history, user management, false positive submissions |
| **WebSocket** | Real-time detection, alerts, and system health monitoring | Live packet flow, real-time attack detections, port state changes, device health streaming, isolation events |

This approach balances performance, scalability, and realism — closely mirroring real-world SOC platforms.

---

## 5. Project Setup

### 5.1 Repository Structure

```
iot-soc-dashboard/
├── frontend/          # React + Vite + TypeScript
├── backend/           # FastAPI (Python)
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── .gitignore
├── README.md
└── docker-compose.yml # TBD: Container orchestration
```

### 5.2 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Frontend runtime |
| npm or yarn | Latest | Package management |
| Python | ≥ 3.10 | Backend runtime |
| PostgreSQL | ≥ 14 | Database |
| Git | Latest | Version control |

---

## 6. Backend Setup

> **Note:** This guide focuses on frontend architecture. Backend sections provide the minimal setup context needed for frontend-backend integration. Detailed backend implementation is outside the scope of this frontend guide.

### 6.1 Initialize Backend

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib[bcrypt] python-multipart websockets paho-mqtt
```

Create `backend/` structure:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment config
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── device.py
│   │   ├── alert.py
│   │   ├── metric.py
│   │   └── log.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── device.py
│   │   ├── alert.py
│   │   ├── metric.py
│   │   └── log.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── devices.py
│   │   ├── alerts.py
│   │   ├── metrics.py
│   │   ├── logs.py
│   │   └── websocket.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── detection_service.py
│   │   └── isolation_service.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py      # DB connection setup
│   │   └── migrations/      # Alembic migrations (TBD)
│   └── websocket/
│       ├── __init__.py
│       └── manager.py       # WebSocket connection manager
├── requirements.txt
├── .env
└── Dockerfile               # TBD
```

### 6.2 Create Basic Server

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="IoT SOC Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# TBD: Include routers
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
# app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
# app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
# app.include_router(logs.router, prefix="/api/logs", tags=["logs"])
```

Run with:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 7. Database Design

### 7.1 User Collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Unique user identifier |
| username | VARCHAR(255) | Login username |
| email | VARCHAR(255) | User email |
| password_hash | VARCHAR(255) | Hashed password |
| role | VARCHAR(50) | User role (TBD: admin, operator, analyst, sysadmin) |
| is_active | BOOLEAN | Account active status |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### 7.2 Server / Device Collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Unique device identifier |
| name | VARCHAR(255) | Device display name |
| device_type | VARCHAR(50) | Type: `edge_ml`, `feature_extractor`, `switch`, `access_point`, `iot_device` |
| ip_address | VARCHAR(45) | Device IP |
| mac_address | VARCHAR(17) | Device MAC address |
| port_number | INTEGER | Switch port number (for wired devices) |
| status | VARCHAR(20) | `online`, `offline`, `isolated`, `warning` |
| isolation_status | VARCHAR(20) | `active`, `isolated`, `unblocked_override` |
| isolation_method | VARCHAR(20) | `port_disable`, `mac_blacklist`, `none` |
| last_seen | TIMESTAMP | Last heartbeat/communication |
| cpu_usage | FLOAT | Latest CPU % (TBD: may move to metrics) |
| memory_usage | FLOAT | Latest memory % (TBD: may move to metrics) |
| temperature | FLOAT | Device temperature (for RPi devices) |
| uptime_seconds | BIGINT | Device uptime |
| model_inference_latency_ms | FLOAT | ML inference time (for Edge ML only) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### 7.3 Metrics Collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Unique metric entry |
| device_id | UUID (FK) | Reference to device |
| metric_type | VARCHAR(50) | `cpu`, `memory`, `network_throughput`, `packet_rate`, `inference_latency` |
| value | FLOAT | Metric value |
| unit | VARCHAR(20) | Unit of measurement |
| timestamp | TIMESTAMP | When metric was recorded |

> **Future:** Migrate to TimescaleDB hypertable for time-series optimization.

### 7.4 Alert Collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Unique alert identifier |
| attack_type | VARCHAR(20) | `dos`, `botnet`, `replay`, `mitm` |
| severity | VARCHAR(10) | `critical`, `high`, `medium`, `low`, `info` |
| status | VARCHAR(20) | `active`, `resolved`, `false_positive`, `investigating` |
| source_ip | VARCHAR(45) | Source IP of detected attack |
| source_mac | VARCHAR(17) | Source MAC address |
| source_port | INTEGER | Switch port the packet came from |
| destination_ip | VARCHAR(45) | Target IP |
| destination_port | INTEGER | Target port |
| device_id | UUID (FK) | Affected device |
| confidence_score | FLOAT | ML model confidence (0.0–1.0) |
| model_version | VARCHAR(50) | ML model version that detected this |
| feature_importance | JSONB | Feature importance / explainability data |
| edge_decision | VARCHAR(20) | Edge ML action: `isolated`, `flagged`, `passed` |
| cloud_validation | VARCHAR(20) | Cloud ML validation: `confirmed`, `rejected`, `pending` |
| mitigation_action | VARCHAR(20) | `port_disabled`, `mac_blocked`, `none` |
| mitigation_status | VARCHAR(20) | `active`, `lifted`, `overridden` |
| resolved_by | UUID (FK) | User who resolved (if manually resolved) |
| resolved_at | TIMESTAMP | Resolution timestamp |
| false_positive_marked_by | UUID (FK) | User who marked as FP |
| notes | TEXT | Admin notes |
| raw_metadata | JSONB | Original packet metadata from feature extractor |
| created_at | TIMESTAMP | Detection timestamp |
| updated_at | TIMESTAMP | Last update time |

### 7.5 Log Collection

| Field | Type | Description |
|-------|------|-------------|
| id | UUID (PK) | Unique log entry |
| event_type | VARCHAR(50) | `isolation_triggered`, `isolation_lifted`, `manual_override`, `false_positive_marked`, `device_online`, `device_offline`, `login`, `config_change` |
| severity | VARCHAR(10) | `info`, `warning`, `error`, `critical` |
| source | VARCHAR(50) | Origin: `edge_ml`, `cloud_ml`, `admin_dashboard`, `system` |
| device_id | UUID (FK) | Related device (nullable) |
| alert_id | UUID (FK) | Related alert (nullable) |
| user_id | UUID (FK) | User who triggered action (nullable) |
| message | TEXT | Human-readable log message |
| metadata | JSONB | Additional structured data |
| timestamp | TIMESTAMP | Event timestamp |

---

## 8. Authentication System

### 8.1 Backend Auth (Summary)

- **TBD:** Full authentication flow details.
- Planned approach: JWT-based authentication with access and refresh tokens.
- Password hashing using bcrypt.
- **TBD:** OAuth/SSO integration, MFA.

### 8.2 Frontend Auth Pages

**Login Page** — UI-only implementation:

- Fields: Username/email, Password.
- "Remember me" checkbox (TBD: behavior).
- "Forgot password" link (TBD: flow).
- Form validation (client-side).
- Error state display for failed login.
- Loading state during authentication.
- Redirect to dashboard on success.

**TBD:** Registration page (may not be needed if admins create accounts), password reset flow.

---

## 9. Frontend Setup

### 9.1 Create Web App

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Core dependencies
npm install react-router-dom axios react-chartjs-2 chart.js
npm install chartjs-adapter-date-fns date-fns

# Dev dependencies
npm install -D tailwindcss @tailwindcss/vite
npm install -D @types/react @types/react-dom
```

Configure Tailwind in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})
```

### 9.2 Frontend Folder Structure

```
frontend/src/
├── assets/                     # Static assets (images, icons, fonts)
│
├── components/                 # Reusable UI components
│   ├── common/                 # Global reusable building blocks
│   │   ├── MetricCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ConfirmationModal.tsx
│   │   └── Toast.tsx
│   │
│   ├── charts/                 # Reusable chart components
│   │   ├── LineChart.tsx        # Time-series (packet flow, metrics)
│   │   ├── BarChart.tsx         # Attack type distribution
│   │   ├── DoughnutChart.tsx    # Traffic classification breakdown
│   │   └── AreaChart.tsx        # Network throughput
│   │
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── OverallStatusPanel.tsx
│   │   ├── LivePacketTable.tsx
│   │   ├── AttackSpecificView.tsx    # Generic; renders per attack type
│   │   ├── DosAttackPanel.tsx
│   │   ├── BotnetAttackPanel.tsx
│   │   ├── ReplayAttackPanel.tsx
│   │   ├── MitmAttackPanel.tsx
│   │   ├── IncomingPacketGraph.tsx
│   │   └── RecentIsolationTable.tsx
│   │
│   ├── devices/                # Device management components
│   │   ├── DeviceTable.tsx
│   │   ├── DeviceStatusBadge.tsx
│   │   ├── DeviceDetailsDrawer.tsx
│   │   ├── EdgeMLHealthCard.tsx
│   │   ├── FeatureExtractorHealthCard.tsx
│   │   ├── PortStateVisualization.tsx
│   │   └── ManualOverrideControls.tsx
│   │
│   ├── alerts/                 # Alert system components
│   │   ├── AlertsTable.tsx
│   │   ├── AlertDetailsPanel.tsx
│   │   ├── AlertActionButtons.tsx
│   │   ├── AttackTimeline.tsx
│   │   ├── ConfidenceScoreDisplay.tsx
│   │   ├── ModelExplainability.tsx
│   │   └── FalsePositiveControls.tsx
│   │
│   ├── metrics/                # Metrics page components
│   │   ├── CpuUsageChart.tsx
│   │   ├── MemoryUsageChart.tsx
│   │   ├── NetworkUsageChart.tsx
│   │   ├── PacketClassificationChart.tsx
│   │   ├── InferenceLatencyChart.tsx
│   │   └── TimeRangeSelector.tsx
│   │
│   └── logs/                   # Logs viewer components
│       ├── LogsTable.tsx
│       ├── LogFilterPanel.tsx
│       └── Pagination.tsx
│
├── layouts/                    # Layout components
│   ├── DashboardLayout.tsx     # Sidebar + TopNavbar + Main Content
│   ├── Sidebar.tsx
│   ├── TopNavbar.tsx
│   └── AuthLayout.tsx          # Layout for login/auth pages
│
├── pages/                      # Route-level page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── DevicesPage.tsx
│   ├── MetricsPage.tsx
│   ├── AlertsPage.tsx
│   ├── LogsPage.tsx
│   ├── ForensicsPage.tsx       # Attack timeline + deep analysis
│   └── SettingsPage.tsx        # TBD: if needed
│
├── hooks/                      # Custom React hooks
│   ├── useWebSocket.ts         # WebSocket connection management
│   ├── useAuth.ts              # Authentication hook
│   ├── useTheme.ts             # Theme toggle hook
│   ├── useNotification.ts      # Toast/notification hook
│   ├── useDeviceHealth.ts      # Real-time device health
│   ├── useLivePackets.ts       # Live packet stream
│   └── useAlerts.ts            # Real-time alerts
│
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── NotificationContext.tsx
│   └── WebSocketContext.tsx
│
├── services/                   # API service layer
│   ├── apiClient.ts            # Axios instance with interceptors
│   ├── authService.ts          # Auth API calls
│   ├── deviceService.ts        # Device/server API calls
│   ├── alertService.ts         # Alert API calls
│   ├── metricService.ts        # Metrics API calls
│   ├── logService.ts           # Log API calls
│   └── websocketService.ts     # WebSocket connection manager
│
├── types/                      # TypeScript type definitions
│   ├── auth.types.ts
│   ├── device.types.ts
│   ├── alert.types.ts
│   ├── metric.types.ts
│   ├── log.types.ts
│   ├── packet.types.ts
│   └── websocket.types.ts
│
├── utils/                      # Utility functions
│   ├── formatters.ts           # Date, number, byte formatters
│   ├── constants.ts            # App-wide constants
│   └── validators.ts           # Form validation helpers
│
├── styles/                     # Global styles and theme tokens
│   ├── index.css               # Tailwind imports + CSS custom properties
│   └── theme.ts                # Theme token definitions
│
├── App.tsx                     # Root component with routing
├── main.tsx                    # Entry point
└── vite-env.d.ts               # Vite type declarations
```

---

## 10. UI Layout Design

### 10.1 Design Goals

- **Clarity:** Security admins need to assess threats at a glance — prioritize visual hierarchy.
- **Speed:** Real-time data must feel instant; minimize perceived latency.
- **Density:** SOC dashboards are data-dense; balance information density with readability.
- **Actionability:** Every alert should have clear, accessible action paths (resolve, override, investigate).
- **Accessibility:** Support keyboard navigation, screen readers, and color-blind-friendly palettes.

### 10.2 Design Style and Direction

- **Professional SOC aesthetic** — dark mode as primary for extended monitoring sessions; light mode available.
- Clean, minimal chrome with dense data presentation.
- Consistent icon language for attack types and statuses.
- Animation used sparingly — only for real-time updates and state transitions.

### 10.3 Color Theme Systems

#### 10.3.1 Theme Strategy

- Use CSS custom properties (design tokens) for all colors.
- Toggle between light and dark themes via a class on `<html>` or `<body>`.
- **Never hardcode color values inside components** — always reference tokens.

#### 10.3.2 Color Roles

| Token | Purpose |
|-------|---------|
| `--color-primary` | Primary actions, active navigation, links |
| `--color-background` | Page background |
| `--color-surface` | Card/panel backgrounds |
| `--color-text-primary` | Main text |
| `--color-text-secondary` | Secondary/muted text |
| `--color-success` | Healthy status, resolved alerts |
| `--color-warning` | Warning status, medium-severity alerts |
| `--color-danger` | Critical status, high-severity alerts, active attacks |
| `--color-info` | Informational elements |

#### 10.3.3 Example Light Theme

```css
:root {
  --color-primary: #2563EB;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-danger: #DC2626;
  --color-info: #0891B2;
}
```

#### 10.3.4 Example Dark Theme

```css
.dark {
  --color-primary: #3B82F6;
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-success: #22C55E;
  --color-warning: #FBBF24;
  --color-danger: #EF4444;
  --color-info: #22D3EE;
}
```

#### 10.3.5 Typography System

| Element | Size | Weight | Token |
|---------|------|--------|-------|
| H1 (Page title) | 24px / 1.5rem | Bold (700) | `text-2xl font-bold` |
| H2 (Section title) | 20px / 1.25rem | Semibold (600) | `text-xl font-semibold` |
| H3 (Card title) | 16px / 1rem | Semibold (600) | `text-base font-semibold` |
| Body | 14px / 0.875rem | Normal (400) | `text-sm` |
| Caption / Label | 12px / 0.75rem | Medium (500) | `text-xs font-medium` |
| Monospace (IPs, MACs, logs) | 13px / 0.8125rem | Normal (400) | `font-mono text-sm` |

Font family: System font stack (Inter or similar if loaded).

#### 10.3.6 Spacing & Layout System

- Use Tailwind's spacing scale consistently: `4px` base (Tailwind's `1` unit).
- Card padding: `p-4` (16px) or `p-6` (24px).
- Section gaps: `gap-6` (24px).
- Sidebar width: `w-64` (256px) expanded, `w-16` (64px) collapsed.
- Content max-width: Full width (SOC dashboards use all available space).

### 10.4 Component Design Patterns

#### 10.4.1 Layout Pattern

```
┌──────────────────────────────────────────────────────┐
│  Top Navbar (h-16)                        [Theme] [User] │
├──────┬───────────────────────────────────────────────┤
│      │                                                │
│ Side │          Main Content Area                     │
│ bar  │          (scrollable)                          │
│(w-64)│                                                │
│      │                                                │
│      │                                                │
└──────┴───────────────────────────────────────────────┘
```

#### 10.4.2 Card Pattern

- Surface background with subtle border or shadow.
- Consistent header area with title and optional action.
- Loading skeleton state.
- Error state with retry action.
- Empty state with descriptive message.

#### 10.4.3 Table Pattern

- Sortable columns (click header to sort).
- Row hover highlight.
- Status badges inline.
- Action buttons in last column.
- Pagination at bottom.
- Loading skeleton rows.
- Empty state when no data.

#### 10.4.4 Feedback Pattern

- Toast notifications for user actions (isolation override, alert resolved).
- Inline error messages for form validation.
- Confirmation modal for destructive actions (lifting isolation, marking false positive).

### 10.5 UX Patterns for Monitoring Dashboards

#### 10.5.1 Status Color Convention

| Color | Meaning | Usage |
|-------|---------|-------|
| **Green** | Healthy / Normal | Device online, port active, alert resolved |
| **Yellow/Amber** | Warning | Elevated traffic, medium-severity alert, device degraded |
| **Red** | Critical / Active Threat | Active attack, isolated port, critical alert |
| **Grey** | Offline / Unknown | Device offline, no data |
| **Blue** | Informational | Info-level alerts, system events |

#### 10.5.2 Alert Visibility Hierarchy

1. **Critical alerts** — top of dashboard, red banner or persistent notification.
2. **Active attack indicators** — prominent badges on attack-specific panels.
3. **Warning indicators** — visible but not intrusive.
4. **Info indicators** — subtle, available on demand.

#### 10.5.3 Information Hierarchy (Dashboard Priority Order)

1. **Active Alerts & Active Attacks** — most prominent, top of page.
2. **System Health** — edge device status, overall status panel.
3. **Resource Metrics** — CPU, memory, network charts.
4. **Historical Analytics** — attack timeline, historical data.

### 10.6 Frontend Architecture Pattern

#### Folder Structure

As defined in [Section 9.2](#92-frontend-folder-structure).

Key principles:

- **Components** are grouped by feature domain (dashboard, devices, alerts, metrics, logs).
- **Common components** are truly reusable across all domains.
- **Pages** are thin wrappers that compose components and connect to data.
- **Hooks** encapsulate data-fetching and real-time subscription logic.
- **Services** handle all API communication.
- **Contexts** provide global state (auth, theme, notifications, WebSocket).

### 10.7 Backend Architecture Pattern

#### Layered Architecture

```
Routers (API endpoints)
    ↓
Services (Business logic)
    ↓
Models (Database ORM)
    ↓
Database (PostgreSQL)
```

- **Routers:** Define HTTP and WebSocket endpoints. No business logic.
- **Services:** Contain business logic, data transformation, decision-making.
- **Models:** SQLAlchemy ORM definitions mapping to database tables.
- **Schemas:** Pydantic models for request/response validation and serialization.

### 10.8 State Management Strategy (Frontend)

| State Type | Solution | Examples |
|------------|----------|---------|
| **Global Auth** | `AuthContext` | User session, JWT tokens, role |
| **Global Theme** | `ThemeContext` | Light/dark mode preference |
| **Global Notifications** | `NotificationContext` | Toast queue, notification list |
| **Real-time Data** | `WebSocketContext` + custom hooks | Live packets, alerts, device health |
| **Page-level Data** | Local state + Axios (via hooks) | Fetched lists, filters, pagination |
| **Component-level UI** | `useState` | Modal open/close, form inputs, sort state |

Initial approach uses Context API. If state complexity grows, consider migrating to Zustand for selected domains.

### 10.9 Accessibility Basics

- All interactive elements must be keyboard-navigable.
- Status colors must be paired with text labels or icons (do not rely on color alone).
- ARIA labels on icon-only buttons.
- Focus indicators visible in both themes.
- Screen reader-friendly table structures.
- Minimum contrast ratios: 4.5:1 for normal text, 3:1 for large text.

---

## 11. Development Order

Follow this phased approach to incrementally build and validate the dashboard:

### Phase 1: Foundation

| Step | Task | Description |
|------|------|-------------|
| 1.1 | **Project scaffolding** | Vite + React + TypeScript + Tailwind setup |
| 1.2 | **Theme system** | CSS custom properties, ThemeContext, ThemeToggle |
| 1.3 | **Global layout** | DashboardLayout, Sidebar, TopNavbar |
| 1.4 | **Routing** | React Router setup with all page routes |
| 1.5 | **Common components** | MetricCard, StatusBadge, DataTable, PageHeader, LoadingSkeleton, EmptyState, ErrorState, Toast |

### Phase 2: Authentication

| Step | Task | Description |
|------|------|-------------|
| 2.1 | **Login page UI** | Form with validation, error/loading states |
| 2.2 | **AuthContext** | Token storage, login/logout methods, auth state |
| 2.3 | **Protected routes** | Route guards based on auth state |
| 2.4 | **Connect to backend** | Integrate with FastAPI auth endpoints |

### Phase 3: Dashboard Overview

| Step | Task | Description |
|------|------|-------------|
| 3.1 | **Overall Status Panel** | System health summary cards |
| 3.2 | **WebSocket setup** | WebSocketContext, useWebSocket hook |
| 3.3 | **Live Packet Table** | Real-time packet flow with classification |
| 3.4 | **Incoming Packet Graph** | Time-series chart (normal vs. attack traffic) |
| 3.5 | **Attack-Specific Panels** | Four panels: DOS, Botnet, Replay, MitM |
| 3.6 | **Recent Isolation Table** | Recent isolation events |
| 3.7 | **Connect to backend** | REST + WebSocket integration |

### Phase 4: Device Management

| Step | Task | Description |
|------|------|-------------|
| 4.1 | **Devices Table** | List all devices with status badges |
| 4.2 | **Device Details Drawer** | Detailed view with health metrics |
| 4.3 | **Edge ML Health Card** | CPU, memory, temp, inference latency |
| 4.4 | **Feature Extractor Health Card** | CPU, memory, capture rate |
| 4.5 | **Port State Visualization** | Real-time port state display |
| 4.6 | **Manual Override Controls** | Unblock / Re-isolate buttons with confirmation |

### Phase 5: Metrics & Charts

| Step | Task | Description |
|------|------|-------------|
| 5.1 | **Reusable chart components** | LineChart, BarChart, DoughnutChart, AreaChart |
| 5.2 | **CPU/Memory/Network charts** | Per-device metric charts |
| 5.3 | **Packet classification chart** | Distribution by attack type |
| 5.4 | **Inference latency chart** | Edge ML model performance |
| 5.5 | **Time-range selector** | Date range picker with presets |

### Phase 6: Alerts System

| Step | Task | Description |
|------|------|-------------|
| 6.1 | **Alerts Table** | Sortable, filterable alerts list |
| 6.2 | **Alert Details Panel** | Full detection context |
| 6.3 | **Alert Actions** | Mark resolved, Maintain/Lift isolation |
| 6.4 | **False Positive Controls** | Mark as FP, manual override |
| 6.5 | **Confidence Score Display** | ML confidence visualization |
| 6.6 | **Model Explainability** | Feature importance display |

### Phase 7: Forensics

| Step | Task | Description |
|------|------|-------------|
| 7.1 | **Attack Timeline** | Chronological view of attack events |
| 7.2 | **Forensics Page** | Deep-dive analysis interface |

### Phase 8: Logs Viewer

| Step | Task | Description |
|------|------|-------------|
| 8.1 | **Logs Table** | Paginated log entries |
| 8.2 | **Filter Panel** | Filter by time, severity, source, event type, attack type |
| 8.3 | **Pagination** | Server-side pagination component |

### Phase 9: Polish & RBAC

| Step | Task | Description |
|------|------|-------------|
| 9.1 | **Role-based access** | Conditionally render features based on user role |
| 9.2 | **Settings page** | TBD: user preferences, system config |
| 9.3 | **Responsive design** | Adapt layout for different screen sizes |
| 9.4 | **Performance optimization** | Lazy loading, memoization, virtual scrolling for tables |

---

## 12. Security Requirements

| Requirement | Description | Status |
|-------------|-------------|--------|
| **HTTPS** | All frontend-backend communication over TLS | Required |
| **JWT Auth** | Stateless authentication with short-lived access tokens | Planned |
| **Token Storage** | Store tokens in httpOnly cookies (preferred) or secure memory | TBD |
| **CORS** | Restrict to known frontend origins | Configured |
| **Input Validation** | Validate all user inputs client-side and server-side | Required |
| **XSS Protection** | React's default escaping + CSP headers | Default |
| **CSRF Protection** | Token-based CSRF protection for state-changing requests | TBD |
| **Rate Limiting** | API rate limiting to prevent abuse | TBD |
| **Audit Logging** | Log all manual override and configuration actions | Required |
| **Role-Based Access** | UI elements hidden/disabled based on user role | TBD |
| **WebSocket Auth** | Authenticate WebSocket connections with JWT | Required |
| **MQTT Security** | MQTT over TLS between edge and cloud | Required |

---

## 13. Deployment Plan

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| **Local Dev** | Development and testing | Vite dev server + local FastAPI + local PostgreSQL |
| **Staging** | Pre-production testing | AWS EC2 or similar, mirrors production |
| **Production** | Live deployment | AWS EC2 (or ECS), RDS PostgreSQL, CloudFront for static assets |

### Deployment Steps (TBD — High Level)

1. Build frontend: `npm run build` (produces `dist/` folder).
2. Serve static files via Nginx, S3 + CloudFront, or similar.
3. Deploy FastAPI backend via Docker + EC2 or ECS.
4. Configure PostgreSQL on RDS.
5. Set up MQTT broker (Mosquitto on EC2 or AWS IoT Core).
6. Configure environment variables per environment.
7. Set up CI/CD pipeline (GitHub Actions or similar).

---

## 14. Versioning & Git Workflow

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/<name>` | Individual feature branches |
| `bugfix/<name>` | Bug fix branches |
| `release/<version>` | Release preparation |
| `hotfix/<name>` | Emergency production fixes |

### Commit Convention

Use Conventional Commits:

```
feat: add DOS attack panel component
fix: resolve WebSocket reconnection issue
docs: update API endpoint documentation
style: fix Tailwind class ordering
refactor: extract chart config to shared utility
test: add unit tests for AlertsTable
chore: update dependencies
```

### Version Numbering

Semantic Versioning: `MAJOR.MINOR.PATCH`

- MAJOR: Breaking changes.
- MINOR: New features, backward-compatible.
- PATCH: Bug fixes, backward-compatible.

---

## 15. Requirements Engineering

### 15.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | System shall display real-time packet flow from the feature extraction device | Must Have | Planned |
| FR-02 | System shall classify and display packets as Normal, DOS, Botnet, Replay, or MitM | Must Have | Planned |
| FR-03 | System shall show which port each detected attack packet originates from | Must Have | Planned |
| FR-04 | System shall display mitigation status (port isolated / MAC blocked) for each attack | Must Have | Planned |
| FR-05 | Admins shall be able to manually undo port isolation (Unblock) | Must Have | Planned |
| FR-06 | Admins shall be able to manually re-isolate a previously unblocked port | Must Have | Planned |
| FR-07 | System shall display incoming packet graph showing normal vs. attack traffic over time | Must Have | Planned |
| FR-08 | System shall monitor and display health of Edge ML device (CPU, memory, temp, uptime, inference latency) | Must Have | Planned |
| FR-09 | System shall monitor and display health of Feature Extraction device (CPU, memory, capture rate, uptime) | Must Have | Planned |
| FR-10 | System shall provide attack-specific views for each of the 4 attack types | Must Have | Planned |
| FR-11 | System shall display an attack timeline for forensic analysis | Should Have | Planned |
| FR-12 | System shall show ML model confidence scores for each detection | Should Have | Planned |
| FR-13 | System shall provide model explainability (feature importance) for each detection | Should Have | Planned |
| FR-14 | Admins shall be able to mark detections as False Positive | Must Have | Planned |
| FR-15 | System shall support user authentication with login/logout | Must Have | Planned |
| FR-16 | System shall support Light and Dark theme modes | Should Have | Planned |
| FR-17 | System shall display filterable, paginated logs of all system events | Should Have | Planned |
| FR-18 | System shall provide real-time notifications for new critical alerts | Must Have | Planned |
| FR-19 | System shall display overall system status (total devices, active threats, isolated ports) | Must Have | Planned |
| FR-20 | System shall support role-based access control | Could Have | TBD |

### 15.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Dashboard initial load time | < 3 seconds |
| NFR-02 | Real-time data update latency (WebSocket) | < 500ms end-to-end |
| NFR-03 | UI responsiveness (interaction feedback) | < 100ms |
| NFR-04 | Browser support | Chrome, Firefox, Edge (latest 2 versions) |
| NFR-05 | Concurrent WebSocket connections | TBD (based on expected admin count) |
| NFR-06 | Uptime | 99.9% (production target) |
| NFR-07 | Accessibility | WCAG 2.1 Level AA |
| NFR-08 | Security | OWASP Top 10 compliance |

### 15.3 Dataflow Diagram

```
Level 0 — Context Diagram:

┌──────────┐                              ┌───────────────┐
│ IoT      │──── network traffic ────────►│ Feature       │
│ Devices  │                               │ Extraction    │
└──────────┘                               │ Device        │
                                           └──────┬────────┘
                                                  │ packet metadata
                                                  │ (MQTT/Protobuf)
                                                  ▼
                                           ┌───────────────┐
                                           │ Edge ML       │──── isolation commands ──►  Switch / AP
                                           │ Module        │
                                           └──────┬────────┘
                                                  │ metadata (MQTT/TLS)
                                                  ▼
                                           ┌───────────────┐
                                           │ Cloud Layer   │
                                           │ (FastAPI +    │
                                           │  ML + DB)     │
                                           └──────┬────────┘
                                                  │ REST + WebSocket
                                                  ▼
                                           ┌───────────────┐
                                           │ SOC Admin     │◄──── Admin interactions
                                           │ Dashboard     │      (view, override, resolve)
                                           └───────────────┘
```

```
Level 1 — Dashboard Data Flows:

┌─────────────────────────────────────────────────────────────────┐
│                     SOC Dashboard (Frontend)                     │
│                                                                  │
│  ┌──────────────┐    REST GET    ┌──────────────┐               │
│  │ Historical   │◄──────────────│ Backend API  │               │
│  │ Data Views   │               │              │               │
│  │ (Logs,       │  REST POST    │  /api/alerts │               │
│  │  Metrics,    │──────────────►│  /api/devices│               │
│  │  Forensics)  │  (overrides)  │  /api/metrics│               │
│  └──────────────┘               │  /api/logs   │               │
│                                  │  /api/auth   │               │
│  ┌──────────────┐   WebSocket   │              │               │
│  │ Real-time    │◄─────────────│  /ws/live    │               │
│  │ Views        │               │              │               │
│  │ (Packets,    │               └──────────────┘               │
│  │  Alerts,     │                                               │
│  │  Device      │                                               │
│  │  Health)     │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 15.4 API Design

> **Note:** Exact endpoint structures and request/response schemas are TBD. The following are planned endpoints based on functional requirements.

#### REST API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Get device details |
| POST | `/api/devices/:id/override` | Manual override (unblock/isolate) |
| GET | `/api/alerts` | List alerts (with filters, pagination) |
| GET | `/api/alerts/:id` | Get alert details (includes confidence, explainability) |
| PATCH | `/api/alerts/:id` | Update alert status (resolve, maintain, lift) |
| POST | `/api/alerts/:id/false-positive` | Mark alert as false positive |
| GET | `/api/metrics` | Get historical metrics (with time range, device filter) |
| GET | `/api/logs` | Get logs (with filters, pagination) |
| GET | `/api/forensics/timeline` | Get attack timeline data |

#### WebSocket Channels

| Channel / Event | Direction | Purpose |
|-----------------|-----------|---------|
| `ws/live/packets` | Server → Client | Live packet flow stream |
| `ws/live/alerts` | Server → Client | Real-time new alert notifications |
| `ws/live/device-health` | Server → Client | Real-time device health metrics |
| `ws/live/port-state` | Server → Client | Real-time port state changes |
| `ws/live/isolation-events` | Server → Client | Real-time isolation event notifications |

> **TBD:** Exact WebSocket message format (JSON schema), subscription mechanism, reconnection strategy.

---

## 16. Error Handling Strategy

### Frontend Error Types

| Error Type | Handling | User Feedback |
|------------|----------|---------------|
| **Network Error** (API unreachable) | Retry with exponential backoff | ErrorState component with "Retry" button |
| **Authentication Error** (401) | Redirect to login, clear tokens | Toast: "Session expired. Please log in again." |
| **Authorization Error** (403) | Show access denied message | ErrorState: "You don't have permission to access this resource." |
| **Validation Error** (400/422) | Display field-level errors | Inline form validation messages |
| **Server Error** (500) | Log error, show generic message | ErrorState: "Something went wrong. Please try again." |
| **WebSocket Disconnect** | Auto-reconnect with backoff | Banner: "Reconnecting to live feed..." |
| **Unexpected Error** | Global error boundary | Fallback UI with error details (dev mode) |

### Implementation

- **Axios interceptors** in `apiClient.ts` for global HTTP error handling.
- **React Error Boundary** component wrapping the main content area.
- **WebSocket reconnection logic** in `useWebSocket` hook with configurable retry count and delay.

---

## 17. Loading & Empty States

### Loading States

| Context | Loading UI |
|---------|-----------|
| **Page load** | Full-page skeleton matching layout structure |
| **Table data** | Skeleton rows (5–10 rows) matching column structure |
| **Chart data** | Chart-shaped skeleton with pulsing animation |
| **Card data** | Card skeleton with header and value placeholder |
| **Action in progress** | Button loading spinner, disabled state |
| **WebSocket connecting** | "Connecting to live feed..." status indicator |

### Empty States

| Context | Empty UI |
|---------|---------|
| **No alerts** | Illustration + "No active alerts. System is healthy." |
| **No devices** | "No devices registered." + guidance to configure |
| **No logs matching filter** | "No logs match your filter criteria." + "Clear filters" button |
| **No metrics data** | "No metric data available for the selected time range." |
| **No attack detections** | Per attack panel: "No [attack type] detections." |

---

## 18. Logging & Monitoring of the Dashboard

> **Note:** This section covers monitoring of the **dashboard application itself**, not the IoT security monitoring.

### Frontend Logging

- **Console logging** in development mode only.
- **Error tracking:** TBD — consider Sentry or similar for production error reporting.
- **Performance monitoring:** TBD — consider Web Vitals reporting.

### Backend Logging

- Structured JSON logging (Python `logging` + `structlog` or similar).
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL.
- All API requests logged with timestamp, method, path, status code, duration.
- All manual override actions logged with user ID and action details.

### Future: Prometheus + Grafana

As noted in the project spec, Prometheus + Grafana are planned for future implementation to monitor the dashboard and backend infrastructure themselves.

---

## 19. Testing

### Frontend Testing Strategy

| Test Type | Tool | Scope |
|-----------|------|-------|
| **Unit Tests** | Vitest + React Testing Library | Individual components, hooks, utils |
| **Integration Tests** | Vitest + MSW (Mock Service Worker) | Component interactions with mocked APIs |
| **E2E Tests** | Playwright or Cypress | Critical user flows (login, override, alert resolution) |
| **Visual Regression** | TBD (Chromatic, Percy, or similar) | UI consistency across changes |

### Key Test Scenarios

- Login flow (success, failure, validation).
- Alert lifecycle (detection → display → resolve / mark false positive).
- Manual override flow (unblock → confirmation → success/failure).
- WebSocket reconnection behavior.
- Theme toggle persistence.
- Data table sorting, filtering, pagination.
- Attack-specific panel rendering for each attack type.
- Device health card displays correct metrics.

### Backend Testing

- Unit tests for service layer logic.
- Integration tests for API endpoints.
- WebSocket connection and message delivery tests.
- **TBD:** Load testing for concurrent WebSocket connections.

---

## 20. Performance Considerations

| Area | Strategy |
|------|----------|
| **Bundle Size** | Code splitting with React.lazy + Suspense per route |
| **Re-renders** | React.memo for expensive components, useMemo for derived data |
| **Large Tables** | Virtual scrolling (react-virtual or similar) for 100+ row tables |
| **Charts** | Limit data points displayed; downsample historical data server-side |
| **WebSocket** | Throttle/debounce high-frequency updates (e.g., packet flow) to avoid UI thrashing |
| **Images/Assets** | Optimize and lazy-load non-critical assets |
| **API Calls** | Cache static data (device list, config); use SWR-like patterns for stale-while-revalidate |
| **Initial Load** | Preload critical CSS; defer non-essential JS |

---

## 21. Scalability Considerations

| Dimension | Current (Research) | Future (Production) |
|-----------|-------------------|---------------------|
| **Users** | 1–5 admins | 10–50+ concurrent users |
| **Devices** | ~10 IoT devices | 100+ IoT devices |
| **Data Volume** | Moderate packet rates | High-frequency data (TPACKET_V3) |
| **Database** | PostgreSQL | PostgreSQL + TimescaleDB for time-series |
| **Caching** | None | Redis for session/cache layer |
| **Frontend** | Single instance | CDN-served static assets |
| **Backend** | Single FastAPI instance | Multiple instances behind load balancer |
| **WebSocket** | Direct connection | WebSocket gateway with pub/sub |

---

## 22. Backup and Data Retention Policy

| Data Type | Retention Period | Backup Frequency | Storage |
|-----------|-----------------|-------------------|---------|
| **Alert Records** | TBD (suggest: 1 year) | Daily | PostgreSQL + S3 archive |
| **Metrics Data** | TBD (suggest: 90 days hot, 1 year cold) | Daily | PostgreSQL → S3 |
| **Logs** | TBD (suggest: 90 days hot, 1 year cold) | Daily | PostgreSQL → S3 |
| **User Data** | Indefinite (while active) | Daily | PostgreSQL |
| **Attack Datasets** | Long-term (anonymized) | Weekly | S3 (as noted in spec) |
| **Database Backups** | 30 days | Daily automated | S3 |

> **TBD:** Exact retention periods, backup automation tooling, data anonymization process.

---

## 23. Environment Configuration

### Environment Variables

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=IoT SOC Dashboard
VITE_APP_VERSION=0.1.0

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/soc_dashboard
SECRET_KEY=<generate-secure-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USE_TLS=false
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

### Environment Matrix

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| API_BASE_URL | `localhost:8000` | `staging-api.example.com` | `api.example.com` |
| WS_URL | `ws://localhost:8000/ws` | `wss://staging-api.example.com/ws` | `wss://api.example.com/ws` |
| MQTT_USE_TLS | `false` | `true` | `true` |
| LOG_LEVEL | `DEBUG` | `INFO` | `WARNING` |
| ENVIRONMENT | `development` | `staging` | `production` |

---

## 24. Documentation Plan

| Document | Content | Audience |
|----------|---------|----------|
| **README.md** | Project overview, setup instructions, tech stack | All developers |
| **ARCHITECTURE.md** | System architecture, data flow, communication model | Developers, reviewers |
| **API_DOCS.md** | REST + WebSocket API specifications | Frontend + Backend developers |
| **COMPONENT_GUIDE.md** | Reusable component catalog with props documentation | Frontend developers |
| **DEPLOYMENT.md** | Deployment steps per environment | DevOps, system admins |
| **USER_GUIDE.md** | Dashboard usage instructions for end users | Security administrators |
| **CONTRIBUTING.md** | Git workflow, coding standards, PR process | All contributors |
| **CHANGELOG.md** | Version history with changes | All stakeholders |

> Auto-generate API docs from FastAPI's built-in OpenAPI/Swagger support at `/docs`.

---

## 25. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **WebSocket connection instability** | Medium | High (loss of real-time data) | Auto-reconnect with exponential backoff; REST polling fallback |
| **High-frequency data overwhelming UI** | Medium | Medium (UI lag/crash) | Throttle WebSocket updates; virtual scrolling; limit displayed data points |
| **False positives causing unnecessary isolation** | Medium | High (service disruption) | False positive marking; manual override; cloud double-validation |
| **Edge device failure** | Low | High (no detection) | Health monitoring; alerts for device offline; future redundant Edge ML |
| **Database performance under high data volume** | Medium | Medium (slow queries) | TimescaleDB migration; data retention policies; query optimization |
| **Security breach of dashboard** | Low | Critical | JWT auth; HTTPS; CORS; input validation; audit logging |
| **Browser compatibility issues** | Low | Low | Target modern browsers only; automated cross-browser testing |
| **Scope creep in research project** | High | Medium (delayed delivery) | Strict phased development; TBD markers for undefined features |
| **MQTT message loss** | Low | Medium (missed detections) | QoS settings; persistent sessions; cloud validation as safety net |
| **Model drift in ML detection** | Medium | High (degraded detection) | Monitor confidence scores; model explainability; planned model registry |

---

## Appendix A: Core Reusable Component Specifications

### MetricCard

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Card title (e.g., "Total Devices") |
| `value` | string \| number | Display value |
| `unit` | string (optional) | Unit label (e.g., "%", "ms", "pkts/s") |
| `status` | `'healthy' \| 'warning' \| 'critical' \| 'offline'` | Status coloring |
| `trend` | `'up' \| 'down' \| 'stable'` (optional) | Trend indicator |
| `icon` | ReactNode (optional) | Icon element |
| `loading` | boolean | Show skeleton state |

### StatusBadge

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'online' \| 'offline' \| 'isolated' \| 'warning' \| 'error'` | Status value |
| `size` | `'sm' \| 'md' \| 'lg'` | Badge size |
| `showDot` | boolean | Show colored dot indicator |

### SeverityBadge

| Prop | Type | Description |
|------|------|-------------|
| `severity` | `'critical' \| 'high' \| 'medium' \| 'low' \| 'info'` | Alert severity |

### DataTable

| Prop | Type | Description |
|------|------|-------------|
| `columns` | ColumnDef[] | Column definitions (header, accessor, sortable, render) |
| `data` | any[] | Row data |
| `loading` | boolean | Show skeleton rows |
| `emptyMessage` | string | Message when no data |
| `onSort` | function (optional) | Sort handler |
| `pagination` | PaginationConfig (optional) | Pagination configuration |
| `onRowClick` | function (optional) | Row click handler |

---

## Appendix B: Attack-Specific Panel Data Fields

> **Note:** Exact fields depend on the features extracted by the feature extraction device and the ML model outputs. The following are based on the project specification.

### Common Fields (All Attack Types)

| Field | Description |
|-------|-------------|
| Timestamp | Detection time |
| Source IP | Attacker IP address |
| Source MAC | Attacker MAC address |
| Source Port (switch) | Physical switch port the packet arrived on |
| Destination IP | Target device IP |
| Protocol | Network protocol (TCP, UDP, ICMP, etc.) |
| Confidence Score | ML model confidence (0.0–1.0) |
| Edge Decision | `isolated` / `flagged` / `passed` |
| Cloud Validation | `confirmed` / `rejected` / `pending` |
| Mitigation Status | `port_disabled` / `mac_blocked` / `none` |

### Attack-Specific Additional Fields (TBD)

| Attack Type | Possible Additional Fields |
|-------------|---------------------------|
| **DOS** | Packet rate, byte count, flow duration, protocol distribution |
| **Botnet** | C&C communication pattern, beacon interval, payload pattern indicators |
| **Replay** | Duplicate packet count, replay window, original packet hash |
| **MitM** | ARP anomaly indicators, MAC spoofing flags, certificate mismatch indicators |

> **TBD:** Confirm exact fields with ML model output schema and feature extractor specification.

---

## Appendix C: WebSocket Message Schema (Draft)

> **TBD:** Final message schemas to be defined during backend implementation.

### Live Packet Event

```json
{
  "type": "packet",
  "timestamp": "2025-01-15T10:30:00.123Z",
  "source_ip": "192.168.1.100",
  "source_mac": "AA:BB:CC:DD:EE:FF",
  "source_port": 3,
  "destination_ip": "192.168.1.1",
  "destination_port": 80,
  "protocol": "TCP",
  "packet_size": 1500,
  "classification": "dos",
  "confidence": 0.95,
  "is_attack": true
}
```

### Alert Event

```json
{
  "type": "alert",
  "id": "alert-uuid-here",
  "attack_type": "botnet",
  "severity": "critical",
  "source_ip": "192.168.1.105",
  "source_mac": "11:22:33:44:55:66",
  "source_port": 7,
  "confidence": 0.88,
  "edge_decision": "isolated",
  "mitigation_action": "port_disabled",
  "timestamp": "2025-01-15T10:30:05.456Z"
}
```

### Device Health Event

```json
{
  "type": "device_health",
  "device_id": "device-uuid-here",
  "device_type": "edge_ml",
  "cpu_usage": 45.2,
  "memory_usage": 62.8,
  "temperature": 58.3,
  "uptime_seconds": 86400,
  "inference_latency_ms": 12.5,
  "timestamp": "2025-01-15T10:30:10.789Z"
}
```

### Port State Change Event

```json
{
  "type": "port_state",
  "port_number": 3,
  "state": "isolated",
  "device_mac": "AA:BB:CC:DD:EE:FF",
  "reason": "dos_detected",
  "triggered_by": "edge_ml",
  "timestamp": "2025-01-15T10:30:00.500Z"
}
```

---

*This document is a living guide and will be updated as the project progresses. Items marked **TBD** require further requirements definition before implementation.*
