from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
import logging
from app.database import get_db
from app.schemas.switch_port import (
    SwitchPortCreate, SwitchPortUpdate, SwitchPortOut, SwitchPortIsolate,
)
from app.services.switch_port_service import (
    get_all_ports, get_port_by_id, create_port, update_port,
    isolate_port, lift_isolation, seed_ports, get_port_by_number,
)

log = logging.getLogger("ports_api")

router = APIRouter()


@router.get("", response_model=list[SwitchPortOut])
def list_ports(db: Session = Depends(get_db)):
    return get_all_ports(db)


@router.get("/{port_id}", response_model=SwitchPortOut)
def get_port(port_id: UUID, db: Session = Depends(get_db)):
    port = get_port_by_id(db, port_id)
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.post("", response_model=SwitchPortOut)
def create_new_port(port: SwitchPortCreate, db: Session = Depends(get_db)):
    existing = get_port_by_number(db, port.port_number)
    if existing:
        raise HTTPException(status_code=400, detail=f"Port {port.port_number} already exists")
    return create_port(db, port)


@router.put("/{port_number}", response_model=SwitchPortOut)
def update_existing_port(port_number: int, update: SwitchPortUpdate, db: Session = Depends(get_db)):
    port = update_port(db, port_number, update)
    if not port:
        raise HTTPException(status_code=404, detail=f"Port {port_number} not found")
    return port


@router.post("/{port_id}/isolate", response_model=SwitchPortOut)
def isolate(port_id: UUID, isolation: SwitchPortIsolate, db: Session = Depends(get_db)):
    """
    Mark a port as isolated in the database.
    The Pi poller will detect this change and execute the VLAN change on the switch.
    """
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        raise HTTPException(status_code=404, detail="Port not found")
    if db_port.status == "isolated":
        raise HTTPException(status_code=400, detail="Port is already isolated")

    # Save current VLAN as original before isolation
    original_vlan = db_port.vlan or 1

    port = isolate_port(db, port_id, isolation, original_vlan=original_vlan)
    if not port:
        raise HTTPException(status_code=500, detail="Failed to update database")

    log.info(f"Port {db_port.port_number} marked for isolation. Pi will execute VLAN change.")
    return port


@router.post("/{port_id}/lift-isolation", response_model=SwitchPortOut)
def lift(port_id: UUID, db: Session = Depends(get_db)):
    """
    Mark a port for lifting isolation in the database.
    The Pi poller will detect this change and restore the original VLAN on the switch.
    """
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        raise HTTPException(status_code=404, detail="Port not found")
    if db_port.status != "isolated":
        raise HTTPException(status_code=400, detail="Port is not currently isolated")

    port = lift_isolation(db, port_id)
    if not port:
        raise HTTPException(status_code=500, detail="Failed to update database")

    log.info(f"Port {db_port.port_number} marked for lift. Pi will restore original VLAN.")
    return port


@router.post("/seed/sample")
def seed_sample_ports(db: Session = Depends(get_db)):
    created = seed_ports(db)
    return {"message": f"Seeded {len(created)} ports", "ports": created}
