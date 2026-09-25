/**
 * Data Service — abstraction layer for network data.
 * Currently uses local generator; designed for future API/SCADA integration.
 */
import { haryanaNetwork } from "@/lib/data/haryana";
import { getDashboardStats, searchNetwork } from "@/lib/data/haryana";
import type { DashboardStats, SearchResult } from "@/lib/types/digitalTwin";
import type { Zone, Circle, Division, Substation, Tower, TransmissionLine } from "@/lib/types/digitalTwin";

export interface NetworkData {
  zones: Zone[];
  circles: Circle[];
  divisions: Division[];
  substations: Substation[];
  towers: Tower[];
  lines: TransmissionLine[];
}

/** Fetch full network dataset (local or API) */
export async function fetchNetworkData(): Promise<NetworkData> {
  // Future: return fetch(`${API_BASE}/api/network`).then(r => r.json())
  return haryanaNetwork;
}

export function getStats(): DashboardStats {
  return getDashboardStats();
}

export function search(q: string): SearchResult[] {
  return searchNetwork(q);
}

/** Jurisdiction stats for popup */
export function jurisdictionStats(
  type: "zone" | "circle" | "division",
  id: string
) {
  const { zones, circles, divisions, substations, towers, lines } = haryanaNetwork;
  let subs = substations;
  let label = "";

  if (type === "zone") {
    const z = zones.find((z) => z.id === id);
    if (!z) return null;
    label = z.name;
    subs = substations.filter((s) => s.zoneId === id);
  } else if (type === "circle") {
    const c = circles.find((c) => c.id === id);
    if (!c) return null;
    label = c.name;
    subs = substations.filter((s) => s.circleId === id);
  } else {
    const d = divisions.find((d) => d.id === id);
    if (!d) return null;
    label = d.name;
    subs = substations.filter((s) => s.divisionId === id);
  }

  const subIds = new Set(subs.map((s) => s.id));
  const relatedLines = lines.filter(
    (l) => subIds.has(l.from_substation_id) || subIds.has(l.to_substation_id)
  );
  const totalLineKm = relatedLines.reduce((s, l) => s + l.length_km, 0);
  const towerCount = towers.filter((t) =>
    relatedLines.some((l) => l.id === t.line_id)
  ).length;

  return {
    label,
    substationCount: subs.length,
    towerCount,
    totalLineKm: Math.round(totalLineKm),
    totalMW: subs.reduce((s, sub) => s + sub.load_MW, 0),
  };
}
