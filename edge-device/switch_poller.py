"""
Cisco C2960 Switch Poller — Edge Device Simulator
==================================================
This script polls a Cisco C2960 switch via SSH, collects port data,
and pushes it to the IoT SOC Dashboard backend API.

Run this on your Mac (or VM) to simulate the Raspberry Pi edge device.

Requirements:
    pip install netmiko requests

Usage:
    python switch_poller.py

Configuration:
    Edit the SWITCH_CONFIG and API_CONFIG sections below.
"""

import time
import re
import requests
import logging
from datetime import datetime, timezone
from netmiko import ConnectHandler

# ============================================================
# CONFIGURATION — Edit these to match your setup
# ============================================================

SWITCH_CONFIG = {
    "device_type": "cisco_ios",
    "host": "192.168.10.1",
    "username": "admin",
    "password": "admin",
    "secret": "admin",         # Enable password (same as password if not set separately)
    "timeout": 30,
    "session_timeout": 60,
}

API_CONFIG = {
    "base_url": "http://localhost:8000/api/v1",
    "timeout": 10,
}

POLL_INTERVAL = 10  # seconds between each poll cycle

# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("switch_poller")

# ============================================================
# SSH — Connect to switch and run commands
# ============================================================


def connect_to_switch():
    """Establish SSH connection to the Cisco switch."""
    try:
        log.info(f"Connecting to switch at {SWITCH_CONFIG['host']}...")
        connection = ConnectHandler(**SWITCH_CONFIG)
        connection.enable()  # Enter privileged EXEC mode
        log.info("Connected successfully.")
        return connection
    except Exception as e:
        log.error(f"Failed to connect to switch: {e}")
        return None


def run_command(connection, command):
    """Run a show command and return the output."""
    try:
        output = connection.send_command(command, read_timeout=15)
        return output
    except Exception as e:
        log.error(f"Failed to run '{command}': {e}")
        return ""


# ============================================================
# PARSERS — Extract structured data from CLI output
# ============================================================


def parse_interfaces_status(output):
    """
    Parse 'show interfaces status' output.

    Example output:
    Port      Name               Status       Vlan       Duplex  Speed Type
    Fa0/1     Workstation-01     connected    10         a-full  a-100 10/100BaseTX
    Fa0/2                        notconnect   20         auto    auto  10/100BaseTX
    Gi0/1     Uplink             connected    trunk      a-full  1000  10/100/1000BaseTX
    """
    ports = {}

    lines = output.strip().split("\n")
    for line in lines:
        # Match FastEthernet and GigabitEthernet port lines
        match = re.match(
            r"(Fa\d+/\d+|Gi\d+/\d+)\s+"   # Port name
            r"(.*?)\s+"                       # Description (device name)
            r"(connected|notconnect|disabled|err-disabled|monitoring)\s+"  # Status
            r"(\S+)\s+"                       # VLAN
            r"(\S+)\s+"                       # Duplex
            r"(\S+)\s+"                       # Speed
            r"(.*)",                           # Type
            line
        )

        if match:
            port_name = match.group(1).strip()
            device_name = match.group(2).strip() or None
            status_raw = match.group(3).strip()
            vlan_raw = match.group(4).strip()
            speed_raw = match.group(6).strip()

            # Convert port name to number: Fa0/1 → 1, Fa0/24 → 24, Gi0/1 → 25, Gi0/2 → 26
            port_number = extract_port_number(port_name)

            # Map Cisco status to our status
            status = map_port_status(status_raw)

            # Parse VLAN
            vlan = parse_vlan(vlan_raw)

            # Parse speed
            speed = parse_speed(speed_raw, port_name)

            ports[port_name] = {
                "port_number": port_number,
                "port_name": port_name,
                "device_name": device_name,
                "status": status,
                "vlan": vlan,
                "speed": speed,
            }

    return ports


def parse_interfaces_counters(output):
    """
    Parse 'show interfaces counters' output.

    Example output:
    Port            InOctets    InUcastPkts   InMcastPkts   InBcastPkts
    Fa0/1          125050000        85432          1234           567
    ...

    Port           OutOctets   OutUcastPkts  OutMcastPkts  OutBcastPkts
    Fa0/1           89020000        62100           890           234
    """
    counters = {}

    lines = output.strip().split("\n")
    current_direction = None  # "in" or "out"

    for line in lines:
        # Detect direction headers
        if "InOctets" in line:
            current_direction = "in"
            continue
        elif "OutOctets" in line:
            current_direction = "out"
            continue

        # Match port counter lines
        match = re.match(
            r"(Fa\d+/\d+|Gi\d+/\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)",
            line.strip()
        )

        if match and current_direction:
            port_name = match.group(1)
            octets = int(match.group(2))

            if port_name not in counters:
                counters[port_name] = {"in_octets": 0, "out_octets": 0}

            if current_direction == "in":
                counters[port_name]["in_octets"] = octets
            elif current_direction == "out":
                counters[port_name]["out_octets"] = octets

    return counters


def parse_interfaces_errors(output):
    """
    Parse 'show interfaces counters errors' output.

    Example output:
    Port        Align-Err    FCS-Err   Xmit-Err    Rcv-Err  UnderSize  OutDiscards
    Fa0/1              0          0          0          0          0            0
    """
    errors = {}

    lines = output.strip().split("\n")
    for line in lines:
        match = re.match(
            r"(Fa\d+/\d+|Gi\d+/\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)",
            line.strip()
        )

        if match:
            port_name = match.group(1)
            align_err = int(match.group(2))
            fcs_err = int(match.group(3))
            xmit_err = int(match.group(4))
            rcv_err = int(match.group(5))
            out_discards = int(match.group(7))

            total_errors = align_err + fcs_err + xmit_err + rcv_err
            total_drops = out_discards

            errors[port_name] = {
                "errors": total_errors,
                "drops": total_drops,
            }

    return errors


def parse_mac_address_table(output):
    """
    Parse 'show mac address-table' output.

    Example output:
    Mac Address Table
    -------------------------------------------
    Vlan    Mac Address       Type        Ports
    ----    -----------       --------    -----
      10    98:76:54:32:10:fe  DYNAMIC     Fa0/1
      20    12:34:56:78:9a:bc  DYNAMIC     Fa0/2
    """
    mac_table = {}  # port_name → MAC address

    lines = output.strip().split("\n")
    for line in lines:
        # Match MAC address lines (handles both colon and dot formats)
        match = re.match(
            r"\s*(\d+)\s+"                          # VLAN
            r"([0-9a-fA-F.:]{11,17})\s+"            # MAC address
            r"(DYNAMIC|STATIC)\s+"                   # Type
            r"(Fa\d+/\d+|Gi\d+/\d+)",              # Port
            line.strip()
        )

        if match:
            mac = normalize_mac(match.group(2))
            port_name = match.group(4)
            mac_table[port_name] = mac

    return mac_table


def parse_arp_table(output):
    """
    Parse 'show ip arp' output.

    Example output:
    Protocol  Address          Age (min)  Hardware Addr   Type   Interface
    Internet  192.168.10.101         5   9876.5432.10fe  ARPA   Vlan10
    Internet  192.168.10.103         2   1234.5678.9abc  ARPA   Vlan20
    """
    arp_table = {}  # MAC → IP

    lines = output.strip().split("\n")
    for line in lines:
        match = re.match(
            r"Internet\s+"
            r"(\d+\.\d+\.\d+\.\d+)\s+"       # IP address
            r"(\d+|-)\s+"                      # Age
            r"([0-9a-fA-F.:]{11,17})\s+"      # MAC address
            r"ARPA",
            line.strip()
        )

        if match:
            ip = match.group(1)
            mac = normalize_mac(match.group(3))
            arp_table[mac] = ip

    return arp_table


# ============================================================
# HELPERS
# ============================================================


def extract_port_number(port_name):
    """
    Convert Cisco port name to sequential number.
    Fa0/1 → 1, Fa0/24 → 24, Gi0/1 → 25, Gi0/2 → 26
    """
    match = re.match(r"(Fa|Gi)(\d+)/(\d+)", port_name)
    if match:
        prefix = match.group(1)
        number = int(match.group(3))
        if prefix == "Gi":
            return 24 + number  # GigabitEthernet starts after FastEthernet
        return number
    return 0


def map_port_status(cisco_status):
    """Map Cisco interface status to our status values."""
    mapping = {
        "connected": "active",
        "notconnect": "disabled",
        "disabled": "disabled",
        "err-disabled": "isolated",  # err-disabled usually means the switch isolated it
        "monitoring": "warning",
    }
    return mapping.get(cisco_status, "disabled")


def parse_vlan(vlan_raw):
    """Parse VLAN from show interfaces status output."""
    if vlan_raw == "trunk":
        return 0  # Trunk port
    try:
        return int(vlan_raw)
    except ValueError:
        return 1  # Default VLAN


def parse_speed(speed_raw, port_name):
    """Parse speed into human-readable format."""
    speed_raw = speed_raw.lower().replace("a-", "")  # Remove auto-negotiated prefix

    if "1000" in speed_raw or speed_raw == "1000":
        return "1G"
    elif "100" in speed_raw or speed_raw == "100":
        return "100M"
    elif "10000" in speed_raw or speed_raw == "10000":
        return "10G"
    elif "10" in speed_raw:
        return "10M"
    elif "auto" in speed_raw:
        # Default based on port type
        if port_name.startswith("Gi"):
            return "1G"
        return "100M"
    return "100M"


def normalize_mac(mac_string):
    """
    Normalize MAC address to colon-separated format.
    Cisco uses: 9876.5432.10fe → 98:76:54:32:10:FE
    Also handles: 98:76:54:32:10:FE (already correct)
    """
    # Remove all separators
    clean = mac_string.replace(".", "").replace(":", "").replace("-", "").upper()

    if len(clean) != 12:
        return mac_string.upper()

    # Insert colons every 2 characters
    return ":".join(clean[i:i + 2] for i in range(0, 12, 2))


def octets_to_mb(octets):
    """Convert byte count to MB (rounded to 1 decimal)."""
    return round(octets / (1024 * 1024), 1)


# ============================================================
# API — Push data to the FastAPI backend
# ============================================================


def get_existing_ports():
    """Fetch currently registered ports from the API."""
    try:
        response = requests.get(
            f"{API_CONFIG['base_url']}/ports",
            timeout=API_CONFIG["timeout"],
        )
        if response.status_code == 200:
            return {p["port_number"]: p for p in response.json()}
        return {}
    except Exception as e:
        log.error(f"Failed to fetch existing ports: {e}")
        return {}


def create_port_api(port_data):
    """Register a new port via POST /api/v1/ports."""
    try:
        response = requests.post(
            f"{API_CONFIG['base_url']}/ports",
            json=port_data,
            timeout=API_CONFIG["timeout"],
        )
        if response.status_code == 200:
            log.info(f"  Created port {port_data['port_number']}")
            return True
        else:
            log.warning(f"  Failed to create port {port_data['port_number']}: {response.status_code} {response.text}")
            return False
    except Exception as e:
        log.error(f"  Failed to create port {port_data['port_number']}: {e}")
        return False


def update_port_api(port_number, update_data):
    """Update an existing port via PUT /api/v1/ports/{port_number}."""
    try:
        response = requests.put(
            f"{API_CONFIG['base_url']}/ports/{port_number}",
            json=update_data,
            timeout=API_CONFIG["timeout"],
        )
        if response.status_code == 200:
            return True
        else:
            log.warning(f"  Failed to update port {port_number}: {response.status_code}")
            return False
    except Exception as e:
        log.error(f"  Failed to update port {port_number}: {e}")
        return False


# ============================================================
# MAIN POLL CYCLE
# ============================================================


def poll_switch(connection):
    """
    Run all show commands, parse output, and push data to API.
    Returns the number of ports successfully updated.
    """

    # 1. Run all show commands
    log.info("Polling switch data...")

    status_output = run_command(connection, "show interfaces status")
    counters_output = run_command(connection, "show interfaces counters")
    errors_output = run_command(connection, "show interfaces counters errors")
    mac_output = run_command(connection, "show mac address-table dynamic")
    arp_output = run_command(connection, "show ip arp")

    # 2. Parse all outputs
    ports = parse_interfaces_status(status_output)
    counters = parse_interfaces_counters(counters_output)
    errors = parse_interfaces_errors(errors_output)
    mac_table = parse_mac_address_table(mac_output)
    arp_table = parse_arp_table(arp_output)

    if not ports:
        log.warning("No ports found in 'show interfaces status' output.")
        return 0

    log.info(f"Parsed {len(ports)} ports, {len(mac_table)} MAC entries, {len(arp_table)} ARP entries")

    # 3. Merge all data per port
    merged_ports = {}

    for port_name, port_info in ports.items():
        port_number = port_info["port_number"]
        if port_number == 0:
            continue

        # Get MAC for this port
        mac = mac_table.get(port_name)

        # Get IP from ARP table using MAC
        ip = arp_table.get(mac) if mac else None

        # Get counters
        port_counters = counters.get(port_name, {"in_octets": 0, "out_octets": 0})

        # Get errors
        port_errors = errors.get(port_name, {"errors": 0, "drops": 0})

        merged_ports[port_number] = {
            "port_number": port_number,
            "status": port_info["status"],
            "device_ip": ip or "",
            "device_mac": mac or "",
            "device_name": port_info["device_name"],
            "vlan": port_info["vlan"],
            "speed": port_info["speed"],
            "bytes_sent": octets_to_mb(port_counters["out_octets"]),
            "bytes_received": octets_to_mb(port_counters["in_octets"]),
            "errors": port_errors["errors"],
            "drops": port_errors["drops"],
            "last_activity": datetime.now(timezone.utc).isoformat(),
        }

    # 4. Push to API
    existing_ports = get_existing_ports()
    created = 0
    updated = 0

    for port_number, port_data in merged_ports.items():
        if port_number in existing_ports:
            existing = existing_ports[port_number]
            if existing.get("status") == "isolated":
                # Port is isolated in our DB — only update counters, NEVER overwrite status
                update = {
                    "bytes_sent": port_data["bytes_sent"],
                    "bytes_received": port_data["bytes_received"],
                    "errors": port_data["errors"],
                    "drops": port_data["drops"],
                    "last_activity": port_data["last_activity"],
                }
            else:
                update = {
                    "status": port_data["status"],
                    "device_ip": port_data["device_ip"],
                    "device_mac": port_data["device_mac"],
                    "device_name": port_data["device_name"],
                    "vlan": port_data["vlan"],
                    "speed": port_data["speed"],
                    "bytes_sent": port_data["bytes_sent"],
                    "bytes_received": port_data["bytes_received"],
                    "errors": port_data["errors"],
                    "drops": port_data["drops"],
                    "last_activity": port_data["last_activity"],
                }

            if update_port_api(port_number, update):
                updated += 1
        else:
            # Port doesn't exist → create it
            if create_port_api(port_data):
                created += 1

    log.info(f"Poll complete: {created} created, {updated} updated")
    return created + updated


# ============================================================
# ENTRY POINT
# ============================================================


def main():
    """Main loop — connect to switch and poll continuously."""

    log.info("=" * 50)
    log.info("IoT SOC — Switch Poller Starting")
    log.info(f"Switch: {SWITCH_CONFIG['host']}")
    log.info(f"API:    {API_CONFIG['base_url']}")
    log.info(f"Poll interval: {POLL_INTERVAL}s")
    log.info("=" * 50)

    connection = None
    consecutive_failures = 0
    max_failures = 5

    while True:
        try:
            # Connect if not connected
            if connection is None or not connection.is_alive():
                if connection:
                    try:
                        connection.disconnect()
                    except Exception:
                        pass
                connection = connect_to_switch()
                if not connection:
                    consecutive_failures += 1
                    if consecutive_failures >= max_failures:
                        log.error(f"Failed {max_failures} times in a row. Waiting 60s before retry...")
                        time.sleep(60)
                        consecutive_failures = 0
                    else:
                        time.sleep(POLL_INTERVAL)
                    continue

            # Poll the switch
            result = poll_switch(connection)
            if result > 0:
                consecutive_failures = 0
            else:
                consecutive_failures += 1

        except KeyboardInterrupt:
            log.info("\nShutting down...")
            if connection:
                connection.disconnect()
            break
        except Exception as e:
            log.error(f"Unexpected error: {e}")
            consecutive_failures += 1
            connection = None  # Force reconnect

        # Wait before next poll
        time.sleep(POLL_INTERVAL)

    log.info("Switch poller stopped.")


if __name__ == "__main__":
    main()