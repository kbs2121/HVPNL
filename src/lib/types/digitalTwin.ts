/** Core types for the Haryana Transmission Network Digital Twin */

export type VoltageLevel = "400kV" | "220kV" | "132kV" | "66kV" | "33kV";
export type HealthStatus = "Healthy" | "Warning" | "Critical" | "Fault";
export type AssetStatus = "Running" | "Standby" | "Maintenance" | "Shutdown";
export type ThemeMode = "light" | "dark" | "auto";

export interface Zone {
  id: string;
  name: string;
  code: string;
  boundary: GeoJSON.Polygon;
  color: string;
  totalSubstations: number;
  totalLoadMW: number;
}

export interface Circle {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  boundary: GeoJSON.Polygon;
  color: string;
}

export interface Division {
  id: string;
  name: string;
  circleId: string;
  circleName: string;
  zoneId: string;
  zoneName: string;
  boundary: GeoJSON.Polygon;
  color: string;
}

export interface Substation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zone: string;
  zoneId: string;
  circle: string;
  circleId: string;
  division: string;
  divisionId: string;
  voltage_level: string;
  incoming_voltage: number;
  outgoing_voltage: number;
  capacity_MVA: number;
  load_MW: number;
  health: HealthStatus;
  status: AssetStatus;
  power_received_MW: number;
  power_sent_MW: number;
  feeders_in: number;
  feeders_out: number;
  transformers: number;
  temperature_C: number;
  oil_level_pct: number;
  last_maintenance: string;
  maintenance_due: string;
}

export interface Tower {
  id: string;
  tower_number: string;
  latitude: number;
  longitude: number;
  height_m: number;
  tower_type: string;
  voltage_level: VoltageLevel;
  health: HealthStatus;
  maintenance_due: string;
  status: AssetStatus;
  line_id: string;
  line_name: string;
  sequence: number;
}

export interface TransmissionLine {
  id: string;
  name: string;
  voltage_level: VoltageLevel;
  from_substation_id: string;
  to_substation_id: string;
  from_substation: string;
  to_substation: string;
  tower_ids: string[];
  path: [number, number][];
  length_km: number;
  load_pct: number;
  health: HealthStatus;
  status: AssetStatus;
  flow_direction: "forward" | "reverse";
  flow_MW: number;
}

export interface DashboardStats {
  totalZones: number;
  totalCircles: number;
  totalDivisions: number;
  totalSubstations: number;
  totalTowers: number;
  totalLines: number;
  totalCapacityMW: number;
  livePowerMW: number;
  totalDemandMW: number;
  totalGenerationMW: number;
  systemLossesMW: number;
  avgTransformerLoading: number;
  avgLineUtilization: number;
  healthyAssets: number;
  warningAssets: number;
  criticalAssets: number;
  lastUpdate: string;
}

export interface SearchResult {
  type: "zone" | "circle" | "division" | "substation" | "tower" | "line";
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

export interface LayerVisibility {
  jurisdiction: {
    enabled: boolean;
    zones: boolean;
    circles: boolean;
    divisions: boolean;
  };
  electrical: {
    enabled: boolean;
    substations: boolean;
    towers: boolean;
    lines: boolean;
    powerFlow: boolean;
    towerLabels: boolean;
    substationLabels: boolean;
    voltageLabels: boolean;
  };
  weather: { enabled: boolean };
  heatMap: { enabled: boolean };
  assetHealth: { enabled: boolean };
  livePowerFlow: { enabled: boolean };
  maintenanceAlerts: { enabled: boolean };
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionInterpolator?: unknown;
}

export type HoverType = "substation" | "tower" | "zone" | "circle" | "division" | "line";

export interface HoverInfo {
  type: HoverType;
  object: Substation | Tower | Zone | Circle | Division | TransmissionLine;
  x: number;
  y: number;
}
