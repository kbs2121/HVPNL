/**
 * Mock Haryana power grid data — Zone → Circle → Division → Substation
 */

export interface Substation {
  id: string;
  name: string;
  location: string;
  zone: string;
  circle: string;
  division: string;
  incomingPower: string;
  voltageTransform: string;
  status: "Active" | "Maintenance" | "Standby" | "Overload Alert";
  loadPct: number;
  lat: number;
  lng: number;
}

export interface Tower {
  id: string;
  lineId: string;
  lat: number;
  lng: number;
}

export interface TransmissionLine {
  id: string;
  fromId: string;
  toId: string;
  path: [number, number][];
  towers: Tower[];
}

export interface JurisdictionZone {
  id: string;
  name: string;
  color: string;
  polygon: [number, number][];
}

export interface JurisdictionCircle {
  id: string;
  zoneId: string;
  name: string;
  color: string;
  polygon: [number, number][];
}

export interface JurisdictionDivision {
  id: string;
  circleId: string;
  zoneId: string;
  name: string;
  color: string;
  polygon: [number, number][];
}

export const SUBSTATIONS: Substation[] = [
  {
    id: "ss-gurgaon-56",
    name: "DHBVN 400kV Substation",
    location: "Sector 56, Gurgaon",
    zone: "Zone 1 — South Haryana (DHBVN)",
    circle: "Gurgaon",
    division: "South Gurgaon",
    incomingPower: "400 MVA",
    voltageTransform: "400kV stepped down to 220kV / 66kV",
    status: "Active",
    loadPct: 78,
    lat: 28.4595,
    lng: 77.0266,
  },
  {
    id: "ss-faridabad-12",
    name: "DHBVN 220kV Substation",
    location: "Sector 12, Faridabad",
    zone: "Zone 1 — South Haryana (DHBVN)",
    circle: "Faridabad",
    division: "NIT Faridabad",
    incomingPower: "250 MVA",
    voltageTransform: "220kV stepped down to 132kV / 33kV",
    status: "Active",
    loadPct: 82,
    lat: 28.4089,
    lng: 77.3178,
  },
  {
    id: "ss-rohtak",
    name: "DHBVN 132kV Substation",
    location: "Model Colony, Rohtak",
    zone: "Zone 1 — South Haryana (DHBVN)",
    circle: "Rohtak",
    division: "Rohtak Urban",
    incomingPower: "160 MVA",
    voltageTransform: "132kV stepped down to 33kV / 11kV",
    status: "Active",
    loadPct: 65,
    lat: 28.8955,
    lng: 76.6066,
  },
  {
    id: "ss-hisar",
    name: "DHBVN 220kV Substation",
    location: "Urban Estate, Hisar",
    zone: "Zone 1 — South Haryana (DHBVN)",
    circle: "Hisar",
    division: "Hisar Central",
    incomingPower: "200 MVA",
    voltageTransform: "220kV stepped down to 132kV / 33kV",
    status: "Active",
    loadPct: 71,
    lat: 29.1492,
    lng: 75.7217,
  },
  {
    id: "ss-panipat",
    name: "UHBVN 220kV Substation",
    location: "Model Town, Panipat",
    zone: "Zone 2 — North Haryana (UHBVN)",
    circle: "Panipat",
    division: "Industrial Panipat",
    incomingPower: "300 MVA",
    voltageTransform: "220kV stepped down to 132kV / 33kV",
    status: "Overload Alert",
    loadPct: 94,
    lat: 29.3909,
    lng: 76.9635,
  },
  {
    id: "ss-ambala",
    name: "UHBVN 132kV Substation",
    location: "Cantt, Ambala",
    zone: "Zone 2 — North Haryana (UHBVN)",
    circle: "Ambala",
    division: "Cantt Ambala",
    incomingPower: "180 MVA",
    voltageTransform: "132kV stepped down to 33kV / 11kV",
    status: "Active",
    loadPct: 74,
    lat: 30.3782,
    lng: 76.7767,
  },
  {
    id: "ss-karnal",
    name: "UHBVN 220kV Substation",
    location: "Sector 6, Karnal",
    zone: "Zone 2 — North Haryana (UHBVN)",
    circle: "Karnal",
    division: "Karnal Industrial",
    incomingPower: "220 MVA",
    voltageTransform: "220kV stepped down to 132kV / 33kV",
    status: "Active",
    loadPct: 69,
    lat: 29.6857,
    lng: 76.9905,
  },
  {
    id: "ss-sonipat",
    name: "UHBVN 132kV Substation",
    location: "Kundli Industrial, Sonipat",
    zone: "Zone 2 — North Haryana (UHBVN)",
    circle: "Sonipat",
    division: "Kundli Division",
    incomingPower: "140 MVA",
    voltageTransform: "132kV stepped down to 33kV / 11kV",
    status: "Maintenance",
    loadPct: 42,
    lat: 28.9931,
    lng: 77.0151,
  },
];

function interpolatePath(
  from: [number, number],
  to: [number, number],
  towerCount: number,
  lineId: string,
  seed: number
): { path: [number, number][]; towers: Tower[] } {
  const path: [number, number][] = [from];
  const towers: Tower[] = [];
  for (let i = 1; i <= towerCount; i++) {
    const t = i / (towerCount + 1);
    const jitter = ((seed + i) % 5) * 0.004 - 0.008;
    const lng = from[0] + (to[0] - from[0]) * t + jitter;
    const lat = from[1] + (to[1] - from[1]) * t - jitter * 0.6;
    const point: [number, number] = [lng, lat];
    towers.push({
      id: `tower-${lineId}-${i}`,
      lineId,
      lat: point[1],
      lng: point[0],
    });
    path.push(point);
  }
  path.push(to);
  return { path, towers };
}

function buildLine(
  fromId: string,
  toId: string,
  towerCount: number,
  seed: number
): TransmissionLine {
  const from = SUBSTATIONS.find((s) => s.id === fromId)!;
  const to = SUBSTATIONS.find((s) => s.id === toId)!;
  const lineId = `${fromId}__${toId}`;
  const { path, towers } = interpolatePath(
    [from.lng, from.lat],
    [to.lng, to.lat],
    towerCount,
    lineId,
    seed
  );
  return { id: lineId, fromId, toId, path, towers };
}

export const TRANSMISSION_LINES: TransmissionLine[] = [
  buildLine("ss-gurgaon-56", "ss-faridabad-12", 3, 1),
  buildLine("ss-gurgaon-56", "ss-rohtak", 2, 2),
  buildLine("ss-faridabad-12", "ss-sonipat", 2, 3),
  buildLine("ss-rohtak", "ss-hisar", 3, 4),
  buildLine("ss-rohtak", "ss-panipat", 3, 5),
  buildLine("ss-panipat", "ss-karnal", 2, 6),
  buildLine("ss-panipat", "ss-ambala", 3, 7),
  buildLine("ss-karnal", "ss-ambala", 2, 8),
];

export const ALL_TOWERS: Tower[] = TRANSMISSION_LINES.flatMap((l) => l.towers);

export const JURISDICTION_ZONES: JurisdictionZone[] = [
  {
    id: "zone-south",
    name: "Zone 1 — South Haryana (DHBVN)",
    color: "#6366f1",
    polygon: [
      [74.8, 27.8],
      [77.8, 27.8],
      [77.8, 29.05],
      [74.8, 29.05],
      [74.8, 27.8],
    ],
  },
  {
    id: "zone-north",
    name: "Zone 2 — North Haryana (UHBVN)",
    color: "#14b8a6",
    polygon: [
      [74.8, 29.05],
      [77.8, 29.05],
      [77.8, 30.6],
      [74.8, 30.6],
      [74.8, 29.05],
    ],
  },
];

export const JURISDICTION_CIRCLES: JurisdictionCircle[] = [
  {
    id: "circle-gurgaon",
    zoneId: "zone-south",
    name: "Gurgaon Circle",
    color: "#818cf8",
    polygon: [
      [76.7, 28.2],
      [77.3, 28.2],
      [77.3, 28.6],
      [76.7, 28.6],
      [76.7, 28.2],
    ],
  },
  {
    id: "circle-faridabad",
    zoneId: "zone-south",
    name: "Faridabad Circle",
    color: "#a78bfa",
    polygon: [
      [77.1, 28.2],
      [77.5, 28.2],
      [77.5, 28.55],
      [77.1, 28.55],
      [77.1, 28.2],
    ],
  },
  {
    id: "circle-panipat",
    zoneId: "zone-north",
    name: "Panipat Circle",
    color: "#2dd4bf",
    polygon: [
      [76.7, 29.1],
      [77.2, 29.1],
      [77.2, 29.55],
      [76.7, 29.55],
      [76.7, 29.1],
    ],
  },
  {
    id: "circle-ambala",
    zoneId: "zone-north",
    name: "Ambala Circle",
    color: "#34d399",
    polygon: [
      [76.4, 30.0],
      [77.0, 30.0],
      [77.0, 30.5],
      [76.4, 30.5],
      [76.4, 30.0],
    ],
  },
  {
    id: "circle-rohtak",
    zoneId: "zone-south",
    name: "Rohtak Circle",
    color: "#60a5fa",
    polygon: [
      [76.35, 28.7],
      [76.85, 28.7],
      [76.85, 29.1],
      [76.35, 29.1],
      [76.35, 28.7],
    ],
  },
  {
    id: "circle-hisar",
    zoneId: "zone-south",
    name: "Hisar Circle",
    color: "#fbbf24",
    polygon: [
      [75.4, 28.9],
      [76.0, 28.9],
      [76.0, 29.4],
      [75.4, 29.4],
      [75.4, 28.9],
    ],
  },
];

export const JURISDICTION_DIVISIONS: JurisdictionDivision[] = [
  {
    id: "div-south-gurgaon",
    circleId: "circle-gurgaon",
    zoneId: "zone-south",
    name: "South Gurgaon Division",
    color: "#a5b4fc",
    polygon: [
      [76.85, 28.35],
      [77.15, 28.35],
      [77.15, 28.52],
      [76.85, 28.52],
      [76.85, 28.35],
    ],
  },
  {
    id: "div-nit-faridabad",
    circleId: "circle-faridabad",
    zoneId: "zone-south",
    name: "NIT Faridabad Division",
    color: "#c4b5fd",
    polygon: [
      [77.18, 28.32],
      [77.42, 28.32],
      [77.42, 28.48],
      [77.18, 28.48],
      [77.18, 28.32],
    ],
  },
  {
    id: "div-industrial-panipat",
    circleId: "circle-panipat",
    zoneId: "zone-north",
    name: "Industrial Panipat Division",
    color: "#5eead4",
    polygon: [
      [76.82, 29.22],
      [77.08, 29.22],
      [77.08, 29.48],
      [76.82, 29.48],
      [76.82, 29.22],
    ],
  },
  {
    id: "div-cantt-ambala",
    circleId: "circle-ambala",
    zoneId: "zone-north",
    name: "Cantt Ambala Division",
    color: "#6ee7b7",
    polygon: [
      [76.55, 30.12],
      [76.85, 30.12],
      [76.85, 30.38],
      [76.55, 30.38],
      [76.55, 30.12],
    ],
  },
  {
    id: "div-rohtak-urban",
    circleId: "circle-rohtak",
    zoneId: "zone-south",
    name: "Rohtak Urban Division",
    color: "#93c5fd",
    polygon: [
      [76.45, 28.78],
      [76.75, 28.78],
      [76.75, 29.02],
      [76.45, 29.02],
      [76.45, 28.78],
    ],
  },
  {
    id: "div-hisar-central",
    circleId: "circle-hisar",
    zoneId: "zone-south",
    name: "Hisar Central Division",
    color: "#fcd34d",
    polygon: [
      [75.55, 29.02],
      [75.88, 29.02],
      [75.88, 29.28],
      [75.55, 29.28],
      [75.55, 29.02],
    ],
  },
];

export const HARYANA_CENTER: [number, number] = [29.0588, 76.0856];
export const DEFAULT_ZOOM = 8;
