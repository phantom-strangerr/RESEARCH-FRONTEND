"""
IoT SOC Dashboard — Sample Data Seeder
=======================================
Seeds realistic sample data into:
  - detection_events (attacks detected by ML model)
  - traffic_features (network packet metadata)
  - event_context (MAC address info)

Run this AFTER the backend is running:
    python seed_data.py

Or place it in backend/ and run:
    cd backend
    python seed_data.py
"""

import requests
import uuid
import random
from datetime import datetime, timedelta, timezone

# ============================================================
# CONFIGURATION
# ============================================================

API_BASE_URL = "http://217.217.248.193/api/v1"

# ============================================================
# SAMPLE DATA POOLS
# ============================================================

ATTACK_TYPES = ["DOS", "Mirai", "Replay", "Spoofing"]
SEVERITIES = ["critical", "high", "medium", "low"]
MODEL_NAMES = ["XGBoost-Edge-v2", "CNN-Cloud-v1", "RandomForest-Edge-v1", "DL-Hybrid-v3"]
MITIGATIONS = ["port_disabled", "mac_blocked", "rate_limited", "quarantined", "none"]
PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "ARP"]
CLASSIFICATIONS = ["DOS", "Mirai", "Replay", "Spoofing", "Normal"]

# Realistic IoT device IPs
SOURCE_IPS = [
    "192.168.1.101", "192.168.1.102", "192.168.1.103", "192.168.1.104",
    "192.168.1.105", "192.168.1.107", "192.168.1.108", "192.168.1.110",
    "192.168.1.112", "192.168.1.115", "192.168.1.120", "192.168.1.125",
    "192.168.1.130", "192.168.1.135", "192.168.1.140", "192.168.1.145",
]

DEST_IPS = [
    "192.168.1.1", "192.168.1.5", "192.168.1.10", "192.168.1.50",
    "192.168.1.200", "10.0.0.1", "10.0.0.5",
]

# Realistic MAC addresses
SOURCE_MACS = [
    "AA:BB:CC:DD:EE:FF", "98:76:54:32:10:FE", "12:34:56:78:9A:BC",
    "DE:AD:BE:EF:CA:FE", "FF:EE:DD:CC:BB:AA", "AB:CD:EF:12:34:56",
    "C0:FF:EE:BA:BE:CA", "FA:CE:B0:0C:12:34", "BA:DC:0F:FE:EB:AD",
    "11:22:33:44:55:66", "AA:11:BB:22:CC:33", "99:88:77:66:55:44",
]

DEST_MACS = [
    "00:1A:2B:3C:4D:5E", "FF:FF:FF:FF:FF:FF", "01:00:5E:00:00:01",
    "00:0C:29:AA:BB:CC", "00:50:56:DD:EE:FF",
]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def random_timestamp(hours_back=24):
    """Generate a random timestamp within the last N hours."""
    now = datetime.now(timezone.utc)
    delta = timedelta(seconds=random.randint(0, hours_back * 3600))
    return (now - delta).isoformat()


def weighted_choice(choices, weights):
    """Pick a random item with weighted probability."""
    return random.choices(choices, weights=weights, k=1)[0]


# ============================================================
# SEED FUNCTIONS
# ============================================================

def seed_detection_events(count=20):
    """Seed detection events (attacks detected by ML model)."""
    print(f"\n--- Seeding {count} detection events ---")
    created_events = []

    for i in range(count):
        # Weight towards more realistic distribution
        attack_type = weighted_choice(
            ATTACK_TYPES,
            weights=[35, 25, 20, 20]  # DOS most common
        )

        # Severity correlates with attack type
        if attack_type == "DOS":
            severity = weighted_choice(SEVERITIES, weights=[40, 35, 20, 5])
        elif attack_type == "Mirai":
            severity = weighted_choice(SEVERITIES, weights=[25, 40, 25, 10])
        elif attack_type == "Spoofing":
            severity = weighted_choice(SEVERITIES, weights=[20, 35, 30, 15])
        else:
            severity = weighted_choice(SEVERITIES, weights=[15, 30, 35, 20])

        # Mitigation correlates with severity
        if severity == "critical":
            mitigation = weighted_choice(MITIGATIONS[:2], weights=[60, 40])
        elif severity == "high":
            mitigation = weighted_choice(MITIGATIONS[:3], weights=[30, 40, 30])
        else:
            mitigation = weighted_choice(MITIGATIONS, weights=[10, 15, 25, 25, 25])

        event_data = {
            "attack_type": attack_type,
            "severity": severity,
            "model_name": random.choice(MODEL_NAMES),
            "processing_latency_ms": round(random.uniform(5.0, 250.0), 2),
            "mitigation": mitigation,
            "timestamp": random_timestamp(hours_back=48),
        }

        try:
            response = requests.post(
                f"{API_BASE_URL}/detection-events",
                json=event_data,
                timeout=10,
            )

            if response.status_code == 200:
                # Fetch the latest event to get its event_id
                events_response = requests.get(f"{API_BASE_URL}/detection-events", timeout=10)
                if events_response.status_code == 200:
                    events = events_response.json()
                    if events:
                        # Get the most recently created event
                        latest = sorted(events, key=lambda e: e["timestamp"], reverse=True)[0]
                        created_events.append({
                            "event_id": latest["event_id"],
                            "attack_type": attack_type,
                            "src_ip": random.choice(SOURCE_IPS),
                        })
                print(f"  [{i+1}/{count}] Created: {attack_type} attack ({severity}) — {mitigation}")
            else:
                print(f"  [{i+1}/{count}] Failed: {response.status_code} — {response.text}")

        except Exception as e:
            print(f"  [{i+1}/{count}] Error: {e}")

    print(f"Created {len(created_events)} detection events.")
    return created_events


def seed_traffic_features(events, extra_normal=15):
    """
    Seed traffic features linked to detection events.
    Also creates extra 'Normal' traffic entries.
    """
    total = len(events) + extra_normal
    print(f"\n--- Seeding {total} traffic features ({len(events)} attack + {extra_normal} normal) ---")
    created = 0

    # Traffic features for each detection event
    for i, event in enumerate(events):
        src_ip = event["src_ip"]

        is_attack = event["attack_type"] != "Normal"
        feature_data = {
            "event_id": event["event_id"],
            "src_ip": src_ip,
            "dst_ip": random.choice(DEST_IPS),
            "protocol": random.choice(PROTOCOLS),
            "byte_count": random.randint(64, 1500000),
            "packet_size": random.randint(64, 1500),
            "ttl": random.choice([32, 64, 128, 255]),
            "classification": event["attack_type"],
            "timestamp": random_timestamp(hours_back=48),
            "ml": random.random() < 0.85 if is_attack else random.random() < 0.1,
            "dl": random.random() < 0.80 if is_attack else random.random() < 0.05,
        }

        try:
            response = requests.post(
                f"{API_BASE_URL}/traffic-features",
                json=feature_data,
                timeout=10,
            )

            if response.status_code == 200:
                created += 1
                print(f"  [{i+1}/{total}] Attack traffic: {src_ip} → {feature_data['dst_ip']} ({event['attack_type']})")
            else:
                print(f"  [{i+1}/{total}] Failed: {response.status_code} — {response.text}")

        except Exception as e:
            print(f"  [{i+1}/{total}] Error: {e}")

    # Extra normal traffic (not linked to any attack event — need a dummy event)
    # First create a "Normal" detection event to link to
    normal_event_data = {
        "attack_type": "Normal",
        "severity": "low",
        "model_name": "XGBoost-Edge-v2",
        "processing_latency_ms": round(random.uniform(1.0, 10.0), 2),
        "mitigation": "none",
    }

    for j in range(extra_normal):
        idx = len(events) + j + 1

        # Create a detection event for normal traffic
        try:
            resp = requests.post(f"{API_BASE_URL}/detection-events", json=normal_event_data, timeout=10)
            if resp.status_code != 200:
                print(f"  [{idx}/{total}] Failed to create normal event")
                continue

            # Get the event_id
            events_resp = requests.get(f"{API_BASE_URL}/detection-events", timeout=10)
            all_events = events_resp.json()
            normal_events = [e for e in all_events if e["attack_type"] == "Normal"]
            if not normal_events:
                continue
            event_id = sorted(normal_events, key=lambda e: e["timestamp"], reverse=True)[0]["event_id"]

            feature_data = {
                "event_id": event_id,
                "src_ip": random.choice(SOURCE_IPS),
                "dst_ip": random.choice(DEST_IPS),
                "protocol": random.choice(["TCP", "UDP", "HTTP", "HTTPS", "DNS"]),
                "byte_count": random.randint(64, 50000),
                "packet_size": random.randint(64, 1500),
                "ttl": random.choice([64, 128]),
                "classification": "Normal",
                "timestamp": random_timestamp(hours_back=24),
                "ml": random.random() < 0.05,
                "dl": random.random() < 0.03,
            }

            response = requests.post(
                f"{API_BASE_URL}/traffic-features",
                json=feature_data,
                timeout=10,
            )

            if response.status_code == 200:
                created += 1
                print(f"  [{idx}/{total}] Normal traffic: {feature_data['src_ip']} → {feature_data['dst_ip']}")
            else:
                print(f"  [{idx}/{total}] Failed: {response.status_code}")

        except Exception as e:
            print(f"  [{idx}/{total}] Error: {e}")

    print(f"Created {created} traffic features.")
    return created


def seed_event_context(events):
    """Seed MAC address context for detection events."""
    print(f"\n--- Seeding {len(events)} event contexts ---")
    created = 0

    for i, event in enumerate(events):
        context_data = {
            "event_id": event["event_id"],
            "src_mac": random.choice(SOURCE_MACS),
            "dst_mac": random.choice(DEST_MACS),
        }

        try:
            response = requests.post(
                f"{API_BASE_URL}/event-context",
                json=context_data,
                timeout=10,
            )

            if response.status_code == 200:
                created += 1
                print(f"  [{i+1}/{len(events)}] Context: {context_data['src_mac']} → {context_data['dst_mac']}")
            else:
                print(f"  [{i+1}/{len(events)}] Failed: {response.status_code} — {response.text}")

        except Exception as e:
            print(f"  [{i+1}/{len(events)}] Error: {e}")

    print(f"Created {created} event contexts.")
    return created


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 55)
    print("  IoT SOC Dashboard — Sample Data Seeder")
    print("=" * 55)
    print(f"API: {API_BASE_URL}")

    # Check if backend is running
    try:
        health = requests.get(f"http://localhost:8000/health", timeout=5)
        if health.status_code != 200:
            print("\nERROR: Backend is not responding. Start it first:")
            print("  cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
            return
        print("Backend is running.\n")
    except Exception:
        print("\nERROR: Cannot connect to backend at localhost:8000")
        print("Start it first:")
        print("  cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return

    # Step 1: Seed detection events (attacks)
    events = seed_detection_events(count=20)

    if not events:
        print("\nNo events created. Check backend logs for errors.")
        return

    # Step 2: Seed traffic features (linked to events + extra normal traffic)
    seed_traffic_features(events, extra_normal=15)

    # Step 3: Seed event contexts (MAC addresses for events)
    seed_event_context(events)

    # Summary
    print("\n" + "=" * 55)
    print("  Seeding Complete!")
    print("=" * 55)
    print(f"\nYour dashboard should now show:")
    print(f"  - Recent Events: Latest attack detections with source IPs")
    print(f"  - Packet Monitor: Recent traffic with classifications")
    print(f"  - Alerts Page: Full alert details with severity filters")
    print(f"\nOpen http://localhost:5173 to see the data!")


if __name__ == "__main__":
    main()
