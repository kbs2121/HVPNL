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
  lastUpdate: string;
}

export interface SearchResult {
  type: string;
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}
