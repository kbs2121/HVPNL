/**
 * Power generation & inter-state grid injection points for Transmission Network GIS.
 */

import { findSubstationByCode, type VoltageLevel } from "@/lib/data/powerGridData";

export type GenerationCategory = "thermal" | "interstate" | "renewable";

/** Filter bar — Grid Level / Source */
export type GridLevelFilter =
  | "all"
  | "generating"
  | "interstate"
  | "400kv"
  | "220kv"
  | "distribution";

export const GRID_LEVEL_OPTIONS: { value: GridLevelFilter; label: string }[] = [
  { value: "all", label: "All Grid" },
  { value: "generating", label: "Generating Stations" },
  { value: "interstate", label: "Inter-State Infeed (PGCIL)" },
  { value: "400kv", label: "400kV Backbone" },
  { value: "220kv", label: "220kV Grid" },
  { value: "distribution", label: "132kV/66kV Distribution Links" },
];

export interface GenerationSource {
  id: string;
  name: string;
  category: GenerationCategory;
  operator: string;
  /** Installed capacity MW */
  installedCapacityMW: number;
  /** Haryana share MW */
  haryanaShareMW: number;
  lat: number;
  lng: number;
  /** Primary injection / connected substation */
  connectedSubstationCode: number;
  connectedSubstationName: string;
  connectedVoltage: VoltageLevel;
  /** Optional downstream distribution hop codes (132/66) */
  distributionCodes?: number[];
  notes?: string;
}

/**
 * Primary injection points — thermal, PGCIL / IGSTPP, and renewable interconnects.
 * Plant coordinates are placed near connected GIS substations (slightly offset).
 */
export const GENERATION_SOURCES: GenerationSource[] = [
  // ——— State Thermal (HPGCL) ———
  {
    id: "gen-ptps-panipat",
    name: "PTPS Panipat",
    category: "thermal",
    operator: "HPGCL",
    installedCapacityMW: 920,
    haryanaShareMW: 920,
    lat: 29.35,
    lng: 77.10,
    connectedSubstationCode: 13231,
    connectedSubstationName: "220kV PTPS Panipat",
    connectedVoltage: "220kV",
    distributionCodes: [13313],
    notes: "State thermal — 132kV / 220kV injection",
  },
  {
    id: "gen-rgtpp-khedar",
    name: "RGTPP Khedar",
    category: "thermal",
    operator: "HPGCL",
    installedCapacityMW: 1200,
    haryanaShareMW: 1200,
    lat: 29.08,
    lng: 75.61,
    connectedSubstationCode: 21127,
    connectedSubstationName: "400kV Kirori",
    connectedVoltage: "400kV",
    distributionCodes: [21121],
    notes: "400kV Kirori link into Hisar backbone",
  },
  {
    id: "gen-dcrtpp-yamunanagar",
    name: "DCRTPP Yamunanagar",
    category: "thermal",
    operator: "HPGCL",
    installedCapacityMW: 600,
    haryanaShareMW: 600,
    lat: 30.22,
    lng: 77.18,
    connectedSubstationCode: 11301,
    connectedSubstationName: "220kV Jorian",
    connectedVoltage: "220kV",
    distributionCodes: [11315],
    notes: "State thermal — Yamunanagar division",
  },

  // ——— Central / Inter-State Grid (PGCIL / IGSTPP) ———
  {
    id: "gen-igstpp-jhajjar",
    name: "IGSTPP Jhajjar",
    category: "interstate",
    operator: "PGCIL / APCPL",
    installedCapacityMW: 1500,
    haryanaShareMW: 750,
    lat: 28.32,
    lng: 76.68,
    connectedSubstationCode: 23324,
    connectedSubstationName: "400kV Dhanonda",
    connectedVoltage: "400kV",
    notes: "750 MW Haryana share — inter-state thermal",
  },
  {
    id: "gen-pgcil-dhanonda",
    name: "400kV Dhanonda",
    category: "interstate",
    operator: "PGCIL",
    installedCapacityMW: 0,
    haryanaShareMW: 0,
    lat: 28.27,
    lng: 76.73,
    connectedSubstationCode: 23324,
    connectedSubstationName: "400kV Dhanonda",
    connectedVoltage: "400kV",
    notes: "PGCIL 400kV inter-state injection node",
  },
  {
    id: "gen-pgcil-daulatabad",
    name: "400kV Daulatabad",
    category: "interstate",
    operator: "PGCIL",
    installedCapacityMW: 0,
    haryanaShareMW: 0,
    lat: 28.52,
    lng: 77.01,
    connectedSubstationCode: 23124,
    connectedSubstationName: "400kV Daulatabad",
    connectedVoltage: "400kV",
    notes: "PGCIL 400kV inter-state injection node",
  },
  {
    id: "gen-pgcil-nawada",
    name: "400kV Nawada",
    category: "interstate",
    operator: "PGCIL",
    installedCapacityMW: 0,
    haryanaShareMW: 0,
    lat: 28.41,
    lng: 77.38,
    connectedSubstationCode: 22124,
    connectedSubstationName: "400kV Nawada",
    connectedVoltage: "400kV",
    notes: "PGCIL 400kV inter-state injection node",
  },
  {
    id: "gen-pgcil-nuhiyanwali",
    name: "400kV Nuhiyanwali",
    category: "interstate",
    operator: "PGCIL",
    installedCapacityMW: 0,
    haryanaShareMW: 0,
    lat: 29.47,
    lng: 74.92,
    connectedSubstationCode: 21320,
    connectedSubstationName: "400kV Nuhiyanwali",
    connectedVoltage: "400kV",
    notes: "PGCIL 400kV inter-state injection node",
  },

  // ——— Renewable Interconnects ———
  {
    id: "gen-solar-sirsa",
    name: "Sirsa Solar Park",
    category: "renewable",
    operator: "HPGCL / IPP",
    installedCapacityMW: 250,
    haryanaShareMW: 250,
    lat: 29.47,
    lng: 75.06,
    connectedSubstationCode: 21301,
    connectedSubstationName: "220kV Sirsa",
    connectedVoltage: "220kV",
    distributionCodes: [21302],
    notes: "Renewable interconnect — Sirsa division",
  },
  {
    id: "gen-solar-bhiwani",
    name: "Bhiwani Solar Park",
    category: "renewable",
    operator: "HPGCL / IPP",
    installedCapacityMW: 180,
    haryanaShareMW: 180,
    lat: 28.72,
    lng: 76.23,
    connectedSubstationCode: 21201,
    connectedSubstationName: "220kV Bhiwani",
    connectedVoltage: "220kV",
    distributionCodes: [21202],
    notes: "Renewable interconnect — Bhiwani division",
  },
  {
    id: "gen-solar-hisar",
    name: "Hisar Solar Park",
    category: "renewable",
    operator: "HPGCL / IPP",
    installedCapacityMW: 200,
    haryanaShareMW: 200,
    lat: 29.08,
    lng: 75.65,
    connectedSubstationCode: 21103,
    connectedSubstationName: "220kV IA Hissar",
    connectedVoltage: "220kV",
    distributionCodes: [21111],
    notes: "Renewable interconnect — Hisar division",
  },
];

export interface InjectionFlowSegment {
  id: string;
  sourceId: string;
  category: GenerationCategory;
  /** Stage in Gen → Tx → Dist cascade */
  stage: "injection" | "distribution";
  from: [number, number];
  to: [number, number];
  label: string;
  mw?: number;
}

function pointForCode(code: number): [number, number] | null {
  const ss = findSubstationByCode(code);
  return ss ? [ss.lat, ss.lng] : null;
}

/** Build Gen/Inter-State → Tx → Dist animated flow segments */
export function buildInjectionFlows(
  sources: GenerationSource[] = GENERATION_SOURCES
): InjectionFlowSegment[] {
  const segments: InjectionFlowSegment[] = [];

  for (const src of sources) {
    const tx = pointForCode(src.connectedSubstationCode) ?? [src.lat, src.lng];
    const baseMw = src.haryanaShareMW || src.installedCapacityMW;
    segments.push({
      id: `${src.id}__inj`,
      sourceId: src.id,
      category: src.category,
      stage: "injection",
      from: [src.lat, src.lng],
      to: tx,
      label: `${src.name} → ${src.connectedSubstationName}`,
      mw: baseMw,
    });

    for (const code of src.distributionCodes ?? []) {
      const dist = pointForCode(code);
      if (!dist) continue;
      const distSs = findSubstationByCode(code);
      segments.push({
        id: `${src.id}__dist-${code}`,
        sourceId: src.id,
        category: src.category,
        stage: "distribution",
        from: tx,
        to: dist,
        label: `${src.connectedSubstationName} → ${distSs?.name ?? code}`,
        mw: Math.round(baseMw / ((src.distributionCodes?.length ?? 1) + 1)),
      });
    }
  }

  return segments;
}

export const INJECTION_FLOWS = buildInjectionFlows();

export function filterSourcesByGridLevel(
  level: GridLevelFilter,
  sources: GenerationSource[] = GENERATION_SOURCES
): GenerationSource[] {
  if (level === "all") return sources;
  if (level === "generating") return sources.filter((s) => s.category === "thermal");
  if (level === "interstate") return sources.filter((s) => s.category === "interstate");
  // Voltage backbone filters apply to substations, not sources — return renewables+plants lightly
  if (level === "400kv") {
    return sources.filter(
      (s) => s.connectedVoltage === "400kV" || s.category === "interstate"
    );
  }
  if (level === "220kv") {
    return sources.filter((s) => s.connectedVoltage === "220kV" || s.category === "renewable");
  }
  return sources.filter((s) => (s.distributionCodes?.length ?? 0) > 0);
}
