"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SafMetrics } from "@/lib/data/analyticsCompliance";
import type { AnalyticsThemeMode, AnalyticsUiTokens } from "@/lib/analytics/analyticsUiTheme";
import { cn } from "@/lib/utils";

interface SafTrendChartProps {
  saf: SafMetrics;
  theme: AnalyticsThemeMode;
  ui: AnalyticsUiTokens;
}

export function SafTrendChart({ saf, theme, ui }: SafTrendChartProps) {
  const isBreach = saf.currentPct < saf.normativeTarget;
  const data = saf.safTrend;

  const strokeColor = isBreach
    ? theme === "dark" ? "#f87171" : "#dc2626"
    : theme === "dark" ? "#22d3ee" : "#0284c7";

  const fillColor = isBreach
    ? theme === "dark" ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.12)"
    : theme === "dark" ? "rgba(34, 211, 238, 0.15)" : "rgba(2, 132, 199, 0.12)";

  return (
    <div className={cn("flex flex-col rounded-xl p-4 border", ui.card)}>
      <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
        <div>
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", ui.text)}>
            SAF 6-Month Trajectory vs Regulatory Normative
          </h3>
          <p className={cn("text-[10px] mt-0.5", ui.muted)}>
            Monthly weighted grid availability against HERC 98.0% floor & 99.2% bonus
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: strokeColor }} />
            <span className={ui.textSecondary}>Actual SAF</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-amber-500 rounded" />
            <span className={ui.muted}>98% Floor</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-emerald-500 rounded" />
            <span className={ui.muted}>99.2% Bonus</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="safGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={ui.chartGrid}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: ui.chartText, fontSize: 10 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
            />
            <YAxis
              domain={[96, 100]}
              ticks={[96, 97, 98, 99, 100]}
              tick={{ fill: ui.chartText, fontSize: 10 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0].payload;
                const delta = Math.round((pt.actual - saf.normativeTarget) * 100) / 100;
                return (
                  <div className={ui.chartTooltip}>
                    <p className="text-[11px] font-bold text-cyan-400">{pt.month} Availability</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">
                      {pt.actual}%{" "}
                      <span className={cn("text-[10px] font-semibold", delta >= 0 ? "text-emerald-400" : "text-red-400")}>
                        ({delta >= 0 ? `+${delta}%` : `${delta}%`} vs 98%)
                      </span>
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">
                      Target: {saf.normativeTarget}% · Bonus: {saf.incentiveTarget}%
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={saf.normativeTarget}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={saf.incentiveTarget}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#safGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
