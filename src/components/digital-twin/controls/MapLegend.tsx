"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { VOLTAGE_HEX } from "@/lib/digitalTwin/constants";

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="dt-glass absolute bottom-8 left-4 z-20 flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg transition hover:bg-white/10"
        title="Show Voltage & Symbol Legend"
      >
        <span className="text-cyan-400">⚡</span>
        <span>Legend</span>
        <ChevronUp className="h-3.5 w-3.5 text-text-muted" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dt-glass absolute bottom-8 left-4 z-20 w-48 rounded-2xl p-3 shadow-xl backdrop-blur-md"
    >
      <div className="mb-2 flex items-center justify-between border-b border-white/5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-cyan-400">⚡</span>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white">
            Voltage Legend
          </p>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-white/10"
          title="Collapse legend"
        >
          <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
        </button>
      </div>

      <div className="space-y-1.5">
        {Object.entries(VOLTAGE_HEX).map(([v, color]) => (
          <div key={v} className="flex items-center gap-2">
            <div
              className="h-1.5 w-6 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
            />
            <span className="text-[10px] font-medium text-text-secondary">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 border-t border-white/5 pt-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Symbols
        </p>
        <div className="space-y-1 text-[10px] text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚡</span> EHV Substation
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">🗼</span> Transmission Tower
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#60a5fa]" />
            Power Flow Particle
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1 w-4 rounded bg-white/60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, white 0 3px, transparent 3px 6px)",
              }}
            />
            Rolling Dash
          </div>
        </div>
      </div>

      <div className="mt-2.5 border-t border-white/5 pt-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Health
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { color: "#10b981", label: "Healthy" },
            { color: "#f59e0b", label: "Warning" },
            { color: "#ef4444", label: "Critical" },
          ].map((h) => (
            <div key={h.label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
              <span className="text-[9px] text-text-muted">{h.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

