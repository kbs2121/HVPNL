import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type HealthStatus = "critical" | "warning" | "healthy";

export function getHealthStatus(score: number): HealthStatus {
  if (score < 60) return "critical";
  if (score < 85) return "warning";
  return "healthy";
}

export function getHealthColor(score: number): string {
  const status = getHealthStatus(score);
  if (status === "critical") return "#ef4444";
  if (status === "warning") return "#f59e0b";
  return "#10b981";
}

export function getHealthLabel(score: number): string {
  const status = getHealthStatus(score);
  if (status === "critical") return "Critical";
  if (status === "warning") return "Degraded";
  return "Optimal";
}

export function getHealthBadgeClasses(score: number): string {
  const status = getHealthStatus(score);
  if (status === "critical")
    return "bg-red-500/20 text-red-400 border-red-500/30";
  if (status === "warning")
    return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getLineColor(
  healthScore: number,
  status: string,
  hasCriticalIssue = false
): string {
  if (status === "Shutdown") return "#f97316";
  if (hasCriticalIssue || healthScore < 60) return "#ef4444";
  if (healthScore < 85) return "#f59e0b";
  return "#10b981";
}

export function lngLatToGrid(
  lng: number,
  lat: number,
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  scale = 40
): [number, number] {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng) - 0.5) * scale;
  const z = -((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat) - 0.5) * scale;
  return [x, z];
}
