export type VoltageLevel = "400kV" | "220kV" | "66kV";

export interface Substation {
  id: string;
  name: string;
  circle: string;
  region: string;
  zone: string;
  voltage: VoltageLevel;
  healthScore: number;
  activeAlarms: number;
  lastMaintenance: string;
  gridX: number;
  gridZ: number;
}

export interface HealthTrendPoint {
  period: string;
  score: number;
}
