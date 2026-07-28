"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currentHealthScore, healthScoreDelta, healthTrendData } from "@/lib/data/healthTrend";
import { usePortfolioStats } from "@/hooks/useSubstationStore";

const SEGMENTS = 20;

function HealthScoreCard() {
  const filled = Math.round((currentHealthScore / 100) * SEGMENTS);
  return (
    <div className="glass-panel flex min-w-0 flex-1 items-center gap-4 rounded-xl px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Substation Health Score
        </p>
        <p className="mt-0.5 text-xl font-bold text-emerald-400">
          {currentHealthScore}% <span className="text-sm text-text-secondary">Healthy</span>
        </p>
      </div>
      <div className="flex h-14 shrink-0 items-end gap-0.5">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-sm"
            style={{
              height: `${30 + (i / SEGMENTS) * 70}%`,
              backgroundColor:
                i < filled
                  ? i < 7
                    ? "#ef4444"
                    : i < 14
                      ? "#f59e0b"
                      : "#10b981"
                  : "rgba(30,41,59,0.8)",
              opacity: i < filled ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TrendCard() {
  return (
    <div className="glass-panel min-w-0 flex-1 rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Health Score Trend
      </p>
      <div className="mt-1 h-[52px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={healthTrendData}>
            <defs>
              <linearGradient id="subHealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="period" hide />
            <YAxis domain={[70, 100]} hide />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#subHealthGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-emerald-400">
        {currentHealthScore}% (+{healthScoreDelta}% vs prior period)
      </p>
    </div>
  );
}

function PortfolioCard() {
  const { total, critical, warning, healthy } = usePortfolioStats();
  const data = [
    { name: "Critical", value: critical, color: "#ef4444" },
    { name: "Warning", value: warning, color: "#f59e0b" },
    { name: "Healthy", value: healthy, color: "#10b981" },
  ];

  return (
    <div className="glass-panel flex min-w-0 flex-1 items-center gap-3 rounded-xl px-4 py-3">
      <div className="relative h-14 w-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={22}
              outerRadius={34}
              dataKey="value"
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-lg font-bold leading-none">{total}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Portfolio Overview
        </p>
        <p className="mt-0.5 text-sm font-bold text-text-primary">{total} Substations</p>
        <p className="text-[10px] text-text-muted">
          {healthy} Healthy · {warning} Warning · {critical} Critical
        </p>
      </div>
    </div>
  );
}

export function SubstationKpiBand() {
  return (
    <div className="grid shrink-0 grid-cols-1 gap-3 border-b border-border-subtle bg-surface-800/80 px-4 py-3 lg:grid-cols-3">
      <HealthScoreCard />
      <TrendCard />
      <PortfolioCard />
    </div>
  );
}
