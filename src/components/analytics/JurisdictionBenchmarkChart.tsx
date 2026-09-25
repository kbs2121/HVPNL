"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HierarchyBucket } from "@/lib/data/analyticsCompliance";
import type { AnalyticsThemeMode, AnalyticsUiTokens } from "@/lib/analytics/analyticsUiTheme";
import { formatINRLakhs } from "@/lib/data/analyticsCompliance";
import { cn } from "@/lib/utils";

interface JurisdictionBenchmarkChartProps {
  byCircle: HierarchyBucket[];
  byZone: HierarchyBucket[];
  theme: AnalyticsThemeMode;
  ui: AnalyticsUiTokens;
}

function cleanBucketLabel(b: HierarchyBucket, view: "circle" | "zone"): string {
  if (view === "zone") {
    return b.zone.includes("Zone") ? b.zone : `${b.zone} Zone`;
  }
  if (b.circle) {
    return b.circle.replace(/^TS\s+/i, "");
  }
  const parts = b.key.split(">");
  const last = parts[parts.length - 1].trim();
  return last.replace(/^TS\s+/i, "");
}

export function JurisdictionBenchmarkChart({
  byCircle,
  byZone,
  theme,
  ui,
}: JurisdictionBenchmarkChartProps) {
  const [view, setView] = useState<"circle" | "zone">("circle");

  const rawData = view === "circle" ? byCircle : byZone;
  // Format items with clean labels and sort descending by compliance %
  const data = rawData
    .map((b) => ({
      ...b,
      label: cleanBucketLabel(b, view),
    }))
    .sort((a, b) => b.compliancePct - a.compliancePct);

  return (
    <div className={cn("flex flex-col rounded-xl p-4 border", ui.card)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
        <div>
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", ui.text)}>
            Jurisdiction Compliance & Risk Benchmark
          </h3>
          <p className={cn("text-[10px] mt-0.5", ui.muted)}>
            Ranking of administrative units by maintenance compliance % & overdue exposure
          </p>
        </div>

        {/* Toggle between Circle and Zone */}
        <div className={cn("flex items-center rounded-lg p-0.5 border text-[10px]", ui.tabsContainer)}>
          <button
            type="button"
            onClick={() => setView("circle")}
            className={cn(
              "rounded-md px-2.5 py-1 font-semibold transition-all",
              view === "circle" ? ui.tabActive : ui.tabInactive
            )}
          >
            By Circle ({byCircle.length})
          </button>
          <button
            type="button"
            onClick={() => setView("zone")}
            className={cn(
              "rounded-md px-2.5 py-1 font-semibold transition-all",
              view === "zone" ? ui.tabActive : ui.tabInactive
            )}
          >
            By Zone ({byZone.length})
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 30, left: 10, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={ui.chartGrid} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 90, 100]}
              tick={{ fill: ui.chartText, fontSize: 10 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: ui.textSecondary, fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const b = payload[0].payload as HierarchyBucket & { label: string };
                return (
                  <div className={ui.chartTooltip}>
                    <p className="text-xs font-bold text-cyan-400">{b.label} {view === "circle" ? "Circle" : ""}</p>
                    <div className="mt-1.5 space-y-1 text-xs">
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Compliance Rate:</span>
                        <strong className={b.compliancePct >= 80 ? "text-emerald-400" : "text-amber-400"}>
                          {b.compliancePct}%
                        </strong>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Substations:</span>
                        <span className="font-semibold">{b.substations} GSS</span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">Overdue Maintenance:</span>
                        <strong className={b.overdueCount > 0 ? "text-red-400" : "text-emerald-400"}>
                          {b.overdueCount} items
                        </strong>
                      </p>
                      <p className="flex justify-between gap-4 border-t border-white/10 pt-1">
                        <span className="text-slate-400">Financial Exposure:</span>
                        <strong className="text-amber-400">{formatINRLakhs(b.fineExposureINR)}</strong>
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine x={80} stroke="#10b981" strokeDasharray="3 3" />
            <Bar dataKey="compliancePct" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => {
                const color =
                  entry.compliancePct >= 80
                    ? theme === "dark" ? "#10b981" : "#059669"
                    : entry.compliancePct >= 60
                    ? theme === "dark" ? "#f59e0b" : "#d97706"
                    : theme === "dark" ? "#ef4444" : "#dc2626";
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className={cn("mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px]", theme === "dark" ? "border-white/5" : "border-slate-200")}>
        <div className="rounded-lg bg-black/10 dark:bg-white/[0.02] p-2 text-center">
          <p className={cn("text-[9px] uppercase tracking-wider", ui.muted)}>Top Performer</p>
          <p className={cn("font-bold text-emerald-500", ui.textSecondary)}>
            {data[0]?.label ?? "—"} ({data[0]?.compliancePct ?? 0}%)
          </p>
        </div>
        <div className="rounded-lg bg-black/10 dark:bg-white/[0.02] p-2 text-center">
          <p className={cn("text-[9px] uppercase tracking-wider", ui.muted)}>Highest Backlog</p>
          <p className={cn("font-bold text-red-500", ui.textSecondary)}>
            {[...data].sort((a, b) => b.overdueCount - a.overdueCount)[0]?.label ?? "—"}
          </p>
        </div>
        <div className="rounded-lg bg-black/10 dark:bg-white/[0.02] p-2 text-center">
          <p className={cn("text-[9px] uppercase tracking-wider", ui.muted)}>Fleet Capacity</p>
          <p className={cn("font-bold", ui.textSecondary)}>
            {data.reduce((s, b) => s + b.substations, 0)} GSS
          </p>
        </div>
        <div className="rounded-lg bg-black/10 dark:bg-white/[0.02] p-2 text-center">
          <p className={cn("text-[9px] uppercase tracking-wider", ui.muted)}>Jurisdiction Units</p>
          <p className={cn("font-bold", ui.textSecondary)}>
            {data.length} {view === "circle" ? "Circles" : "Zones"}
          </p>
        </div>
      </div>
    </div>
  );
}
