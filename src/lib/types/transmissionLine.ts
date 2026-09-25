export type VoltageLevel = "400kV" | "220kV" | "132kV" | "66kV";

export type LineStatus = "Optimal" | "Warning" | "Critical" | "Shutdown";

export type IssueType =
  | "Hotspot"
  | "Vegetation"
  | "Insulator"
  | "Sag"
  | "Tower";

export interface SubstationEndpoint {
  code: number;
  name: string;
  lat: number;
  lng: number;
}

export interface LineIssue {
  tower_no: string;
  type: IssueType;
  severity: "High" | "Medium" | "Low";
  description: string;
}

export interface TransmissionLine {
  line_id: string;
  line_name: string;
  voltage: VoltageLevel;
  from_substation: SubstationEndpoint;
  to_substation: SubstationEndpoint;
  length_km: number;
  health_score: number;
  status: LineStatus;
  load_mw: number;
  capacity_mw: number;
  tower_count: number;
  conductor_type: string;
  issues: LineIssue[];
  next_maintenance_date?: string | null;
}

export type HealthFilter = "all" | "optimal" | "warning" | "critical";
export type IssueCategoryFilter =
  | "all"
  | "Hotspot"
  | "Vegetation"
  | "Insulator"
  | "Sag"
  | "Tower";

export interface TransmissionFilters {
  search: string;
  voltages: VoltageLevel[];
  health: HealthFilter;
  issueCategory: IssueCategoryFilter;
}

export type { HierarchyFilters, DateRangeOption } from "@/lib/data/hierarchyFilters";

export interface KpiMetrics {
  totalLines: number;
  voltageBreakdown: Record<VoltageLevel, number>;
  avgHealth: number;
  optimal: number;
  degraded: number;
  critical: number;
  activeIssues: number;
  hotspots: number;
  vegetation: number;
  sagVibration: number;
  workOrdersInProgress: number;
  patrolInspection: number;
  shutdownRepair: number;
  vegetationTrimming: number;
}
