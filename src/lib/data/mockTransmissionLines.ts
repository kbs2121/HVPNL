import type {
  TransmissionLine,
  TransmissionFilters,
  VoltageLevel,
  KpiMetrics,
} from "@/lib/types/transmissionLine";
import transmissionLinesData from "@/lib/data/transmissionLines.json";

export const transmissionLines = transmissionLinesData as TransmissionLine[];

export function computeKpiMetrics(lines: TransmissionLine[]): KpiMetrics {
  const voltageBreakdown: Record<VoltageLevel, number> = {
    "400kV": 0,
    "220kV": 0,
    "132kV": 0,
    "66kV": 0,
  };

  let totalHealth = 0;
  let optimal = 0;
  let degraded = 0;
  let critical = 0;
  let hotspots = 0;
  let vegetation = 0;
  let sagVibration = 0;

  for (const line of lines) {
    voltageBreakdown[line.voltage]++;
    totalHealth += line.health_score;
    if (line.health_score >= 85) optimal++;
    else if (line.health_score >= 60) degraded++;
    else critical++;

    for (const issue of line.issues) {
      if (issue.type === "Hotspot") hotspots++;
      if (issue.type === "Vegetation") vegetation++;
      if (issue.type === "Sag") sagVibration++;
    }
  }

  const scheduledLines = lines.filter((l) => l.next_maintenance_date);

  return {
    totalLines: lines.length,
    voltageBreakdown,
    avgHealth: Math.round((totalHealth / lines.length) * 10) / 10,
    optimal,
    degraded,
    critical,
    activeIssues: hotspots + vegetation + sagVibration,
    hotspots,
    vegetation,
    sagVibration,
    workOrdersInProgress: 18,
    patrolInspection: 10,
    shutdownRepair: 5,
    vegetationTrimming: 3,
  };
}

export const kpiMetrics = computeKpiMetrics(transmissionLines);

export const scheduledMaintenance = transmissionLines
  .filter((l) => l.next_maintenance_date)
  .slice(0, 6)
  .map((l) => ({
    line_name: l.line_name,
    date: l.next_maintenance_date!,
    time: "08:00 AM",
  }));

export const featuredLine =
  transmissionLines.find((l) => l.line_id === "TL-220-042") ?? transmissionLines[0];
