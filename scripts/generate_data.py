import json
import os
import random

import pandas as pd

df = pd.read_excel(r"c:\Users\arunr\OneDrive\Desktop\SUB_STATION List.xlsx")

ZONE_COORDS = {
    "Hisar": (29.15, 75.72),
    "Panchkula": (30.69, 76.85),
    "Gurgaon": (28.46, 77.03),
    "Faridabad": (28.41, 77.32),
    "Rohtak": (28.90, 76.58),
    "Karnal": (29.69, 76.99),
    "Ambala": (30.38, 76.78),
    "Sonipat": (28.99, 77.02),
    "Bhiwani": (28.79, 76.14),
    "Sirsa": (29.53, 75.03),
    "Jind": (29.32, 76.31),
    "Kaithal": (29.80, 76.40),
    "Kurukshetra": (29.97, 76.88),
    "Yamunanagar": (30.13, 77.28),
    "Rewari": (28.20, 76.62),
    "Palwal": (28.15, 77.33),
    "Narnaul": (28.04, 76.11),
    "Jhajjar": (28.61, 76.66),
    "Panipat": (29.39, 76.97),
}


def get_coords(zone: str, code: int) -> tuple[float, float]:
    base = ZONE_COORDS.get(zone, (28.9, 76.8))
    random.seed(code)
    return (
        round(base[0] + (random.random() - 0.5) * 0.3, 4),
        round(base[1] + (random.random() - 0.5) * 0.3, 4),
    )


substations = []
for _, row in df.iterrows():
    lat, lng = get_coords(str(row["Zone Name"]), int(row["Sub Station Code"]))
    substations.append(
        {
            "code": int(row["Sub Station Code"]),
            "name": str(row["Sub Station Name"]),
            "zone": str(row["Zone Name"]),
            "circle": str(row["Circle Name"]),
            "division": str(row["Division Name"]),
            "voltage": str(row["Voltage Level"]),
            "lat": lat,
            "lng": lng,
        }
    )

VOLTAGE_TARGETS = {"400kV": 12, "220kV": 48, "132kV": 84, "66kV": 40}
ISSUE_TYPES = ["Hotspot", "Vegetation", "Insulator", "Sag", "Tower"]
CONDUCTORS = ["ACSR Zebra", "ACSR Moose", "AAAC Panther", "ACSR Weasel", "ACSR Dog"]

lines = []
line_idx = 0

for voltage, count in VOLTAGE_TARGETS.items():
    pool = [s for s in substations if s["voltage"] == voltage]
    if len(pool) < 2:
        pool = substations[:]

    random.seed(100 + line_idx)
    for i in range(count):
        random.shuffle(pool)
        from_ss = pool[i % len(pool)]
        to_ss = pool[(i + 1) % len(pool)]
        if from_ss["code"] == to_ss["code"]:
            to_ss = pool[(i + 2) % len(pool)]

        random.seed(line_idx * 7 + 13)
        health = random.randint(45, 98)
        if health >= 85:
            status = "Optimal"
        elif health >= 60:
            status = "Warning"
        else:
            status = "Critical"

        length = round(random.uniform(8, 65), 1)
        towers = int(length * 3.2)
        capacity = {"400kV": 800, "220kV": 235, "132kV": 120, "66kV": 60}[voltage]
        load_pct = random.uniform(0.35, 0.92)
        load_mw = round(capacity * load_pct)

        issues = []
        if health < 85:
            n_issues = random.randint(1, 3)
            for _ in range(n_issues):
                t_num = random.randint(5, max(towers - 5, 6))
                itype = random.choice(ISSUE_TYPES)
                sev = "High" if health < 60 else "Medium"
                descs = {
                    "Hotspot": f"Temperature anomaly detected on C-Phase isolator clamp ({random.randint(55, 78)}°C)",
                    "Vegetation": f"Tree canopy clearance breach (< {round(random.uniform(1.5, 2.9), 1)}m)",
                    "Insulator": "Insulator flashover / crack detected on string assembly",
                    "Sag": "Conductor sag exceeds clearance limit at mid-span",
                    "Tower": "Tower structural rust / foundation settlement detected",
                }
                issues.append(
                    {
                        "tower_no": f"Tower #{t_num}",
                        "type": itype,
                        "severity": sev,
                        "description": descs[itype],
                    }
                )

        shutdown = random.random() < 0.08
        if shutdown:
            status = "Shutdown"

        from_name = from_ss["name"].replace(f"{voltage} ", "")
        to_name = to_ss["name"].replace(f"{voltage} ", "").replace(voltage, "")
        line_name = f"{voltage} {from_name} - {to_name} Line"
        if i % 3 == 0:
            line_name += f" (Feeder {i % 2 + 1})"

        line_idx += 1
        volt_code = voltage.replace("kV", "")
        lines.append(
            {
                "line_id": f"TL-{volt_code}-{str(line_idx).zfill(3)}",
                "line_name": line_name,
                "voltage": voltage,
                "from_substation": {
                    "code": from_ss["code"],
                    "name": from_ss["name"],
                    "lat": from_ss["lat"],
                    "lng": from_ss["lng"],
                },
                "to_substation": {
                    "code": to_ss["code"],
                    "name": to_ss["name"],
                    "lat": to_ss["lat"],
                    "lng": to_ss["lng"],
                },
                "length_km": length,
                "health_score": health,
                "status": status,
                "load_mw": load_mw,
                "capacity_mw": capacity,
                "tower_count": towers,
                "conductor_type": random.choice(CONDUCTORS),
                "issues": issues,
                "next_maintenance_date": "2026-07-28"
                if shutdown or random.random() < 0.15
                else None,
            }
        )

for line in lines:
    if "Harfali" in line["line_name"] and line["voltage"] == "220kV":
        line["line_id"] = "TL-220-042"
        line["line_name"] = "220kV Harfali - Palwal Line (Feeder 1)"
        line["health_score"] = 68
        line["status"] = "Warning"
        line["length_km"] = 34.2
        line["tower_count"] = 112
        line["load_mw"] = 182
        line["capacity_mw"] = 235
        line["conductor_type"] = "ACSR Zebra"
        line["issues"] = [
            {
                "tower_no": "Tower #42",
                "type": "Hotspot",
                "severity": "High",
                "description": "Temperature anomaly detected on C-Phase isolator clamp (72°C)",
            },
            {
                "tower_no": "Tower #78",
                "type": "Vegetation",
                "severity": "Medium",
                "description": "Tree canopy clearance breach (< 2.8m)",
            },
        ]
        line["next_maintenance_date"] = "2026-07-28"
        break

os.makedirs(r"C:\Users\arunr\SMS\src\lib\data", exist_ok=True)
with open(r"C:\Users\arunr\SMS\src\lib\data\transmissionLines.json", "w", encoding="utf-8") as f:
    json.dump(lines, f, indent=2)
with open(r"C:\Users\arunr\SMS\src\lib\data\substations.json", "w", encoding="utf-8") as f:
    json.dump(substations, f, indent=2)

optimal = sum(1 for line in lines if line["health_score"] >= 85)
warning = sum(1 for line in lines if 60 <= line["health_score"] < 85)
critical = sum(1 for line in lines if line["health_score"] < 60)
print(f"Generated {len(lines)} lines: optimal={optimal}, warning={warning}, critical={critical}")
print(f"Generated {len(substations)} substations")
