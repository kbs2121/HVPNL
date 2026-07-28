export type AssetStatus = "CRITICAL" | "WARNING" | "NORMAL" | "MAINTENANCE";
export type IncidentStatus = "Open" | "In Progress" | "Under Inspection" | "Resolved";
export type AlertState = "Active" | "Acknowledged";

export type AssetZone =
  | "132kV High-Voltage Bay"
  | "Transformer Yard"
  | "33kV Distribution Yard"
  | "Capacitor Bank Yard";

export interface MaintenanceLog {
  date: string;
  title: string;
  outcome: string;
  loggedBy: string;
}

export interface TelemetryPoint {
  time: string;
  value: number;
}

export interface SubstationAsset {
  id: string;
  name: string;
  zone: AssetZone;
  status: AssetStatus;
  x: string;
  y: string;
  tooltip: string;
  measuredValue?: string;
  nominalValue?: string;
  telemetry: {
    windingTemp?: string;
    oilLevel?: string;
    currentLoad?: string;
    dissolvedGas?: string;
    voltage?: string;
    mvar?: string;
  };
  telemetrySparkline?: TelemetryPoint[];
  maintenanceLogs: MaintenanceLog[];
  alarms: string[];
}

function buildSparkline(base: number, drift: number): TelemetryPoint[] {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${(11 - i) * 5}m`,
    value: Math.round((base + (i / 11) * drift) * 10) / 10,
  }));
}

const STANDARD_LOGS: MaintenanceLog[] = [
  {
    date: "12-Jul-2026",
    title: "Annual Bushing & Insulation Test",
    outcome: "Passed",
    loggedBy: "Er. A. Sharma (AE)",
  },
  {
    date: "04-Mar-2026",
    title: "Contact Resistance & Thermography Scan",
    outcome: "Completed",
    loggedBy: "Crew North-02",
  },
  {
    date: "18-Nov-2025",
    title: "Contact Cleaning & Torque Check",
    outcome: "Completed",
    loggedBy: "Er. R. Kumar (JE)",
  },
];

const ROUTINE_LOGS: MaintenanceLog[] = [
  {
    date: "22-May-2026",
    title: "Routine Visual Inspection",
    outcome: "Normal",
    loggedBy: "Shift Operator",
  },
];

export const ADHOUN_ASSETS: SubstationAsset[] = [
  {
    id: "TR-132-01",
    name: "40/50 MVA Main Transformer T-1",
    zone: "Transformer Yard",
    status: "CRITICAL",
    x: "43.5%",
    y: "52%",
    tooltip: "⚠️ Critical: Winding Temp 89°C (Threshold 85°C)",
    measuredValue: "89.2°C",
    nominalValue: "85.0°C max",
    telemetry: {
      windingTemp: "89.2°C (High)",
      oilLevel: "94% (Normal)",
      currentLoad: "42.8 MVA (85.6%)",
      dissolvedGas: "Normal",
    },
    telemetrySparkline: buildSparkline(82, 7.2),
    maintenanceLogs: STANDARD_LOGS,
    alarms: ["Winding temperature exceeded Stage-1 alarm setpoint (85°C)"],
  },
  {
    id: "TR-132-02",
    name: "33/0.4kV Station Transformer T-2",
    zone: "Transformer Yard",
    status: "NORMAL",
    x: "50.2%",
    y: "48%",
    tooltip: "✅ Normal: Auxiliary supply stable",
    measuredValue: "54.0°C",
    nominalValue: "75.0°C max",
    telemetry: {
      windingTemp: "54.0°C (Normal)",
      oilLevel: "91% (Normal)",
      currentLoad: "2.4 MVA (48%)",
      dissolvedGas: "Normal",
    },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "BUS-132-01",
    name: "132kV Bus-1 Bar",
    zone: "132kV High-Voltage Bay",
    status: "WARNING",
    x: "38%",
    y: "32%",
    tooltip: "⚡ Warning: Voltage drop detected (128.4 kV)",
    measuredValue: "128.4 kV",
    nominalValue: "131.2 kV",
    telemetry: {
      voltage: "128.4 kV",
      currentLoad: "131.2 kV nominal",
    },
    telemetrySparkline: buildSparkline(131.8, -3.4),
    maintenanceLogs: STANDARD_LOGS,
    alarms: ["Voltage fluctuation below nominal threshold"],
  },
  {
    id: "BUS-132-02",
    name: "132kV Bus-2",
    zone: "132kV High-Voltage Bay",
    status: "NORMAL",
    x: "58%",
    y: "26%",
    tooltip: "✅ Normal: Bus energised at 132.1 kV",
    measuredValue: "132.1 kV",
    nominalValue: "132.0 kV",
    telemetry: { voltage: "132.1 kV" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "ISO-01",
    name: "Line Isolators",
    zone: "132kV High-Voltage Bay",
    status: "NORMAL",
    x: "48%",
    y: "22%",
    tooltip: "✅ Normal: Closed & Operational",
    telemetry: { currentLoad: "Closed" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "ES-01",
    name: "Earth Switches",
    zone: "132kV High-Voltage Bay",
    status: "NORMAL",
    x: "68%",
    y: "24%",
    tooltip: "✅ Normal: Open position verified",
    telemetry: {},
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "LA-01",
    name: "Lightning Arresters (LA)",
    zone: "132kV High-Voltage Bay",
    status: "NORMAL",
    x: "28%",
    y: "24%",
    tooltip: "✅ Normal: Surge protection active",
    telemetry: {},
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "BUS-33",
    name: "33kV Main Bus",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "45%",
    y: "72%",
    tooltip: "✅ Normal: 33.2 kV stable",
    measuredValue: "33.2 kV",
    nominalValue: "33.0 kV",
    telemetry: { voltage: "33.2 kV" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "FD-ABHOUN",
    name: "Feeder Breaker — Abhoun",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "30%",
    y: "78%",
    tooltip: "✅ Normal: 18.4 MW load",
    telemetry: { currentLoad: "18.4 MW" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "FD-DHURALA",
    name: "Feeder Breaker — Dhurala",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "38%",
    y: "82%",
    tooltip: "✅ Normal: 12.1 MW load",
    telemetry: { currentLoad: "12.1 MW" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "FD-SOODHPUR",
    name: "Feeder Breaker — Soodhpur",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "52%",
    y: "82%",
    tooltip: "✅ Normal: 9.6 MW load",
    telemetry: { currentLoad: "9.6 MW" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "FD-JHANSA",
    name: "Feeder Breaker — Jhansa Road",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "62%",
    y: "78%",
    tooltip: "✅ Normal: 7.2 MW load",
    telemetry: { currentLoad: "7.2 MW" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "FD-SIRSALA",
    name: "Feeder Breaker — Sirsala",
    zone: "33kV Distribution Yard",
    status: "NORMAL",
    x: "72%",
    y: "74%",
    tooltip: "✅ Normal: 5.8 MW load",
    telemetry: { currentLoad: "5.8 MW" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
  {
    id: "CAP-02",
    name: "Capacitor Bank 2 (7.2 MVAR)",
    zone: "Capacitor Bank Yard",
    status: "WARNING",
    x: "66.5%",
    y: "76%",
    tooltip: "⚠️ Maintenance Needed: Reactive power drop",
    measuredValue: "5.8 MVAR",
    nominalValue: "7.2 MVAR",
    telemetry: { mvar: "5.8 MVAR (81% rated)" },
    telemetrySparkline: buildSparkline(7.0, -1.2),
    maintenanceLogs: STANDARD_LOGS,
    alarms: ["Reactive power dip detected — inspection scheduled"],
  },
  {
    id: "CAP-04",
    name: "Capacitor Bank 4 (7.2 MVAR)",
    zone: "Capacitor Bank Yard",
    status: "NORMAL",
    x: "59%",
    y: "82%",
    tooltip: "✅ Normal: 7.2 MVAR in service",
    measuredValue: "7.2 MVAR",
    nominalValue: "7.2 MVAR",
    telemetry: { mvar: "7.2 MVAR" },
    maintenanceLogs: ROUTINE_LOGS,
    alarms: [],
  },
];

export const DEFAULT_SUBSTATION = "132kV Adhoun";

export const OFFICER_OPTIONS = [
  { value: "", label: "Select Officer..." },
  { value: "JE_Palwal", label: "Er. Rajesh Kumar (JE Palwal)" },
  { value: "AE_Faridabad", label: "Er. Vikas Singh (AE Faridabad)" },
  { value: "SHIFT_OP", label: "Shift Operator — Control Room" },
  { value: "AE_Kurukshetra", label: "Er. A. Sharma (AE Kurukshetra)" },
];
