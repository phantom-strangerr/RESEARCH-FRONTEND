from netmiko import ConnectHandler
import os
import logging
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("switch_ssh")

SWITCH_CONFIG = {
    "device_type": "cisco_ios",
    "host": os.getenv("SWITCH_HOST", "192.168.10.1"),
    "username": os.getenv("SWITCH_USERNAME", "admin"),
    "password": os.getenv("SWITCH_PASSWORD", "admin"),
    "secret": os.getenv("SWITCH_SECRET", "admin"),
    "timeout": 30,
    "session_timeout": 60,
}

QUARANTINE_VLAN = int(os.getenv("QUARANTINE_VLAN", "999"))
QUARANTINE_VLAN_NAME = "QUARANTINE"


def port_number_to_interface(port_number: int) -> str:
    if port_number <= 24:
        return f"FastEthernet0/{port_number}"
    else:
        return f"GigabitEthernet0/{port_number - 24}"


def get_connection():
    try:
        connection = ConnectHandler(**SWITCH_CONFIG)
        connection.enable()
        return connection
    except Exception as e:
        log.error(f"Failed to connect to switch at {SWITCH_CONFIG['host']}: {e}")
        raise ConnectionError(f"Cannot connect to switch: {e}")


def ensure_quarantine_vlan(connection) -> bool:
    try:
        output = connection.send_command("show vlan brief")
        if str(QUARANTINE_VLAN) in output:
            return True
        commands = [
            f"vlan {QUARANTINE_VLAN}",
            f"name {QUARANTINE_VLAN_NAME}",
            "exit",
        ]
        connection.send_config_set(commands)
        log.info(f"Created VLAN {QUARANTINE_VLAN} ({QUARANTINE_VLAN_NAME})")
        return True
    except Exception as e:
        log.error(f"Failed to ensure quarantine VLAN: {e}")
        return False


def get_port_current_vlan(connection, interface: str) -> int:
    try:
        output = connection.send_command(f"show interfaces {interface} switchport")
        for line in output.split("\n"):
            if "Access Mode VLAN" in line:
                parts = line.split(":")
                if len(parts) >= 2:
                    vlan_str = parts[1].strip().split()[0]
                    return int(vlan_str)
        return 1
    except Exception as e:
        log.error(f"Failed to get VLAN for {interface}: {e}")
        return 1


def isolate_port_on_switch(port_number: int) -> dict:
    interface = port_number_to_interface(port_number)
    connection = None
    try:
        connection = get_connection()

        if not ensure_quarantine_vlan(connection):
            return {"success": False, "original_vlan": None, "message": "Failed to create quarantine VLAN"}

        original_vlan = get_port_current_vlan(connection, interface)

        if original_vlan == QUARANTINE_VLAN:
            return {"success": True, "original_vlan": original_vlan, "message": f"Port already in quarantine"}

        commands = [
            f"interface {interface}",
            f"switchport access vlan {QUARANTINE_VLAN}",
            "exit",
        ]
        connection.send_config_set(commands)

        new_vlan = get_port_current_vlan(connection, interface)
        if new_vlan == QUARANTINE_VLAN:
            log.info(f"Isolated port {port_number} ({interface}): VLAN {original_vlan} → {QUARANTINE_VLAN}")
            return {"success": True, "original_vlan": original_vlan, "message": f"Port {port_number} moved to quarantine VLAN {QUARANTINE_VLAN}"}
        else:
            return {"success": False, "original_vlan": original_vlan, "message": f"Verification failed. Expected VLAN {QUARANTINE_VLAN}, got {new_vlan}"}

    except ConnectionError as e:
        return {"success": False, "original_vlan": None, "message": str(e)}
    except Exception as e:
        log.error(f"Unexpected error isolating port {port_number}: {e}")
        return {"success": False, "original_vlan": None, "message": f"Unexpected error: {e}"}
    finally:
        if connection:
            try:
                connection.disconnect()
            except Exception:
                pass


def lift_isolation_on_switch(port_number: int, original_vlan: int) -> dict:
    interface = port_number_to_interface(port_number)
    connection = None
    try:
        connection = get_connection()

        commands = [
            f"interface {interface}",
            f"switchport access vlan {original_vlan}",
            "exit",
        ]
        connection.send_config_set(commands)

        new_vlan = get_port_current_vlan(connection, interface)
        if new_vlan == original_vlan:
            log.info(f"Restored port {port_number} ({interface}): VLAN {QUARANTINE_VLAN} → {original_vlan}")
            return {"success": True, "message": f"Port {port_number} restored to VLAN {original_vlan}"}
        else:
            return {"success": False, "message": f"Verification failed. Expected VLAN {original_vlan}, got {new_vlan}"}

    except ConnectionError as e:
        return {"success": False, "message": str(e)}
    except Exception as e:
        log.error(f"Unexpected error restoring port {port_number}: {e}")
        return {"success": False, "message": f"Unexpected error: {e}"}
    finally:
        if connection:
            try:
                connection.disconnect()
            except Exception:
                pass