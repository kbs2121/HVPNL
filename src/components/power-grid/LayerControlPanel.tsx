"use client";

import { Layers } from "lucide-react";

export interface LayerVisibility {
  electricalGrid: boolean;
  jurisdiction: boolean;
  substations: boolean;
}

interface LayerControlPanelProps {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}

const LAYER_ITEMS: { key: keyof LayerVisibility; label: string; description: string }[] = [
  {
    key: "electricalGrid",
    label: "Electrical Grid Layer",
    description: "Transmission lines, flow animation & pylons",
  },
  {
    key: "jurisdiction",
    label: "Jurisdictional Boundary Layer",
    description: "Zone & circle region overlays",
  },
  {
    key: "substations",
    label: "Substation Markers Layer",
    description: "HV substation icon markers",
  },
];

export function LayerControlPanel({ layers, onToggle }: LayerControlPanelProps) {
  return (
    <div className="dt-glass absolute right-4 top-4 z-[1500] w-72 rounded-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <Layers className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-semibold text-white">Layer Control</span>
      </div>

      <div className="space-y-1 p-3">
        {LAYER_ITEMS.map(({ key, label, description }) => (
          <label
            key={key}
            className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => onToggle(key)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-cyan-400"
            />
            <div>
              <p className="text-xs font-medium text-text-primary">{label}</p>
              <p className="text-[10px] text-text-muted">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
