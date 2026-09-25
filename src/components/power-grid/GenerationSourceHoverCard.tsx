"use client";

import { Factory, Sun, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { GenerationSource } from "@/data/generationSources";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

interface GenerationSourceHoverCardProps {
  source: GenerationSource;
  x: number;
  y: number;
  theme?: MapTheme;
}

export function GenerationSourceHoverCard({
  source,
  x,
  y,
  theme = "dark",
}: GenerationSourceHoverCardProps) {
  const Icon =
    source.category === "thermal" ? Factory : source.category === "renewable" ? Sun : Zap;
  const accent =
    source.category === "thermal"
      ? "text-amber-400"
      : source.category === "renewable"
        ? "text-emerald-400"
        : "text-cyan-400";
  const categoryLabel =
    source.category === "thermal"
      ? "State Thermal (HPGCL)"
      : source.category === "renewable"
        ? "Renewable Interconnect"
        : "Inter-State / PGCIL";

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
        <div className="mb-3 flex items-start gap-2.5 border-b border-white/10 pb-2.5">
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm",
              accent
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {categoryLabel}
            </p>
            <h3
              className={cn(
                "truncate text-sm font-bold text-white",
                isLight && "text-slate-900"
              )}
            >
              {source.name}
            </h3>
            <p className="text-[10px] text-slate-400">{source.operator}</p>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-2 gap-2">
            <Row label="Total Capacity" isLight={isLight}>
              <span className="font-bold text-white font-mono">
                {source.installedCapacityMW > 0
                  ? `${source.installedCapacityMW} MW`
                  : "Injection Node"}
              </span>
            </Row>
            <Row label="Haryana Allocation" isLight={isLight}>
              <span className="font-bold text-cyan-400 font-mono">
                {source.haryanaShareMW > 0 ? `${source.haryanaShareMW} MW` : "Direct Feed"}
              </span>
            </Row>
          </div>

          <Row label="Interconnection Substation" isLight={isLight}>
            <span className={cn("text-slate-300", isLight && "text-slate-700")}>
              {source.connectedSubstationName} ·{" "}
              <span className="font-semibold text-cyan-400">{source.connectedVoltage}</span>
            </span>
          </Row>

          {source.notes && (
            <Row label="Grid Protocol" isLight={isLight}>
              <span className="text-[10px] text-slate-400">{source.notes}</span>
            </Row>
          )}
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
