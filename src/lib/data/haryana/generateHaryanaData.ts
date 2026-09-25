/**
 * Generates realistic Haryana transmission network GIS data.
 * Used by frontend and backend for consistent sample dataset.
 */
import type {
  Circle,
  Division,
  Substation,
  Tower,
  TransmissionLine,
  VoltageLevel,
  Zone,
} from "@/lib/types/digitalTwin";

const ZONE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6"];
const CIRCLE_COLORS = ["#a78bfa", "#f472b6", "#34d399", "#60a5fa", "#fbbf24", "#fb7185"];
const DIVISION_COLORS = ["#c4b5fd", "#fda4af", "#6ee7b7", "#93c5fd", "#fcd34d", "#fdba74"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makePolygon(
  centerLng: number,
  centerLat: number,
  widthDeg: number,
  heightDeg: number
): GeoJSON.Polygon {
  const hw = widthDeg / 2;
  const hh = heightDeg / 2;
  return {
    type: "Polygon",
    coordinates: [
      [
        [centerLng - hw, centerLat - hh],
        [centerLng + hw, centerLat - hh],
        [centerLng + hw, centerLat + hh],
        [centerLng - hw, centerLat + hh],
        [centerLng - hw, centerLat - hh],
      ],
    ],
  };
}

function interpolatePath(
  from: [number, number],
  to: [number, number],
  towerCount: number
): [number, number][] {
  const path: [number, number][] = [from];
  const rand = seededRandom(from[0] * 1000 + from[1] * 100 + to[0]);
  for (let i = 1; i <= towerCount; i++) {
    const t = i / (towerCount + 1);
    const lng = from[0] + (to[0] - from[0]) * t + (rand() - 0.5) * 0.04;
    const lat = from[1] + (to[1] - from[1]) * t + (rand() - 0.5) * 0.03;
    path.push([lng, lat]);
  }
  path.push(to);
  return path;
}

function lineLengthKm(path: [number, number][]): number {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const [lng1, lat1] = path[i - 1];
    const [lng2, lat2] = path[i];
    const dlat = ((lat2 - lat1) * Math.PI) / 180;
    const dlng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dlng / 2) ** 2;
    km += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return Math.round(km * 10) / 10;
}

const SUBSTATION_SEEDS: Omit<
  Substation,
  | "id"
  | "zoneId"
  | "circleId"
  | "divisionId"
  | "power_received_MW"
  | "power_sent_MW"
  | "feeders_in"
  | "feeders_out"
  | "transformers"
  | "temperature_C"
  | "oil_level_pct"
  | "last_maintenance"
  | "maintenance_due"
>[] = [
  {
    name: "Panipat",
    latitude: 29.3909,
    longitude: 76.9635,
    zone: "North Zone",
    circle: "Karnal Circle",
    division: "Panipat Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 500,
    load_MW: 310,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Karnal",
    latitude: 29.6857,
    longitude: 76.9905,
    zone: "North Zone",
    circle: "Karnal Circle",
    division: "Karnal Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 400,
    load_MW: 285,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Yamunanagar",
    latitude: 30.129,
    longitude: 77.2674,
    zone: "North Zone",
    circle: "Ambala Circle",
    division: "Yamunanagar Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 350,
    load_MW: 220,
    health: "Warning",
    status: "Running",
  },
  {
    name: "Ambala",
    latitude: 30.3782,
    longitude: 76.7767,
    zone: "North Zone",
    circle: "Ambala Circle",
    division: "Ambala Division",
    voltage_level: "400/220kV",
    incoming_voltage: 400,
    outgoing_voltage: 220,
    capacity_MVA: 630,
    load_MW: 420,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Rohtak",
    latitude: 28.8955,
    longitude: 76.6066,
    zone: "Central Zone",
    circle: "Rohtak Circle",
    division: "Rohtak Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 450,
    load_MW: 340,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Hisar",
    latitude: 29.1492,
    longitude: 75.7217,
    zone: "West Zone",
    circle: "Hisar Circle",
    division: "Hisar Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 500,
    load_MW: 365,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Bhiwani",
    latitude: 28.7975,
    longitude: 76.1318,
    zone: "West Zone",
    circle: "Hisar Circle",
    division: "Bhiwani Division",
    voltage_level: "132/66kV",
    incoming_voltage: 132,
    outgoing_voltage: 66,
    capacity_MVA: 200,
    load_MW: 145,
    health: "Warning",
    status: "Running",
  },
  {
    name: "Bahadurgarh",
    latitude: 28.6928,
    longitude: 76.9278,
    zone: "Central Zone",
    circle: "Delhi Border Circle",
    division: "Bahadurgarh Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 400,
    load_MW: 295,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Gurugram",
    latitude: 28.4595,
    longitude: 77.0266,
    zone: "South Zone",
    circle: "Gurugram Circle",
    division: "Gurugram Division",
    voltage_level: "400/220kV",
    incoming_voltage: 400,
    outgoing_voltage: 220,
    capacity_MVA: 800,
    load_MW: 580,
    health: "Healthy",
    status: "Running",
  },
  {
    name: "Faridabad",
    latitude: 28.4089,
    longitude: 77.3178,
    zone: "South Zone",
    circle: "Faridabad Circle",
    division: "Faridabad Division",
    voltage_level: "220/132kV",
    incoming_voltage: 220,
    outgoing_voltage: 132,
    capacity_MVA: 500,
    load_MW: 410,
    health: "Critical",
    status: "Running",
  },
];

export function generateHaryanaNetwork() {
  const rand = seededRandom(2026);

  const zones: Zone[] = [
    {
      id: "zone-north",
      name: "North Zone",
      code: "NZ",
      boundary: makePolygon(76.9, 29.9, 1.2, 1.0),
      color: ZONE_COLORS[0],
      totalSubstations: 4,
      totalLoadMW: 1235,
    },
    {
      id: "zone-central",
      name: "Central Zone",
      code: "CZ",
      boundary: makePolygon(76.7, 28.8, 1.0, 0.8),
      color: ZONE_COLORS[1],
      totalSubstations: 2,
      totalLoadMW: 635,
    },
    {
      id: "zone-west",
      name: "West Zone",
      code: "WZ",
      boundary: makePolygon(75.9, 29.0, 1.1, 1.0),
      color: ZONE_COLORS[2],
      totalSubstations: 2,
      totalLoadMW: 510,
    },
    {
      id: "zone-south",
      name: "South Zone",
      code: "SZ",
      boundary: makePolygon(77.1, 28.4, 1.0, 0.7),
      color: ZONE_COLORS[3],
      totalSubstations: 2,
      totalLoadMW: 990,
    },
  ];

  const circles: Circle[] = [
    { id: "circle-karnal", name: "Karnal Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(76.95, 29.55, 0.5, 0.45), color: CIRCLE_COLORS[0] },
    { id: "circle-ambala", name: "Ambala Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(77.0, 30.2, 0.55, 0.4), color: CIRCLE_COLORS[1] },
    { id: "circle-rohtak", name: "Rohtak Circle", zoneId: "zone-central", zoneName: "Central Zone", boundary: makePolygon(76.6, 28.9, 0.45, 0.35), color: CIRCLE_COLORS[2] },
    { id: "circle-delhi-border", name: "Delhi Border Circle", zoneId: "zone-central", zoneName: "Central Zone", boundary: makePolygon(76.85, 28.7, 0.4, 0.3), color: CIRCLE_COLORS[3] },
    { id: "circle-hisar", name: "Hisar Circle", zoneId: "zone-west", zoneName: "West Zone", boundary: makePolygon(75.9, 29.0, 0.7, 0.55), color: CIRCLE_COLORS[4] },
    { id: "circle-gurugram", name: "Gurugram Circle", zoneId: "zone-south", zoneName: "South Zone", boundary: makePolygon(77.0, 28.45, 0.45, 0.35), color: CIRCLE_COLORS[5] },
    { id: "circle-faridabad", name: "Faridabad Circle", zoneId: "zone-south", zoneName: "South Zone", boundary: makePolygon(77.3, 28.4, 0.4, 0.3), color: CIRCLE_COLORS[0] },
  ];

  const divisions: Division[] = [
    { id: "div-panipat", name: "Panipat Division", circleId: "circle-karnal", circleName: "Karnal Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(76.96, 29.39, 0.25, 0.2), color: DIVISION_COLORS[0] },
    { id: "div-karnal", name: "Karnal Division", circleId: "circle-karnal", circleName: "Karnal Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(76.99, 29.68, 0.25, 0.2), color: DIVISION_COLORS[1] },
    { id: "div-yamunanagar", name: "Yamunanagar Division", circleId: "circle-ambala", circleName: "Ambala Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(77.27, 30.13, 0.25, 0.2), color: DIVISION_COLORS[2] },
    { id: "div-ambala", name: "Ambala Division", circleId: "circle-ambala", circleName: "Ambala Circle", zoneId: "zone-north", zoneName: "North Zone", boundary: makePolygon(76.78, 30.38, 0.25, 0.2), color: DIVISION_COLORS[3] },
    { id: "div-rohtak", name: "Rohtak Division", circleId: "circle-rohtak", circleName: "Rohtak Circle", zoneId: "zone-central", zoneName: "Central Zone", boundary: makePolygon(76.61, 28.9, 0.25, 0.2), color: DIVISION_COLORS[4] },
    { id: "div-bahadurgarh", name: "Bahadurgarh Division", circleId: "circle-delhi-border", circleName: "Delhi Border Circle", zoneId: "zone-central", zoneName: "Central Zone", boundary: makePolygon(76.93, 28.69, 0.22, 0.18), color: DIVISION_COLORS[5] },
    { id: "div-hisar", name: "Hisar Division", circleId: "circle-hisar", circleName: "Hisar Circle", zoneId: "zone-west", zoneName: "West Zone", boundary: makePolygon(75.72, 29.15, 0.3, 0.25), color: DIVISION_COLORS[0] },
    { id: "div-bhiwani", name: "Bhiwani Division", circleId: "circle-hisar", circleName: "Hisar Circle", zoneId: "zone-west", zoneName: "West Zone", boundary: makePolygon(76.13, 28.8, 0.25, 0.2), color: DIVISION_COLORS[1] },
    { id: "div-gurugram", name: "Gurugram Division", circleId: "circle-gurugram", circleName: "Gurugram Circle", zoneId: "zone-south", zoneName: "South Zone", boundary: makePolygon(77.03, 28.46, 0.25, 0.2), color: DIVISION_COLORS[2] },
    { id: "div-faridabad", name: "Faridabad Division", circleId: "circle-faridabad", circleName: "Faridabad Circle", zoneId: "zone-south", zoneName: "South Zone", boundary: makePolygon(77.32, 28.41, 0.22, 0.18), color: DIVISION_COLORS[3] },
  ];

  const zoneMap = Object.fromEntries(zones.map((z) => [z.name, z.id]));
  const circleMap = Object.fromEntries(circles.map((c) => [c.name, c.id]));
  const divisionMap = Object.fromEntries(divisions.map((d) => [d.name, d.id]));

  const substations: Substation[] = SUBSTATION_SEEDS.map((seed, i) => ({
    ...seed,
    id: `SS-${String(i + 1).padStart(3, "0")}`,
    zoneId: zoneMap[seed.zone],
    circleId: circleMap[seed.circle],
    divisionId: divisionMap[seed.division],
    power_received_MW: Math.round(seed.load_MW * (0.85 + rand() * 0.15)),
    power_sent_MW: Math.round(seed.load_MW * (0.75 + rand() * 0.2)),
    feeders_in: Math.floor(rand() * 3) + 2,
    feeders_out: Math.floor(rand() * 4) + 3,
    transformers: Math.floor(rand() * 3) + 2,
    temperature_C: Math.round(42 + rand() * 28),
    oil_level_pct: Math.round(72 + rand() * 26),
    last_maintenance: `2025-${String(Math.floor(rand() * 6) + 6).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`,
    maintenance_due: `2026-${String(Math.floor(rand() * 6) + 7).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`,
  }));

  const lineConnections: {
    from: string;
    to: string;
    voltage: VoltageLevel;
    towers: number;
    name: string;
  }[] = [
    { from: "SS-001", to: "SS-002", voltage: "220kV", towers: 8, name: "Panipat–Karnal 220kV" },
    { from: "SS-002", to: "SS-003", voltage: "220kV", towers: 10, name: "Karnal–Yamunanagar 220kV" },
    { from: "SS-003", to: "SS-004", voltage: "220kV", towers: 9, name: "Yamunanagar–Ambala 220kV" },
    { from: "SS-004", to: "SS-005", voltage: "400kV", towers: 12, name: "Ambala–Rohtak 400kV" },
    { from: "SS-005", to: "SS-008", voltage: "220kV", towers: 7, name: "Rohtak–Bahadurgarh 220kV" },
    { from: "SS-008", to: "SS-009", voltage: "400kV", towers: 8, name: "Bahadurgarh–Gurugram 400kV" },
    { from: "SS-009", to: "SS-010", voltage: "220kV", towers: 6, name: "Gurugram–Faridabad 220kV" },
    { from: "SS-005", to: "SS-006", voltage: "220kV", towers: 11, name: "Rohtak–Hisar 220kV" },
    { from: "SS-006", to: "SS-007", voltage: "132kV", towers: 9, name: "Hisar–Bhiwani 132kV" },
    { from: "SS-006", to: "SS-001", voltage: "220kV", towers: 14, name: "Hisar–Panipat 220kV" },
    { from: "SS-007", to: "SS-008", voltage: "66kV", towers: 8, name: "Bhiwani–Bahadurgarh 66kV" },
    { from: "SS-002", to: "SS-005", voltage: "132kV", towers: 10, name: "Karnal–Rohtak 132kV" },
  ];

  const subMap = Object.fromEntries(substations.map((s) => [s.id, s]));
  const towers: Tower[] = [];
  const lines: TransmissionLine[] = [];
  let towerIdx = 1;

  for (const conn of lineConnections) {
    const from = subMap[conn.from];
    const to = subMap[conn.to];
    const fromCoord: [number, number] = [from.longitude, from.latitude];
    const toCoord: [number, number] = [to.longitude, to.latitude];
    const path = interpolatePath(fromCoord, toCoord, conn.towers);
    const lineId = `TL-${lines.length + 1}`;
    const towerIds: string[] = [];

    for (let i = 1; i < path.length - 1; i++) {
      const [lng, lat] = path[i];
      const towerId = `TW-${String(towerIdx).padStart(3, "0")}`;
      towerIds.push(towerId);
      towers.push({
        id: towerId,
        tower_number: `T-${String(towerIdx).padStart(4, "0")}`,
        latitude: lat,
        longitude: lng,
        height_m: conn.voltage === "400kV" ? 52 : conn.voltage === "220kV" ? 45 : conn.voltage === "132kV" ? 38 : 32,
        tower_type: conn.voltage === "66kV" ? "Lattice" : "Monopole",
        voltage_level: conn.voltage,
        health: rand() < 0.08 ? "Warning" : "Healthy",
        maintenance_due: `2026-${String(Math.floor(rand() * 6) + 7).padStart(2, "0")}-15`,
        status: "Running",
        line_id: lineId,
        line_name: conn.name,
        sequence: i,
      });
      towerIdx++;
    }

    lines.push({
      id: lineId,
      name: conn.name,
      voltage_level: conn.voltage,
      from_substation_id: conn.from,
      to_substation_id: conn.to,
      from_substation: from.name,
      to_substation: to.name,
      tower_ids: towerIds,
      path,
      length_km: lineLengthKm(path),
      load_pct: Math.round(55 + rand() * 40),
      health: rand() < 0.1 ? "Warning" : "Healthy",
      status: "Running",
      flow_direction: "forward",
      flow_MW: Math.round(80 + rand() * 200),
    });
  }

  return { zones, circles, divisions, substations, towers, lines };
}

export const haryanaNetwork = generateHaryanaNetwork();
