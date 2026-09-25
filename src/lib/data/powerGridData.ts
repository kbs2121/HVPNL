/**
 * Haryana Transmission Network GIS data
 * Substations sourced from SUB_STATION List.xlsx → substations.json (445 sites)
 */

import substationsJson from "@/lib/data/substations.json";
import { normalizeZone } from "@/lib/data/hierarchyFilters";

export type VoltageLevel = "400kV" | "220kV" | "132kV" | "66kV";

export interface Substation {
  id: string;
  code: number;
  name: string;
  location: string;
  zone: string;
  zoneDisplay: string;
  circle: string;
  division: string;
  voltage: VoltageLevel;
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
  voltage: VoltageLevel;
  fromName: string;
  toName: string;
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

interface RawSubstation {
  code: number;
  name: string;
  zone: string;
  circle: string;
  division: string;
  voltage: string;
  lat: number;
  lng: number;
}

function asVoltage(raw: string): VoltageLevel {
  const v = raw.replace(/\s+/g, "").toUpperCase();
  if (v.startsWith("400")) return "400kV";
  if (v.startsWith("220")) return "220kV";
  if (v.startsWith("132")) return "132kV";
  return "66kV";
}

function incomingForVoltage(v: VoltageLevel): string {
  if (v === "400kV") return "500 MVA";
  if (v === "220kV") return "250 MVA";
  if (v === "132kV") return "160 MVA";
  return "80 MVA";
}

function transformForVoltage(v: VoltageLevel): string {
  if (v === "400kV") return "400kV stepped down to 220kV / 132kV";
  if (v === "220kV") return "220kV stepped down to 132kV / 66kV";
  if (v === "132kV") return "132kV stepped down to 66kV / 33kV";
  return "66kV stepped down to 33kV / 11kV";
}

function mapRaw(raw: RawSubstation, index: number): Substation {
  const voltage = asVoltage(raw.voltage);
  const zoneKey = normalizeZone(raw.zone);
  const seed = (raw.code * 17 + index * 13) % 100;
  const statusRoll = seed % 20;
  const status: Substation["status"] =
    statusRoll === 0
      ? "Overload Alert"
      : statusRoll === 1
        ? "Maintenance"
        : statusRoll === 2
          ? "Standby"
          : "Active";
  const loadPct =
    status === "Overload Alert"
      ? 88 + (seed % 12)
      : status === "Maintenance"
        ? 30 + (seed % 25)
        : status === "Standby"
          ? 10 + (seed % 20)
          : 55 + (seed % 35);

  return {
    id: `ss-${raw.code}`,
    code: raw.code,
    name: raw.name,
    location: raw.division,
    zone: raw.zone,
    zoneDisplay: zoneKey,
    circle: raw.circle,
    division: raw.division,
    voltage,
    incomingPower: incomingForVoltage(voltage),
    voltageTransform: transformForVoltage(voltage),
    status,
    loadPct,
    lat: raw.lat,
    lng: raw.lng,
  };
}

export const SUBSTATIONS: Substation[] = (substationsJson as RawSubstation[]).map(mapRaw);

export function findSubstationByCode(code: string | number): Substation | undefined {
  const n = typeof code === "string" ? Number(code) : code;
  return SUBSTATIONS.find((s) => s.code === n);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
    const jitter = ((seed + i) % 5) * 0.0015 - 0.003;
    const lng = from[0] + (to[0] - from[0]) * t + jitter;
    const lat = from[1] + (to[1] - from[1]) * t - jitter * 0.5;
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

function buildCorridors(list: Substation[]): TransmissionLine[] {
  const ss400 = list.filter((s) => s.voltage === "400kV");
  const ss220 = list.filter((s) => s.voltage === "220kV");
  const ss132 = list.filter((s) => s.voltage === "132kV");
  const ss66 = list.filter((s) => s.voltage === "66kV");

  const linesMap = new Map<
    string,
    { from: Substation; to: Substation; voltage: VoltageLevel }
  >();

  function addEdge(a: Substation, b: Substation, voltage: VoltageLevel) {
    if (a.code === b.code) return;
    const key =
      a.code < b.code ? `${a.code}__${b.code}` : `${b.code}__${a.code}`;
    if (!linesMap.has(key)) {
      linesMap.set(key, { from: a, to: b, voltage });
    }
  }

  // 1. 400kV Backbone: Interconnect all 400kV substations into a ring/mesh
  for (const s of ss400) {
    const others = ss400
      .filter((o) => o.code !== s.code)
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d);
    for (let i = 0; i < Math.min(3, others.length); i++) {
      addEdge(s, others[i].s, "400kV");
    }
  }

  // 2. 220kV Grid: Connect each 220kV to nearby 400kV hub + nearest 220kV in circle
  for (const s of ss220) {
    const near400 = ss400
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near400 && near400.d < 65) {
      addEdge(s, near400.s, "220kV");
    }

    const sameCircle = ss220
      .filter((o) => o.code !== s.code && o.circle === s.circle)
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d);
    if (sameCircle[0]) {
      addEdge(s, sameCircle[0].s, "220kV");
    }

    const any220 = ss220
      .filter((o) => o.code !== s.code)
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d);
    if (any220[0] && any220[0].d < 35) {
      addEdge(s, any220[0].s, "220kV");
    }
  }

  // 3. 132kV Sub-Transmission: Connect to parent 220kV or nearest 132kV
  for (const s of ss132) {
    const near220 = ss220
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near220 && near220.d < 50) {
      addEdge(s, near220.s, "132kV");
    } else {
      const near132 = ss132
        .filter((o) => o.code !== s.code)
        .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
        .sort((a, b) => a.d - b.d)[0];
      if (near132) addEdge(s, near132.s, "132kV");
    }

    const sameDiv = ss132
      .filter((o) => o.code !== s.code && o.division === s.division)
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d);
    if (sameDiv[0] && sameDiv[0].d < 25) {
      addEdge(s, sameDiv[0].s, "132kV");
    }
  }

  // 4. 66kV Distribution Feeds: Connect to parent 132kV or 220kV
  for (const s of ss66) {
    const parents = [...ss132, ...ss220]
      .map((o) => ({ s: o, d: distanceKm(s.lat, s.lng, o.lat, o.lng) }))
      .sort((a, b) => a.d - b.d)[0];
    if (parents) {
      addEdge(s, parents.s, "66kV");
    }
  }

  const lines: TransmissionLine[] = [];
  let seed = 1;

  for (const edge of linesMap.values()) {
    const lineId = `${edge.from.id}__${edge.to.id}`;
    const towerCount =
      edge.voltage === "400kV"
        ? 3
        : edge.voltage === "220kV"
          ? 2
          : edge.voltage === "132kV"
            ? 1
            : 0;

    const { path, towers } = interpolatePath(
      [edge.from.lng, edge.from.lat],
      [edge.to.lng, edge.to.lat],
      towerCount,
      lineId,
      seed++
    );

    lines.push({
      id: lineId,
      fromId: edge.from.id,
      toId: edge.to.id,
      voltage: edge.voltage,
      fromName: edge.from.name,
      toName: edge.to.name,
      path,
      towers,
    });
  }

  return lines;
}

export const TRANSMISSION_LINES: TransmissionLine[] = buildCorridors(SUBSTATIONS);
export const ALL_TOWERS: Tower[] = TRANSMISSION_LINES.flatMap((l) => l.towers);

// --- Convex Hull and Jurisdiction Boundaries ---

function crossProduct(
  o: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function computeConvexHull(
  points: [number, number][],
  bufferRatio = 0.08,
  minBuffer = 0.035
): [number, number][] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    const [x, y] = points[0];
    const d = 0.05;
    return [
      [x - d, y - d],
      [x + d, y - d],
      [x + d, y + d],
      [x - d, y + d],
      [x - d, y - d],
    ];
  }
  if (points.length === 2) {
    const [x1, y1] = points[0];
    const [x2, y2] = points[1];
    const d = 0.04;
    return [
      [x1 - d, y1 - d],
      [x2 + d, y1 - d],
      [x2 + d, y2 + d],
      [x1 - d, y2 + d],
      [x1 - d, y1 - d],
    ];
  }

  const pts = points
    .slice()
    .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);
  if (hull.length < 3) return hull;

  let cx = 0;
  let cy = 0;
  for (const p of hull) {
    cx += p[0];
    cy += p[1];
  }
  cx /= hull.length;
  cy /= hull.length;

  const expanded = hull.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    const expand = Math.max(dist * bufferRatio, minBuffer);
    const scale = (dist + expand) / (dist || 1);
    return [
      Number((cx + dx * scale).toFixed(4)),
      Number((cy + dy * scale).toFixed(4)),
    ] as [number, number];
  });

  expanded.push([expanded[0][0], expanded[0][1]]);
  return expanded;
}

// Generate Jurisdiction Zones
function buildJurisdictionZones(): JurisdictionZone[] {
  const hisarPts: [number, number][] = [];
  const panchkulaPts: [number, number][] = [];

  for (const s of SUBSTATIONS) {
    const z = normalizeZone(s.zone);
    if (z === "Hisar") hisarPts.push([s.lng, s.lat]);
    else if (z === "Panchkula") panchkulaPts.push([s.lng, s.lat]);
  }

  return [
    {
      id: "zone-hisar",
      name: "Hisar Zone (DHBVN)",
      color: "#f59e0b",
      polygon: computeConvexHull(hisarPts, 0.07, 0.05),
    },
    {
      id: "zone-panchkula",
      name: "Panchkula Zone (UHBVN)",
      color: "#14b8a6",
      polygon: computeConvexHull(panchkulaPts, 0.07, 0.05),
    },
  ];
}

const CIRCLE_META: Record<
  string,
  { zoneId: string; color: string; label: string }
> = {
  "TS Karnal": {
    zoneId: "zone-panchkula",
    color: "#2dd4bf",
    label: "TS Karnal Circle",
  },
  "TS Panchkula": {
    zoneId: "zone-panchkula",
    color: "#06b6d4",
    label: "TS Panchkula Circle",
  },
  "TS Faridabad": {
    zoneId: "zone-hisar",
    color: "#a855f7",
    label: "TS Faridabad Circle",
  },
  "TS Gurgaon": {
    zoneId: "zone-hisar",
    color: "#ec4899",
    label: "TS Gurgaon Circle",
  },
  "TS Hisar": {
    zoneId: "zone-hisar",
    color: "#fbbf24",
    label: "TS Hisar Circle",
  },
  "TS Rohtak": {
    zoneId: "zone-hisar",
    color: "#f97316",
    label: "TS Rohtak Circle",
  },
  Other: {
    zoneId: "zone-other",
    color: "#64748b",
    label: "Other Circle",
  },
};

function buildJurisdictionCircles(): JurisdictionCircle[] {
  const map = new Map<string, [number, number][]>();
  for (const s of SUBSTATIONS) {
    const list = map.get(s.circle) ?? [];
    list.push([s.lng, s.lat]);
    map.set(s.circle, list);
  }

  const circles: JurisdictionCircle[] = [];
  for (const [name, pts] of map.entries()) {
    const meta = CIRCLE_META[name] ?? {
      zoneId: "zone-other",
      color: "#64748b",
      label: `${name} Circle`,
    };
    circles.push({
      id: `circle-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      zoneId: meta.zoneId,
      name: meta.label,
      color: meta.color,
      polygon: computeConvexHull(pts, 0.06, 0.04),
    });
  }
  return circles;
}

const DIVISION_COLORS: Record<string, string> = {
  "TS Karnal": "#2dd4bf",
  "TS Panipat": "#5eead4",
  "TS Kurukshetra": "#14b8a6",
  "TS Yamunanagar": "#0d9488",
  "TS Ambala": "#38bdf8",
  "TS Madanpur": "#0284c7",
  "TS Hisar": "#fcd34d",
  "TS Sirsa": "#fbbf24",
  "TS Jind": "#f59e0b",
  "TS Bhiwani": "#d97706",
  "TS Rohtak": "#fb923c",
  "TS Gurgaon": "#f472b6",
  "TS Manesar": "#db2777",
  "TS Rewari": "#e11d48",
  "TS Faridabad": "#c084fc",
  "TS Palwal": "#9333ea",
  "TS Kaithal": "#6ee7b7",
  Other: "#94a3b8",
};

function buildJurisdictionDivisions(): JurisdictionDivision[] {
  const divMap = new Map<
    string,
    { circle: string; zone: string; pts: [number, number][] }
  >();

  for (const s of SUBSTATIONS) {
    let entry = divMap.get(s.division);
    if (!entry) {
      entry = { circle: s.circle, zone: s.zone, pts: [] };
      divMap.set(s.division, entry);
    }
    entry.pts.push([s.lng, s.lat]);
  }

  const divisions: JurisdictionDivision[] = [];
  for (const [name, entry] of divMap.entries()) {
    const color = DIVISION_COLORS[name] ?? "#64748b";
    const circleId = `circle-${entry.circle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const zoneId =
      normalizeZone(entry.zone) === "Hisar"
        ? "zone-hisar"
        : normalizeZone(entry.zone) === "Panchkula"
          ? "zone-panchkula"
          : "zone-other";

    divisions.push({
      id: `div-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      circleId,
      zoneId,
      name: `${name} Division`,
      color,
      polygon: computeConvexHull(entry.pts, 0.05, 0.03),
    });
  }
  return divisions;
}

export const JURISDICTION_ZONES: JurisdictionZone[] = buildJurisdictionZones();
export const JURISDICTION_CIRCLES: JurisdictionCircle[] = buildJurisdictionCircles();
export const JURISDICTION_DIVISIONS: JurisdictionDivision[] = buildJurisdictionDivisions();

export const HARYANA_CENTER: [number, number] = [29.6, 76.3];
export const DEFAULT_ZOOM = 7.8;

