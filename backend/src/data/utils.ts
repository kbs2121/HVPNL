import type { DashboardStats, SearchResult } from "./types.js";
import { network } from "./networkData.js";

export function getDashboardStats(): DashboardStats {
  const { zones, circles, divisions, substations, towers, lines } = network;
  const livePowerMW = substations.reduce((sum: number, s: { load_MW: number }) => sum + s.load_MW, 0);
  const totalCapacityMW = substations.reduce(
    (sum: number, s: { capacity_MVA: number }) => sum + s.capacity_MVA * 0.9,
    0
  );

  return {
    totalZones: zones.length,
    totalCircles: circles.length,
    totalDivisions: divisions.length,
    totalSubstations: substations.length,
    totalTowers: towers.length,
    totalLines: lines.length,
    totalCapacityMW: Math.round(totalCapacityMW),
    livePowerMW,
    totalDemandMW: Math.round(livePowerMW * 1.05),
    totalGenerationMW: Math.round(livePowerMW * 1.08),
    systemLossesMW: Math.round(livePowerMW * 0.08),
    avgTransformerLoading: 72.5,
    avgLineUtilization: Math.round(
      lines.reduce((s: number, l: { load_pct: number }) => s + l.load_pct, 0) / lines.length
    ),
    lastUpdate: new Date().toISOString(),
  };
}

export function searchNetwork(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: SearchResult[] = [];
  const { zones, circles, divisions, substations, towers, lines } = network;

  for (const z of zones) {
    if (z.name.toLowerCase().includes(q)) {
      const c = z.boundary.coordinates[0][0];
      results.push({ type: "zone", id: z.id, name: z.name, subtitle: `${z.totalSubstations} substations`, latitude: c[1], longitude: c[0] });
    }
  }
  for (const c of circles) {
    if (c.name.toLowerCase().includes(q)) {
      const coord = c.boundary.coordinates[0][0];
      results.push({ type: "circle", id: c.id, name: c.name, subtitle: c.zoneName, latitude: coord[1], longitude: coord[0] });
    }
  }
  for (const d of divisions) {
    if (d.name.toLowerCase().includes(q)) {
      const coord = d.boundary.coordinates[0][0];
      results.push({ type: "division", id: d.id, name: d.name, subtitle: `${d.circleName} · ${d.zoneName}`, latitude: coord[1], longitude: coord[0] });
    }
  }
  for (const s of substations) {
    if (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) {
      results.push({ type: "substation", id: s.id, name: `${s.name} Substation`, subtitle: `${s.voltage_level} · ${s.zone}`, latitude: s.latitude, longitude: s.longitude });
    }
  }
  for (const t of towers) {
    if (t.tower_number.toLowerCase().includes(q) || t.line_name.toLowerCase().includes(q)) {
      results.push({ type: "tower", id: t.id, name: t.tower_number, subtitle: `${t.voltage_level} · ${t.line_name}`, latitude: t.latitude, longitude: t.longitude });
    }
  }
  for (const l of lines) {
    if (l.name.toLowerCase().includes(q)) {
      const mid = l.path[Math.floor(l.path.length / 2)];
      results.push({ type: "line", id: l.id, name: l.name, subtitle: `${l.voltage_level} · ${l.length_km} km`, latitude: mid[1], longitude: mid[0] });
    }
  }
  return results.slice(0, 12);
}
