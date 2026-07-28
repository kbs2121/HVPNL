"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Layers, X } from "lucide-react";
import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { BASEMAP_LIST } from "@/lib/digitalTwin/basemaps";
import type { BasemapId } from "@/lib/digitalTwin/basemaps";
import { ThemeSelector } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function LayerControl() {
  const { layerPanelOpen, setLayerPanelOpen, basemapId, setBasemap } = useDigitalTwinStore();

  if (!layerPanelOpen) {
    return (
      <button
        onClick={() => setLayerPanelOpen(true)}
        className="dt-glass absolute right-4 top-20 z-20 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white/10"
        title="Open layer control"
      >
        <Layers className="h-5 w-5 text-cyan-400" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="dt-glass absolute right-4 top-20 z-20 flex max-h-[calc(100vh-8rem)] w-60 flex-col rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Layer Control</span>
        </div>
        <button
          onClick={() => setLayerPanelOpen(false)}
          className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5 text-text-muted" />
        </button>
      </div>

      <div className="overflow-y-auto p-2 scrollbar-thin">
        {/* Base Maps */}
        <Section title="Base Maps" defaultOpen>
          {BASEMAP_LIST.map((bm) => (
            <label
              key={bm.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] transition-colors hover:bg-white/5",
                basemapId === bm.id && "bg-cyan-500/10 text-cyan-400"
              )}
            >
              <input
                type="radio"
                name="basemap"
                checked={basemapId === bm.id}
                onChange={() => setBasemap(bm.id as BasemapId)}
                className="accent-cyan-500"
              />
              {bm.label}
            </label>
          ))}
        </Section>

        {/* Theme */}
        <Section title="Theme" defaultOpen={false}>
          <ThemeSelector />
        </Section>

        {/* Jurisdiction */}
        <LayerSection group="jurisdiction" title="Jurisdiction Layer" items={[
          { key: "zones", label: "Zones" },
          { key: "circles", label: "Circles" },
          { key: "divisions", label: "Divisions" },
        ]} />

        {/* Electrical */}
        <LayerSection group="electrical" title="Electrical Layer" items={[
          { key: "substations", label: "Substations" },
          { key: "towers", label: "Transmission Towers" },
          { key: "lines", label: "Transmission Lines" },
          { key: "powerFlow", label: "Power Flow Animation" },
          { key: "towerLabels", label: "Tower Labels" },
          { key: "substationLabels", label: "Substation Labels" },
          { key: "voltageLabels", label: "Voltage Labels" },
        ]} />

        {/* Overlays */}
        <LayerSection group="weather" title="Weather Layer" items={[
          { key: "enabled", label: "Weather Overlay" },
        ]} />
        <LayerSection group="heatMap" title="Heat Map" items={[
          { key: "enabled", label: "Load Heatmap" },
        ]} />
        <LayerSection group="assetHealth" title="Asset Health" items={[
          { key: "enabled", label: "Health Indicators" },
        ]} />
        <LayerSection group="livePowerFlow" title="Live Power Flow" items={[
          { key: "enabled", label: "Real-time Flow" },
        ]} />
        <LayerSection group="maintenanceAlerts" title="Maintenance Alerts" items={[
          { key: "enabled", label: "Due for Inspection" },
        ]} />
      </div>
    </motion.div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1.5 rounded-xl bg-white/[0.03]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-2 py-2 text-left"
      >
        {open ? <ChevronDown className="h-3 w-3 text-text-muted" /> : <ChevronRight className="h-3 w-3 text-text-muted" />}
        <span className="text-[11px] font-medium text-text-secondary">{title}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-2 pb-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LayerSection({
  group,
  title,
  items,
}: {
  group: keyof ReturnType<typeof useDigitalTwinStore.getState>["layers"];
  title: string;
  items: { key: string; label: string }[];
}) {
  const { layers, toggleLayer } = useDigitalTwinStore();
  const groupLayers = layers[group] as Record<string, boolean>;
  const [open, setOpen] = useState(true);
  const groupEnabled = groupLayers.enabled ?? true;

  return (
    <div className="mb-1.5 rounded-xl bg-white/[0.03]">
      <div className="flex items-center justify-between px-2 py-2">
        <button onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-1.5 text-left">
          {open ? <ChevronDown className="h-3 w-3 text-text-muted" /> : <ChevronRight className="h-3 w-3 text-text-muted" />}
          <span className="text-[11px] font-medium text-text-secondary">{title}</span>
        </button>
        <Toggle
          checked={groupEnabled}
          onChange={() => toggleLayer(group, "enabled")}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-2 pb-2"
          >
            {items.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[10px] transition-colors hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={groupLayers[key] ?? false}
                  onChange={() => toggleLayer(group, key)}
                  disabled={!groupEnabled}
                  className="h-3 w-3 rounded accent-cyan-500"
                />
                <span className={cn("text-text-secondary", !groupEnabled && "opacity-40")}>
                  {label}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative h-4 w-7 rounded-full transition-colors",
        checked ? "bg-cyan-500/50" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform",
          checked ? "left-3.5" : "left-0.5"
        )}
      />
    </button>
  );
}
