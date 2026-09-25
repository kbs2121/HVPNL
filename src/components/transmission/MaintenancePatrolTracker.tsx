"use client";

import { MapPin, Phone, Radio, X } from "lucide-react";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";

export function MaintenancePatrolTracker() {
  const showPatrolCard = useTransmissionLineStore((s) => s.showPatrolCard);
  const togglePatrolCard = useTransmissionLineStore((s) => s.togglePatrolCard);

  if (!showPatrolCard) return null;

  return (
    <div className="glass-panel absolute bottom-20 right-4 z-[1000] w-[300px] rounded-xl p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
              Live Maintenance Patrol
            </p>
            <div className="relative flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
          <h3 className="mt-0.5 text-sm font-semibold text-text-primary">
            Line Maintenance Unit: Crew-04
          </h3>
          <p className="text-[11px] text-text-muted">Location: Tower #40</p>
        </div>
        <button
          type="button"
          onClick={togglePatrolCard}
          aria-label="Dismiss patrol card"
          title="Dismiss Patrol Card"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-red-500/20 hover:text-red-400"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-3 rounded-lg bg-surface-700/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <p className="text-xs text-text-primary">
            Active Task: Thermographic Scanning & Tree Trimming
          </p>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <MapPin className="h-3 w-3 shrink-0 text-text-muted" />
          <p className="text-[10px] text-text-muted">
            220kV Harfali - Palwal Line · Tower #40–#45
          </p>
        </div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/30"
      >
        <Phone className="h-3.5 w-3.5" />
        Contact Crew Lead
      </button>
    </div>
  );
}
