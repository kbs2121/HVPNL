"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsSnapshot } from "@/lib/data/analyticsCompliance";
import type { AnalyticsThemeMode, AnalyticsUiTokens } from "@/lib/analytics/analyticsUiTheme";
import { cn } from "@/lib/utils";

interface HealthDecayChartProps {
  decaySeries: AnalyticsSnapshot["decaySeries"];
  theme: AnalyticsThemeMode;
  ui: AnalyticsUiTokens;
}

export function HealthDecayChart({ decaySeries, theme, ui }: HealthDecayChartProps) {
  const onTrackColor = theme === "dark" ? "#22d3ee" : "#0284c7";
  const ifMissedColor = theme === "dark" ? "#f87171" : "#dc2626";

  return (
    <div className={cn("flex flex-col rounded-xl p-4 border", ui.card)}>
      <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0" }}>
        <div>
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", ui.text)}>
            Asset Health Decay Curve (Deferred PM Risk)
          </h3>
          <p className={cn("text-[10px] mt-0.5", ui.muted)}>
            8-week projection: On-track maintenance vs accelerated decay if overdue backlog persists
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: onTrackColor }} />
            <span className={ui.textSecondary}>On Track (88%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ifMissedColor }} />
            <span className={ui.textSecondary}>If Missed (61%)</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={decaySeries} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={ui.chartGrid}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: ui.chartText, fontSize: 10 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
            />
            <YAxis
              domain={[50, 100]}
              ticks={[50, 60, 70, 80, 90, 100]}
              tick={{ fill: ui.chartText, fontSize: 10 }}
              axisLine={{ stroke: ui.chartGrid }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const pt = payload[0].payload;
                const gap = Math.round((pt.onTrack - pt.ifMissed) * 10) / 10;
                return (
                  <div className={ui.chartTooltip}>
                    <p className="text-[11px] font-bold text-cyan-400">{pt.week} Health Projection</p>
                    <div className="mt-1 space-y-0.5 text-xs">
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">On Track:</span>
                        <strong className="text-cyan-400">{pt.onTrack}%</strong>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-400">If Missed:</span>
                        <strong className="text-red-400">{pt.ifMissed}%</strong>
                      </p>
                    </div>
                    <p className="mt-1.5 border-t border-white/10 pt-1 text-[9px] text-amber-400">
                      Degradation gap: −{gap} health pts
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="onTrack"
              stroke={onTrackColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: onTrackColor }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="ifMissed"
              stroke={ifMissedColor}
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: ifMissedColor }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
