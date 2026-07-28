"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity } from "lucide-react";
import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value, highlight }: { value: number; highlight?: boolean }) {
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
        "text-lg font-bold tabular-nums",
        highlight ? "text-cyan-400" : "text-white"
      )}
    >
      {text}
    </span>
  );
}

export function LiveDashboard() {
  const dashboard = useDigitalTwinStore((s) => s.dashboard);

  const metrics = [
    { label: "Zones", value: dashboard.totalZones },
    { label: "Circles", value: dashboard.totalCircles },
    { label: "Divisions", value: dashboard.totalDivisions },
    { label: "Substations", value: dashboard.totalSubstations },
    { label: "Towers", value: dashboard.totalTowers },
    { label: "Lines", value: dashboard.totalLines },
    { label: "Total MW", value: dashboard.totalCapacityMW },
    { label: "Live Power", value: dashboard.livePowerMW, highlight: true },
    { label: "Healthy", value: dashboard.healthyAssets, color: "text-emerald-400" },
    { label: "Warning", value: dashboard.warningAssets, color: "text-amber-400" },
    { label: "Critical", value: dashboard.criticalAssets, color: "text-red-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="dt-glass absolute left-4 top-[4.5rem] z-20 w-52 rounded-2xl p-3"
    >
      <div className="mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4 text-cyan-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Network Overview
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "rounded-xl p-2 transition-all hover:bg-white/5",
              m.highlight && "col-span-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
            )}
          >
            <p className="text-[9px] text-text-muted">{m.label}</p>
            <AnimatedNumber value={m.value} highlight={m.highlight} />
            {m.highlight && (
              <span className="ml-1 text-[10px] font-normal text-text-muted">MW</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
