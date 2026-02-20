from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.switch_port import (
    SwitchPortCreate, SwitchPortUpdate, SwitchPortOut, SwitchPortIsolate,
)
from app.services.switch_port_service import (
    get_all_ports, get_port_by_id, create_port, update_port,
    isolate_port, lift_isolation, seed_ports, get_port_by_number,
)

router = APIRouter()


@router.get("", response_model=list[SwitchPortOut])
def list_ports(db: Session = Depends(get_db)):
    """Get all switch ports. Used by frontend PortsPage."""
    return get_all_ports(db)


@router.get("/{port_id}", response_model=SwitchPortOut)
def get_port(port_id: UUID, db: Session = Depends(get_db)):
    """Get a single port by ID."""
    port = get_port_by_id(db, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.post("", response_model=SwitchPortOut)
def create_new_port(port: SwitchPortCreate, db: Session = Depends(get_db)):
    """Create a new port record. Used by Raspberry Pi."""
    existing = get_port_by_number(db, port.port_number)
    if existing:
        raise HTTPException(status_code=400, detail=f"Port {port.port_number} already exists")
    return create_port(db, port)


@router.put("/{port_number}", response_model=SwitchPortOut)
def update_existing_port(port_number: int, update: SwitchPortUpdate, db: Session = Depends(get_db)):
    """Update port data. Used by Raspberry Pi to push real-time stats."""
    port = update_port(db, port_number, update)
    if not port:
        raise HTTPException(status_code=404, detail=f"Port {port_number} not found")
    return port


@router.post("/{port_id}/isolate", response_model=SwitchPortOut)
def isolate(port_id: UUID, isolation: SwitchPortIsolate, db: Session = Depends(get_db)):
    """Isolate a port. Used by frontend or edge device."""
    port = isolate_port(db, port_id, isolation)
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.post("/{port_id}/lift-isolation", response_model=SwitchPortOut)
def lift(port_id: UUID, db: Session = Depends(get_db)):
    """Lift isolation from a port. Requires authorization."""
    port = lift_isolation(db, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.post("/seed/sample")
def seed_sample_ports(db: Session = Depends(get_db)):
    """Seed sample port data for testing."""
    created = seed_ports(db)
    return {"message": f"Seeded {len(created)} ports", "ports": created}