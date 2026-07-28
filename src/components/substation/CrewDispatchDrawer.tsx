"use client";

import { MapPin, Phone, Radio, X } from "lucide-react";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";

export function CrewDispatchDrawer() {
  const showCrewDrawer = useSubstationTwinStore((s) => s.showCrewDrawer);
  const crewDispatchAssetId = useSubstationTwinStore((s) => s.crewDispatchAssetId);
  const assets = useSubstationTwinStore((s) => s.assets);
  const selectedSubstation = useSubstationTwinStore((s) => s.selectedSubstation);
  const closeCrewDrawer = useSubstationTwinStore((s) => s.closeCrewDrawer);

  if (!showCrewDrawer) return null;

  const asset = assets.find((a) => a.id === crewDispatchAssetId);

  return (
    <div className="fixed inset-y-0 right-0 z-[2100] flex w-full max-w-sm flex-col border-l border-border-subtle bg-surface-800 shadow-2xl">
      <div className="flex items-start justify-between gap-2 border-b border-border-subtle p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Field Crew Dispatch
          </p>
          <h3 className="mt-0.5 text-sm font-bold text-text-primary">
            {asset?.name ?? "Asset Inspection"}
          </h3>
          <p className="text-[11px] text-text-muted">{selectedSubstation}</p>
        </div>
        <button
          type="button"
          onClick={closeCrewDrawer}
          aria-label="Close crew drawer"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-red-500/20 hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-xl border border-slate-700/50 bg-surface-700/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Nearest Available Crew
          </p>
          <p className="mt-1 text-sm font-bold text-text-primary">Crew North-02</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>ETA 18 min · 4.2 km from {selectedSubstation}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-surface-700/40 p-3">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs font-medium text-text-primary">
              Task: {asset?.status === "CRITICAL" ? "Emergency Transformer Inspection" : "Voltage / Capacitor Bank Check"}
            </p>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            Location preset: {asset?.zone ?? "Substation Yard"} · Asset {asset?.id}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Dispatch Notes
          </label>
          <textarea
            className="h-20 w-full rounded-lg border border-slate-700 bg-surface-900 p-2 text-xs text-text-primary"
            placeholder="Add dispatch instructions for field crew..."
            defaultValue={
              asset?.alarms[0]
                ? `Investigate: ${asset.alarms[0]}`
                : "Routine inspection requested from control room."
            }
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-border-subtle p-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
        >
          Confirm Crew Dispatch
        </button>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/20 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/30"
        >
          <Phone className="h-3.5 w-3.5" />
          Contact Crew Lead
        </button>
      </div>
    </div>
  );
}
