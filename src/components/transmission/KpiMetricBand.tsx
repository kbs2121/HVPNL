"use client";

import { Activity, AlertTriangle, Cable, Wrench } from "lucide-react";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
import { cn } from "@/lib/utils";

export function KpiMetricBand() {
  const kpi = useTransmissionLineStore((s) => s.kpi);

  const cards = [
    {
      icon: Cable,
      title: "Total Monitored Lines",
      value: `${kpi.totalLines} Corridors`,
      details: `400kV: ${kpi.voltageBreakdown["400kV"]} | 220kV: ${kpi.voltageBreakdown["220kV"]} | 132kV: ${kpi.voltageBreakdown["132kV"]} | 66kV: ${kpi.voltageBreakdown["66kV"]}`,
      accent: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Activity,
      title: "Average Line Health",
      value: `${kpi.avgHealth}%`,
      details: `${kpi.optimal} Optimal · ${kpi.degraded} Degraded · ${kpi.critical} Critical`,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: AlertTriangle,
      title: "Active Corridor Issues",
      value: `${kpi.activeIssues} Issues`,
      details: `Hotspots: ${kpi.hotspots} · Vegetation: ${kpi.vegetation} · Sag/Vibration: ${kpi.sagVibration}`,
      accent: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: Wrench,
      title: "Maintenance Work Orders",
      value: `${kpi.workOrdersInProgress} In-Progress`,
      details: `Patrol: ${kpi.patrolInspection} · Shutdown: ${kpi.shutdownRepair} · Trimming: ${kpi.vegetationTrimming}`,
      accent: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid shrink-0 grid-cols-4 gap-3 border-b border-border-subtle bg-surface-800/80 px-4 py-3">
      {cards.map((card) => (
        <div key={card.title} className="glass-panel rounded-xl px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", card.bg)}>
              <card.icon className={cn("h-3.5 w-3.5", card.accent)} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {card.title}
            </span>
          </div>
          <p className={cn("text-lg font-bold", card.accent)}>{card.value}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-text-muted">{card.details}</p>
        </div>
      ))}
    </div>
  );
}
