"use client";

import { useState } from "react";
import {
  ChevronDown,
  Layers,
  MapPin,
  CircleDot,
  Grid3X3,
  Zap,
  Sparkles,
  Factory,
  Radio,
  Cpu,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

export interface LayerVisibility {
  jurisdiction: {
    enabled: boolean;
    zones: boolean;
    circles: boolean;
    divisions: boolean;
  };
  electrical: {
    lines: boolean;
    towers: boolean;
    substations: boolean;
    /** Animated Gen → Tx → Dist flow polylines */
    flowAnimation: boolean;
    generationSources: boolean;
  };
}

export const DEFAULT_LAYERS: LayerVisibility = {
  jurisdiction: { enabled: true, zones: true, circles: false, divisions: false },
  electrical: {
    lines: true,
    towers: false,
    substations: true,
    flowAnimation: true,
    generationSources: true,
  },
};

interface LayerControlPanelProps {
  layers: LayerVisibility;
  onChange: (layers: LayerVisibility) => void;
  theme?: MapTheme;
  themeClass?: string;
}

export function LayerControlPanel({
  layers,
  onChange,
  theme = "dark",
  themeClass,
}: LayerControlPanelProps) {
  const isLight = theme === "light";
  const [open, setOpen] = useState(true);
  const [jOpen, setJOpen] = useState(true);
  const [eOpen, setEOpen] = useState(true);

  const setJurisdiction = (patch: Partial<LayerVisibility["jurisdiction"]>) => {
    onChange({ ...layers, jurisdiction: { ...layers.jurisdiction, ...patch } });
  };

  const setElectrical = (patch: Partial<LayerVisibility["electrical"]>) => {
    onChange({ ...layers, electrical: { ...layers.electrical, ...patch } });
  };

  const toggleJurisdictionMaster = () => {
    const next = !layers.jurisdiction.enabled;
    setJurisdiction({
      enabled: next,
      zones: next,
      circles: next,
      divisions: next,
    });
  };

  const jurisdictionActiveCount = [
    layers.jurisdiction.zones,
    layers.jurisdiction.circles,
    layers.jurisdiction.divisions,
  ].filter(Boolean).length;

  const electricalActiveCount = [
    layers.electrical.lines,
    layers.electrical.flowAnimation,
    layers.electrical.generationSources,
    layers.electrical.towers,
    layers.electrical.substations,
  ].filter(Boolean).length;

  return (
    <div
      className={cn(
        "w-76 shrink-0 rounded-2xl max-h-[calc(100vh-210px)] flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl transition-all duration-300",
        isLight
          ? "border border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-300/40"
          : "border border-white/10 bg-slate-900/85 text-slate-100 shadow-2xl dt-glass",
        themeClass
      )}
    >
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex w-full shrink-0 items-center justify-between px-3.5 py-2.5 transition text-left",
          isLight
            ? "border-b border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/80"
            : "border-b border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm",
              isLight
                ? "bg-cyan-100 border-cyan-300/80 text-cyan-800 shadow-cyan-500/10"
                : "bg-gradient-to-br from-cyan-500/25 to-blue-500/25 border-cyan-400/30 text-cyan-300 shadow-cyan-500/20"
            )}
          >
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-bold tracking-wide",
                  isLight ? "text-slate-900" : "text-white"
                )}
              >
                Layer Controls
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[9px] font-semibold border",
                  isLight
                    ? "bg-cyan-100 border-cyan-300 text-cyan-900"
                    : "bg-cyan-500/15 border-cyan-400/20 text-cyan-300"
                )}
              >
                {jurisdictionActiveCount + electricalActiveCount} Active
              </span>
            </div>
            <p className={cn("text-[10px]", isLight ? "text-slate-600 font-medium" : "text-slate-400")}>
              GIS overlay toggles
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className={cn(isLight ? "text-slate-500 group-hover:text-slate-900" : "text-slate-400 group-hover:text-white")}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Accordion Body with Smooth Framer Motion Transition */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5 max-h-[calc(100vh-270px)] custom-scrollbar">
              {/* Jurisdiction Section */}
              <div
                className={cn(
                  "rounded-xl border p-2 transition",
                  isLight
                    ? "border-slate-200/90 bg-slate-50/70 hover:border-slate-300"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                )}
              >
                <button
                  type="button"
                  onClick={() => setJOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-left py-1 px-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      className={cn("h-3.5 w-3.5", isLight ? "text-sky-700" : "text-cyan-400")}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isLight ? "text-sky-900" : "text-cyan-300"
                      )}
                    >
                      Jurisdiction
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono",
                        isLight ? "text-slate-600" : "text-slate-400"
                      )}
                    >
                      ({jurisdictionActiveCount}/3)
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: jOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className={isLight ? "text-slate-500" : "text-slate-400"}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {jOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden pt-1.5 space-y-1"
                    >
                      <SwitchRow
                        label="Master Boundary Layer"
                        icon={
                          <Shield
                            className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400")}
                          />
                        }
                        checked={layers.jurisdiction.enabled}
                        onChange={toggleJurisdictionMaster}
                        bold
                        accent="cyan"
                        isLight={isLight}
                      />
                      <div
                        className={cn(
                          "ml-2 space-y-0.5 border-l pl-2",
                          isLight ? "border-slate-200" : "border-white/10"
                        )}
                      >
                        <SwitchRow
                          label="Show Zones (2)"
                          icon={
                            <MapPin
                              className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400/80")}
                            />
                          }
                          checked={layers.jurisdiction.zones}
                          onChange={() =>
                            setJurisdiction({ zones: !layers.jurisdiction.zones, enabled: true })
                          }
                          accent="cyan"
                          isLight={isLight}
                        />
                        <SwitchRow
                          label="Show Circles (6)"
                          icon={
                            <CircleDot
                              className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400/80")}
                            />
                          }
                          checked={layers.jurisdiction.circles}
                          onChange={() =>
                            setJurisdiction({ circles: !layers.jurisdiction.circles, enabled: true })
                          }
                          accent="cyan"
                          isLight={isLight}
                        />
                        <SwitchRow
                          label="Show Divisions (14)"
                          icon={
                            <Grid3X3
                              className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400/80")}
                            />
                          }
                          checked={layers.jurisdiction.divisions}
                          onChange={() =>
                            setJurisdiction({
                              divisions: !layers.jurisdiction.divisions,
                              enabled: true,
                            })
                          }
                          accent="cyan"
                          isLight={isLight}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Electrical Grid Section */}
              <div
                className={cn(
                  "rounded-xl border p-2 transition",
                  isLight
                    ? "border-slate-200/90 bg-slate-50/70 hover:border-slate-300"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                )}
              >
                <button
                  type="button"
                  onClick={() => setEOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-left py-1 px-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Zap
                      className={cn("h-3.5 w-3.5", isLight ? "text-amber-700" : "text-amber-400")}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isLight ? "text-amber-900" : "text-amber-300"
                      )}
                    >
                      Electrical Grid
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono",
                        isLight ? "text-slate-600" : "text-slate-400"
                      )}
                    >
                      ({electricalActiveCount}/5)
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: eOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className={isLight ? "text-slate-500" : "text-slate-400"}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {eOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden pt-1.5 space-y-0.5"
                    >
                      <SwitchRow
                        label="Transmission Lines"
                        icon={
                          <Zap
                            className={cn("h-3 w-3", isLight ? "text-rose-700" : "text-rose-400")}
                          />
                        }
                        checked={layers.electrical.lines}
                        onChange={() => setElectrical({ lines: !layers.electrical.lines })}
                        accent="amber"
                        isLight={isLight}
                      />
                      <SwitchRow
                        label="Live Flow Pulses (Gen → Tx)"
                        icon={
                          <Sparkles
                            className={cn("h-3 w-3", isLight ? "text-amber-700" : "text-amber-400")}
                          />
                        }
                        checked={layers.electrical.flowAnimation}
                        onChange={() =>
                          setElectrical({ flowAnimation: !layers.electrical.flowAnimation })
                        }
                        accent="amber"
                        isLight={isLight}
                      />
                      <SwitchRow
                        label="Generation Sources (11)"
                        icon={
                          <Factory
                            className={cn("h-3 w-3", isLight ? "text-emerald-700" : "text-emerald-400")}
                          />
                        }
                        checked={layers.electrical.generationSources}
                        onChange={() =>
                          setElectrical({
                            generationSources: !layers.electrical.generationSources,
                          })
                        }
                        accent="amber"
                        isLight={isLight}
                      />
                      <SwitchRow
                        label="Towers / Pylons"
                        icon={
                          <Radio
                            className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400")}
                          />
                        }
                        checked={layers.electrical.towers}
                        onChange={() => setElectrical({ towers: !layers.electrical.towers })}
                        accent="cyan"
                        isLight={isLight}
                      />
                      <SwitchRow
                        label="Substations (97)"
                        icon={
                          <Cpu
                            className={cn("h-3 w-3", isLight ? "text-sky-700" : "text-cyan-400")}
                          />
                        }
                        checked={layers.electrical.substations}
                        onChange={() =>
                          setElectrical({ substations: !layers.electrical.substations })
                        }
                        accent="amber"
                        isLight={isLight}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Apple-style glassy switch row with smooth spring knob */
function SwitchRow({
  label,
  icon,
  checked,
  onChange,
  bold,
  accent = "cyan",
  isLight = false,
}: {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: () => void;
  bold?: boolean;
  accent?: "cyan" | "amber";
  isLight?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-all text-left",
        isLight
          ? checked
            ? "bg-slate-200/70 hover:bg-slate-200/95"
            : "hover:bg-slate-100 opacity-85 hover:opacity-100"
          : checked
          ? "bg-white/[0.06] hover:bg-white/[0.09]"
          : "hover:bg-white/[0.03] opacity-70 hover:opacity-100"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span
          className={cn(
            "truncate text-[11px] transition-colors",
            isLight
              ? bold
                ? "font-bold text-slate-900"
                : "font-semibold text-slate-800 group-hover:text-slate-950"
              : bold
              ? "font-semibold text-white"
              : "text-slate-200 group-hover:text-white"
          )}
        >
          {label}
        </span>
      </div>

      {/* iOS-Style Pill Switch */}
      <div
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ease-in-out p-0.5",
          checked
            ? accent === "amber"
              ? isLight
                ? "bg-amber-600 shadow-sm shadow-amber-600/30"
                : "bg-amber-500 shadow-sm shadow-amber-500/40"
              : isLight
              ? "bg-sky-600 shadow-sm shadow-sky-600/30"
              : "bg-cyan-500 shadow-sm shadow-cyan-500/40"
            : isLight
            ? "bg-slate-300"
            : "bg-slate-700/70"
        )}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 600, damping: 35 }}
          className="h-3 w-3 rounded-full bg-white shadow-sm"
          style={{ marginLeft: checked ? "auto" : "0" }}
        />
      </div>
    </button>
  );
}
