"use client";

import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";
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
  };
}

export const DEFAULT_LAYERS: LayerVisibility = {
  jurisdiction: { enabled: true, zones: true, circles: true, divisions: true },
  electrical: { lines: true, towers: true, substations: true },
};

interface LayerControlPanelProps {
  layers: LayerVisibility;
  onChange: (layers: LayerVisibility) => void;
  themeClass?: string;
}

export function LayerControlPanel({ layers, onChange, themeClass }: LayerControlPanelProps) {
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

  return (
    <div className={cn("dt-glass absolute right-4 top-[6.5rem] z-[1500] w-72 rounded-2xl", themeClass)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Layer Control</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
      </button>

      {open && (
        <div className="space-y-2 p-3">
          {/* Jurisdiction */}
          <section>
            <button
              type="button"
              onClick={() => setJOpen((v) => !v)}
              className="mb-1 flex w-full items-center gap-2 text-left"
            >
              {jOpen ? <ChevronDown className="h-3 w-3 text-cyan-400" /> : <ChevronRight className="h-3 w-3 text-cyan-400" />}
              <span className="text-xs font-semibold text-cyan-300">Jurisdiction Layer</span>
            </button>
            {jOpen && (
              <div className="ml-1 space-y-0.5 border-l border-white/10 pl-3">
                <CheckRow
                  label="Show Jurisdiction Layer"
                  checked={layers.jurisdiction.enabled}
                  onChange={toggleJurisdictionMaster}
                  bold
                />
                <CheckRow
                  label="Show Zones"
                  checked={layers.jurisdiction.zones}
                  onChange={() => setJurisdiction({ zones: !layers.jurisdiction.zones, enabled: true })}
                  indent
                />
                <CheckRow
                  label="Show Circles"
                  checked={layers.jurisdiction.circles}
                  onChange={() => setJurisdiction({ circles: !layers.jurisdiction.circles, enabled: true })}
                  indent
                />
                <CheckRow
                  label="Show Divisions"
                  checked={layers.jurisdiction.divisions}
                  onChange={() => setJurisdiction({ divisions: !layers.jurisdiction.divisions, enabled: true })}
                  indent
                />
              </div>
            )}
          </section>

          {/* Electrical */}
          <section>
            <button
              type="button"
              onClick={() => setEOpen((v) => !v)}
              className="mb-1 flex w-full items-center gap-2 text-left"
            >
              {eOpen ? <ChevronDown className="h-3 w-3 text-amber-400" /> : <ChevronRight className="h-3 w-3 text-amber-400" />}
              <span className="text-xs font-semibold text-amber-300">Electrical Grid</span>
            </button>
            {eOpen && (
              <div className="ml-1 space-y-0.5 border-l border-white/10 pl-3">
                <CheckRow
                  label="Electrical Grid Lines"
                  checked={layers.electrical.lines}
                  onChange={() => setElectrical({ lines: !layers.electrical.lines })}
                />
                <CheckRow
                  label="Towers / Pylons"
                  checked={layers.electrical.towers}
                  onChange={() => setElectrical({ towers: !layers.electrical.towers })}
                />
                <CheckRow
                  label="Substations"
                  checked={layers.electrical.substations}
                  onChange={() => setElectrical({ substations: !layers.electrical.substations })}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  indent,
  bold,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  indent?: boolean;
  bold?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5",
        indent && "ml-2"
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="h-3.5 w-3.5 accent-cyan-400" />
      <span className={cn("text-[11px] text-text-primary", bold && "font-medium")}>{label}</span>
    </label>
  );
}
