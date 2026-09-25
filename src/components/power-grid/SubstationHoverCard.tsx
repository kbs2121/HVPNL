"use client";

import { motion } from "framer-motion";
import type { Substation } from "@/lib/data/powerGridData";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

interface SubstationHoverCardProps {
  substation: Substation;
  x: number;
  y: number;
  theme?: MapTheme;
}

export function SubstationHoverCard({
  substation,
  x,
  y,
  theme = "dark",
}: SubstationHoverCardProps) {
  const statusColor =
    substation.status === "Overload Alert"
      ? "text-red-400 font-semibold"
      : substation.status === "Active"
        ? substation.loadPct >= 85
          ? "text-amber-400 font-semibold"
          : "text-emerald-400 font-semibold"
        : substation.status === "Maintenance"
          ? "text-amber-400"
          : "text-slate-400";

  const zoneLabel = substation.zone.includes("—")
    ? substation.zone.split("—")[0].trim()
    : substation.zone;

  const isLight = theme === "light";

  return (
    <div
      className="pointer-events-none absolute z-[2000] w-84 -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y - 16 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "dt-glass relative rounded-2xl p-4 shadow-2xl border border-white/15 backdrop-blur-2xl transition-all",
          theme === "light" &&
            "border-slate-300/80 bg-white/95 text-slate-900 shadow-xl shadow-slate-900/10",
          theme === "satellite" && "border-cyan-500/35 bg-[rgba(8,12,24,0.92)] shadow-cyan-500/20"
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                {substation.voltage} Substation
              </p>
            </div>
            <h3
              className={cn(
                "text-sm font-bold text-white",
                isLight && "text-slate-900"
              )}
            >
              {substation.name}
            </h3>
            <p className="text-[10px] text-slate-400">{substation.location}</p>
          </div>
          <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-bold">
            {substation.code}
          </span>
        </div>

        {/* Telemetry rows */}
        <div className="space-y-2 text-[11px]">
          <Row label="Hierarchy Route" isLight={isLight}>
            <span className={cn("text-slate-300", isLight && "text-slate-700")}>
              {zoneLabel} ➔ {substation.circle} ➔ {substation.division}
            </span>
          </Row>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Incoming Power" isLight={isLight}>
              <span className="font-bold text-cyan-400 font-mono">
                {substation.incomingPower}
              </span>
            </Row>
            <Row label="Transformation" isLight={isLight}>
              <span className={cn("text-slate-300", isLight && "text-slate-700")}>
                {substation.voltageTransform}
              </span>
            </Row>
          </div>

          {/* Dynamic Capacity Gauge Bar */}
          <div className="pt-1.5 border-t border-white/10">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Real-Time Load</span>
              <span className={statusColor}>
                {substation.status} · {substation.loadPct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  substation.loadPct >= 85
                    ? "bg-red-500 shadow-sm shadow-red-500/80"
                    : substation.loadPct >= 70
                      ? "bg-amber-400 shadow-sm shadow-amber-400/80"
                      : "bg-cyan-400 shadow-sm shadow-cyan-400/80"
                )}
                style={{ width: `${Math.min(100, substation.loadPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pointer Arrow */}
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-surface-900/90",
            isLight && "bg-white border-slate-300"
          )}
        />
      </motion.div>
    </div>
  );
}

function Row({
  label,
  children,
  isLight,
}: {
  label: string;
  children: React.ReactNode;
  isLight: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400",
          isLight && "text-slate-500"
        )}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
