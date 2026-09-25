"use client";

import { Maximize2, Minimize2, Radio, Search, Zap } from "lucide-react";
import type { VoltageLevel } from "@/lib/types/transmissionLine";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
import { cn } from "@/lib/utils";

const VOLTAGES: VoltageLevel[] = ["400kV", "220kV", "132kV", "66kV"];
const HEALTH_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "optimal", label: "Optimal (≥85%)" },
  { value: "warning", label: "Warning (60-84%)" },
  { value: "critical", label: "Critical (<60%)" },
] as const;

const ISSUE_OPTIONS = [
  { value: "all", label: "All Issues" },
  { value: "Hotspot", label: "Thermal Hotspots" },
  { value: "Vegetation", label: "Vegetation" },
  { value: "Insulator", label: "Insulator" },
  { value: "Sag", label: "Conductor Sag" },
  { value: "Tower", label: "Tower Integrity" },
] as const;

export function LineSearchBar() {
  const filters = useTransmissionLineStore((s) => s.filters);
  const setFilters = useTransmissionLineStore((s) => s.setFilters);
  const toggleVoltage = useTransmissionLineStore((s) => s.toggleVoltage);
  const isFullscreen = useTransmissionLineStore((s) => s.isFullscreen);
  const setFullscreen = useTransmissionLineStore((s) => s.setFullscreen);
  const lastSelectedLine = useTransmissionLineStore((s) => s.lastSelectedLine);
  const showLineDetailCard = useTransmissionLineStore((s) => s.showLineDetailCard);
  const showPatrolCard = useTransmissionLineStore((s) => s.showPatrolCard);
  const openLineDetail = useTransmissionLineStore((s) => s.openLineDetail);
  const togglePatrolCard = useTransmissionLineStore((s) => s.togglePatrolCard);

  return (
    <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center gap-2 px-4 py-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search Transmission Line Name (e.g., 220kV Harfali - Palwal Line)..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full rounded-lg border border-border-subtle bg-surface-800/90 py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-800/90 p-1 backdrop-blur-sm">
        {VOLTAGES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => toggleVoltage(v)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium transition-colors",
              filters.voltages.includes(v)
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <select
        value={filters.health}
        onChange={(e) =>
          setFilters({ health: e.target.value as typeof filters.health })
        }
        className="rounded-lg border border-border-subtle bg-surface-800/90 px-3 py-2 text-xs text-text-secondary backdrop-blur-sm focus:outline-none"
      >
        {HEALTH_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.issueCategory}
        onChange={(e) =>
          setFilters({
            issueCategory: e.target.value as typeof filters.issueCategory,
          })
        }
        className="rounded-lg border border-border-subtle bg-surface-800/90 px-3 py-2 text-xs text-text-secondary backdrop-blur-sm focus:outline-none"
      >
        {ISSUE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {lastSelectedLine && !showLineDetailCard && (
        <button
          type="button"
          onClick={openLineDetail}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-medium text-amber-400 backdrop-blur-sm hover:bg-amber-500/20"
        >
          <Zap className="h-3.5 w-3.5" />
          Active Line Details
        </button>
      )}

      <button
        type="button"
        onClick={togglePatrolCard}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium backdrop-blur-sm",
          showPatrolCard
            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
            : "border-border-subtle bg-surface-800/90 text-text-muted hover:bg-surface-600 hover:text-text-secondary"
        )}
      >
        <Radio className="h-3.5 w-3.5" />
        Crew Patrol
      </button>

      <button
        type="button"
        onClick={() => setFullscreen(!isFullscreen)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-800/90 px-3 text-xs text-text-secondary backdrop-blur-sm hover:bg-surface-600",
          isFullscreen && "border-cyan-500/30 text-cyan-400"
        )}
      >
        {isFullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
        Fullscreen
      </button>
    </div>
  );
}
