from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from app.models.switch_port import SwitchPort
from app.schemas.switch_port import SwitchPortCreate, SwitchPortUpdate, SwitchPortIsolate


def get_all_ports(db: Session):
    """Get all switch ports ordered by port number."""
    return db.query(SwitchPort).order_by(SwitchPort.port_number).all()


def get_port_by_id(db: Session, port_id: UUID):
    """Get a single port by its UUID."""
    return db.query(SwitchPort).filter(SwitchPort.port_id == port_id).first()


def get_port_by_number(db: Session, port_number: int):
    """Get a single port by its port number."""
    return db.query(SwitchPort).filter(SwitchPort.port_number == port_number).first()


def create_port(db: Session, port: SwitchPortCreate):
    """Create a new port record. Used by Raspberry Pi."""
    payload = port.model_dump(exclude_unset=True)
    db_port = SwitchPort(**payload)
    db.add(db_port)
    db.commit()
    db.refresh(db_port)
    return db_port


def update_port(db: Session, port_number: int, update: SwitchPortUpdate):
    """Update port data. Used by Raspberry Pi to push real-time stats."""
    db_port = get_port_by_number(db, port_number)
    if not db_port:
        return None

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_port, key, value)

    db_port.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_port)
    return db_port


def isolate_port(db: Session, port_id: UUID, isolation: SwitchPortIsolate):
    """Isolate a port. Used by frontend or edge device."""
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        return None

    db_port.status = "isolated"
    db_port.isolation_reason = isolation.reason
    db_port.isolated_at = datetime.now(timezone.utc)
    db_port.isolated_by = isolation.isolated_by
    db_port.alert_event_id = isolation.alert_event_id

    db.commit()
    db.refresh(db_port)
    return db_port


def lift_isolation(db: Session, port_id: UUID):
    """Lift isolation from a port. Requires authorization on frontend."""
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        return None

    db_port.status = "active"
    db_port.isolation_reason = None
    db_port.isolated_at = None
    db_port.isolated_by = None
    db_port.alert_event_id = None

    db.commit()
    db.refresh(db_port)
    return db_port


def seed_ports(db: Session):
    """Seed sample port data for development/testing."""
    sample_ports = [
        {"port_number": 1, "status": "active", "device_ip": "192.168.1.101", "device_mac": "98:76:54:32:10:FE", "device_name": "Workstation-01", "vlan": 10, "speed": "1G", "bytes_sent": 1250.5, "bytes_received": 890.2, "errors": 0, "drops": 0},
        {"port_number": 2, "status": "active", "device_ip": "192.168.1.103", "device_mac": "12:34:56:78:9A:BC", "device_name": "Server-DB", "vlan": 20, "speed": "10G", "bytes_sent": 5680.3, "bytes_received": 4321.7, "errors": 2, "drops": 0},
        {"port_number": 3, "status": "isolated", "device_ip": "192.168.1.105", "device_mac": "AA:BB:CC:DD:EE:FF", "device_name": "Unknown-Device", "vlan": 10, "speed": "1G", "bytes_sent": 22850.1, "bytes_received": 245.3, "errors": 125, "drops": 89, "isolation_reason": "DOS Attack Detected - High packet rate (15,234 pkts/sec)", "isolated_by": "edge_ml"},
        {"port_number": 4, "status": "isolated", "device_ip": "192.168.1.107", "device_mac": "DE:AD:BE:EF:CA:FE", "device_name": "IoT-Sensor-04", "vlan": 30, "speed": "100M", "bytes_sent": 3.2, "bytes_received": 2.1, "errors": 45, "drops": 23, "isolation_reason": "Replay Attack Detected - Duplicate packet signatures", "isolated_by": "edge_ml"},
        {"port_number": 5, "status": "isolated", "device_ip": "192.168.1.108", "device_mac": "FF:EE:DD:CC:BB:AA", "device_name": "Camera-05", "vlan": 30, "speed": "100M", "bytes_sent": 10.3, "bytes_received": 8.5, "errors": 67, "drops": 34, "isolation_reason": "Botnet Activity - C&C communication pattern detected", "isolated_by": "edge_ml"},
        {"port_number": 6, "status": "active", "device_ip": "192.168.1.104", "device_mac": "BA:DC:0F:FE:EB:AD", "device_name": "Printer-Lab", "vlan": 10, "speed": "100M", "bytes_sent": 45.2, "bytes_received": 12.8, "errors": 0, "drops": 0},
        {"port_number": 7, "status": "active", "device_ip": "192.168.1.102", "device_mac": "11:22:33:44:55:66", "device_name": "Laptop-Admin", "vlan": 10, "speed": "1G", "bytes_sent": 678.9, "bytes_received": 432.1, "errors": 0, "drops": 0},
        {"port_number": 8, "status": "isolated", "device_ip": "192.168.1.110", "device_mac": "AB:CD:EF:12:34:56", "device_name": "Unknown-Device", "vlan": 10, "speed": "1G", "bytes_sent": 5.1, "bytes_received": 4.3, "errors": 89, "drops": 45, "isolation_reason": "Spoofing Attack - ARP spoofing detected", "isolated_by": "cloud"},
        {"port_number": 9, "status": "active", "device_ip": "192.168.1.112", "device_mac": "C0:FF:EE:BA:BE:CA", "device_name": "IoT-Sensor-09", "vlan": 30, "speed": "100M", "bytes_sent": 1.2, "bytes_received": 0.8, "errors": 0, "drops": 0},
        {"port_number": 10, "status": "active", "device_ip": "192.168.1.115", "device_mac": "FA:CE:B0:0C:12:34", "device_name": "Access-Point-01", "vlan": 10, "speed": "1G", "bytes_sent": 2340.5, "bytes_received": 1890.7, "errors": 1, "drops": 0},
        {"port_number": 11, "status": "warning", "device_ip": "192.168.1.120", "device_mac": "AA:11:BB:22:CC:33", "device_name": "IoT-Gateway", "vlan": 30, "speed": "1G", "bytes_sent": 890.3, "bytes_received": 567.2, "errors": 15, "drops": 8},
        {"port_number": 12, "status": "disabled", "device_ip": "", "device_mac": "", "device_name": None, "vlan": 1, "speed": "1G", "bytes_sent": 0, "bytes_received": 0, "errors": 0, "drops": 0},
    ]

    created = []
    for p in sample_ports:
        existing = get_port_by_number(db, p["port_number"])
        if existing:
            continue

        isolated_at = None
        if p["status"] == "isolated":
            isolated_at = datetime.now(timezone.utc)

        db_port = SwitchPort(
            port_number=p["port_number"],
            status=p["status"],
            device_ip=p.get("device_ip"),
            device_mac=p.get("device_mac"),
            device_name=p.get("device_name"),
            vlan=p.get("vlan"),
            speed=p.get("speed"),
            bytes_sent=p.get("bytes_sent", 0),
            bytes_received=p.get("bytes_received", 0),
            errors=p.get("errors", 0),
            drops=p.get("drops", 0),
            isolation_reason=p.get("isolation_reason"),
            isolated_at=isolated_at,
            isolated_by=p.get("isolated_by"),
        )
        db.add(db_port)
        created.append(p["port_number"])

    db.commit()
    return created