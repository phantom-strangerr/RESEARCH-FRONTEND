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
from app.services.switch_ssh_service import isolate_port_on_switch, lift_isolation_on_switch

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
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        raise HTTPException(status_code=404, detail="Port not found")
    if db_port.status == "isolated":
        raise HTTPException(status_code=400, detail="Port is already isolated")

    # Step 1: SSH into switch — move port to quarantine VLAN
    try:
        ssh_result = isolate_port_on_switch(db_port.port_number)
        if not ssh_result["success"]:
            raise HTTPException(status_code=500, detail=f"Switch command failed: {ssh_result['message']}")
        original_vlan = ssh_result["original_vlan"]
        log.info(f"Switch isolation successful: {ssh_result['message']}")
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Cannot connect to switch: {str(e)}")

    # Step 2: Update database
    port = isolate_port(db, port_id, isolation, original_vlan=original_vlan)
    if not port:
        raise HTTPException(status_code=500, detail="Failed to update database")
    return port


@router.post("/{port_id}/lift-isolation", response_model=SwitchPortOut)
def lift(port_id: UUID, db: Session = Depends(get_db)):
    db_port = get_port_by_id(db, port_id)
    if not db_port:
        raise HTTPException(status_code=404, detail="Port not found")
    if db_port.status != "isolated":
        raise HTTPException(status_code=400, detail="Port is not currently isolated")

    original_vlan = db_port.original_vlan or db_port.vlan or 1

    # Step 1: SSH into switch — restore original VLAN
    try:
        ssh_result = lift_isolation_on_switch(db_port.port_number, original_vlan)
        if not ssh_result["success"]:
            raise HTTPException(status_code=500, detail=f"Switch command failed: {ssh_result['message']}")
        log.info(f"Switch restoration successful: {ssh_result['message']}")
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Cannot connect to switch: {str(e)}")

    # Step 2: Update database
    port = lift_isolation(db, port_id)
    if not port:
        raise HTTPException(status_code=500, detail="Failed to update database")
    return port


@router.post("/seed/sample")
def seed_sample_ports(db: Session = Depends(get_db)):
    created = seed_ports(db)
    return {"message": f"Seeded {len(created)} ports", "ports": created}