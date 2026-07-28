import substationsData from "@/lib/data/substations.json";

export interface SubstationRecord {
  code: number;
  name: string;
  zone: string;
  circle: string;
  division: string;
  voltage: string;
  lat: number;
  lng: number;
}

export const substations = substationsData as SubstationRecord[];

export const substationByCode = new Map(
  substations.map((s) => [s.code, s])
);

const PRIMARY_ZONES = ["Hisar", "Panchkula"];

export function normalizeZone(zone: string): string {
  if (PRIMARY_ZONES.includes(zone)) return zone;
  return "Other";
}

export function getZoneOptions(): string[] {
  const zones = new Set(substations.map((s) => normalizeZone(s.zone)));
  const ordered = ["Hisar", "Panchkula"].filter((z) => zones.has(z));
  if (zones.has("Other")) ordered.push("Other");
  return ordered;
}

export function getCircleOptions(zone: string): string[] {
  const filtered =
    zone === "All"
      ? substations
      : substations.filter((s) => normalizeZone(s.zone) === zone);
  return [...new Set(filtered.map((s) => s.circle))].sort();
}

export function getDivisionOptions(zone: string, circle: string): string[] {
  let filtered = substations;
  if (zone !== "All") {
    filtered = filtered.filter((s) => normalizeZone(s.zone) === zone);
  }
  if (circle !== "All") {
    filtered = filtered.filter((s) => s.circle === circle);
  }
  return [...new Set(filtered.map((s) => s.division))].sort();
}

export function getSubstationOptions(
  zone: string,
  circle: string,
  division: string,
  voltage: string
): SubstationRecord[] {
  let filtered = substations;
  if (zone !== "All") {
    filtered = filtered.filter((s) => normalizeZone(s.zone) === zone);
  }
  if (circle !== "All") {
    filtered = filtered.filter((s) => s.circle === circle);
  }
  if (division !== "All") {
    filtered = filtered.filter((s) => s.division === division);
  }
  if (voltage !== "All") {
    filtered = filtered.filter((s) => s.voltage === voltage);
  }
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

export type DateRangeOption = "Today" | "Last 7 Days" | "Last 30 Days" | "Custom Range";

export interface HierarchyFilters {
  zone: string;
  circle: string;
  division: string;
  substation: string;
  voltage: string;
  dateRange: DateRangeOption;
}

export const defaultHierarchyFilters: HierarchyFilters = {
  zone: "All",
  circle: "All",
  division: "All",
  substation: "All",
  voltage: "All",
  dateRange: "Last 7 Days",
};

export function substationMatchesHierarchy(
  code: number,
  filters: HierarchyFilters
): boolean {
  const sub = substationByCode.get(code);
  if (!sub) return false;

  if (filters.zone !== "All" && normalizeZone(sub.zone) !== filters.zone) {
    return false;
  }
  if (filters.circle !== "All" && sub.circle !== filters.circle) {
    return false;
  }
  if (filters.division !== "All" && sub.division !== filters.division) {
    return false;
  }
  if (filters.substation !== "All" && sub.name !== filters.substation) {
    return false;
  }
  if (filters.voltage !== "All" && sub.voltage !== filters.voltage) {
    return false;
  }

  return true;
}
