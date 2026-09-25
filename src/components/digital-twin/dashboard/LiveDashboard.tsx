"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { cn } from "@/lib/utils";

function AnimatedNumber({
  value,
  highlight,
  size = "sm",
}: {
  value: number;
  highlight?: boolean;
  size?: "sm" | "base";
}) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
    return display.on("change", (v) => setText(v));
  }, [value, spring, display]);

  return (
    <span
      ref={ref}
      className={cn(
        "font-bold tabular-nums leading-none",
        size === "sm" ? "text-xs" : "text-sm",
        highlight ? "text-cyan-400" : "text-white"
      )}
    >
      {text}
    </span>
  );
}

export function LiveDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dashboard = useDigitalTwinStore((s) => s.dashboard);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="dt-glass absolute left-4 top-[4.5rem] z-20 flex h-12 items-center gap-2 rounded-2xl px-3 text-[11px] font-semibold text-white shadow-lg transition hover:bg-white/10"
        title="Expand Network Overview"
      >
        <Activity className="h-3.5 w-3.5 text-cyan-400" />
        <span>Overview</span>
        <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
      </button>
    );
  }

  const utilizationPercent =
    dashboard.totalCapacityMW > 0
      ? ((dashboard.livePowerMW / dashboard.totalCapacityMW) * 100).toFixed(1)
      : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="dt-glass absolute left-4 top-[4.5rem] z-20 flex h-12 items-center gap-2 rounded-2xl px-2.5 shadow-xl backdrop-blur-md"
    >
      {/* Title & Badge */}
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
          <Activity className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-white">
            Overview
          </span>
          <span className="block text-[8px] font-medium text-cyan-400/80">
            Haryana Grid
          </span>
        </div>
      </div>

      {/* Jurisdiction Counts (Zones, Circles) */}
      <div className="flex items-center gap-2 border-r border-white/10 px-1.5 text-center">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider text-text-muted">Zones</p>
          <AnimatedNumber value={dashboard.totalZones} />
        </div>
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider text-text-muted">Circles</p>
          <AnimatedNumber value={dashboard.totalCircles} />
        </div>
      </div>

      {/* Grid Assets (Substations, Lines) */}
      <div className="flex items-center gap-2 border-r border-white/10 px-1.5 text-center">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider text-text-muted">Subs</p>
          <AnimatedNumber value={dashboard.totalSubstations} />
        </div>
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider text-text-muted">Lines</p>
          <AnimatedNumber value={dashboard.totalLines} />
        </div>
      </div>

      {/* Asset Health Indicators */}
      <div className="flex items-center gap-1.5 border-r border-white/10 px-1.5">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider text-text-muted">Health</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400"
              title={`${dashboard.healthyAssets} Healthy Assets`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              {dashboard.healthyAssets}
            </span>
            <span
              className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400"
              title={`${dashboard.warningAssets} Warning Assets`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              {dashboard.warningAssets}
            </span>
            <span
              className="flex items-center gap-0.5 text-[10px] font-bold text-red-400"
              title={`${dashboard.criticalAssets} Critical Assets`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
              {dashboard.criticalAssets}
            </span>
          </div>
        </div>
      </div>

      {/* Details Popover Toggle & Collapse */}
      <div className="flex items-center gap-0.5 pl-0.5">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-medium transition",
            showDetails
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-text-muted hover:bg-white/10 hover:text-white"
          )}
          title="Toggle Detailed Breakdown"
        >
          <span>Details</span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-200", showDetails && "rotate-180")}
          />
        </button>

        <button
          onClick={() => setCollapsed(true)}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-white"
          title="Collapse Overview to icon"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Popover Details Panel (positioned below horizontal bar, zero overlap with other panels) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="dt-glass absolute left-0 top-[calc(100%+0.5rem)] z-30 w-72 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-2.5 flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Grid Overview Details</span>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[10px] text-text-muted hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                  Administrative Hierarchy
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Zones</p>
                    <p className="font-bold text-white">{dashboard.totalZones}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Circles</p>
                    <p className="font-bold text-white">{dashboard.totalCircles}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Divisions</p>
                    <p className="font-bold text-white">{dashboard.totalDivisions}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                  Physical Grid Assets
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Substations</p>
                    <p className="font-bold text-white">{dashboard.totalSubstations}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Lines</p>
                    <p className="font-bold text-white">{dashboard.totalLines}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <p className="text-[8px] text-text-muted">Towers</p>
                    <p className="font-bold text-white">{dashboard.totalTowers}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                  Capacity & Live Power
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2">
                    <div>
                      <p className="text-[8px] text-text-muted">Live Power</p>
                      <p className="text-xs font-bold text-cyan-400">
                        {dashboard.livePowerMW.toLocaleString()} MW
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-text-muted">Total Capacity</p>
                      <p className="text-xs font-bold text-white">
                        {dashboard.totalCapacityMW.toLocaleString()} MW
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-text-muted">Utilization</p>
                      <p className="text-xs font-bold text-purple-400">{utilizationPercent}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
