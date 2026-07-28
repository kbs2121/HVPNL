import type { VoltageLevel } from "@/lib/types/digitalTwin";

/** Voltage colour palette — industry-standard EHV/HV coding */
export const VOLTAGE_COLORS: Record<VoltageLevel, [number, number, number]> = {
  "400kV": [239, 68, 68],
  "220kV": [249, 115, 22],
  "132kV": [59, 130, 246],
  "66kV": [34, 197, 94],
  "33kV": [6, 182, 212],
};

export const VOLTAGE_HEX: Record<VoltageLevel, string> = {
  "400kV": "#ef4444",
  "220kV": "#f97316",
  "132kV": "#3b82f6",
  "66kV": "#22c55e",
  "33kV": "#06b6d4",
};

/** Line width (px) by voltage level */
export const VOLTAGE_WIDTH: Record<VoltageLevel, number> = {
  "400kV": 5,
  "220kV": 4,
  "132kV": 3,
  "66kV": 2.5,
  "33kV": 2,
};

/** Particle speed multiplier by voltage */
export const VOLTAGE_FLOW_SPEED: Record<VoltageLevel, number> = {
  "400kV": 0.0012,
  "220kV": 0.0009,
  "132kV": 0.0006,
  "66kV": 0.0004,
  "33kV": 0.00025,
};

export const HEALTH_COLORS = {
  Healthy: [16, 185, 129] as [number, number, number],
  Warning: [245, 158, 11] as [number, number, number],
  Critical: [239, 68, 68] as [number, number, number],
  Fault: [220, 38, 38] as [number, number, number],
};

export const HEALTH_HEX = {
  Healthy: "#10b981",
  Warning: "#f59e0b",
  Critical: "#ef4444",
  Fault: "#dc2626",
};

export const HARYANA_VIEW = {
  longitude: 76.5,
  latitude: 29.1,
  zoom: 7.8,
  pitch: 50,
  bearing: -15,
};

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
export const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
