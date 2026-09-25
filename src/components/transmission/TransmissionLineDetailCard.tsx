"use client";

import {
  ArrowUpRight,
  FileText,
  Leaf,
  Minimize2,
  Thermometer,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { TransmissionLine } from "@/lib/types/transmissionLine";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
import { cn, formatDate, getHealthBadgeClasses, getHealthLabel } from "@/lib/utils";

interface TransmissionLineDetailCardProps {
  line: TransmissionLine;
}

const issueIcons: Record<string, typeof Thermometer> = {
  Hotspot: Thermometer,
  Vegetation: Leaf,
  Insulator: Wrench,
  Sag: Wrench,
  Tower: Wrench,
};

export function TransmissionLineDetailCard({ line }: TransmissionLineDetailCardProps) {
  const isMinimized = useTransmissionLineStore((s) => s.isLineCardMinimized);
  const closeLineDetail = useTransmissionLineStore((s) => s.closeLineDetail);
  const toggleLineCardMinimized = useTransmissionLineStore((s) => s.toggleLineCardMinimized);

  const loadPct = Math.round((line.load_mw / line.capacity_mw) * 100);
  const healthPct = line.health_score;

  if (isMinimized) {
    return (
      <div className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 shadow-2xl">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        <span className="max-w-[220px] truncate text-xs font-medium text-text-primary">
          {line.line_name}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            getHealthBadgeClasses(line.health_score)
          )}
        >
          {line.health_score}%
        </span>
        <button
          type="button"
          onClick={toggleLineCardMinimized}
          className="rounded-lg px-2 py-1 text-[10px] font-medium text-cyan-400 hover:bg-cyan-500/20"
        >
          Expand
        </button>
        <button
          type="button"
          onClick={closeLineDetail}
          aria-label="Close card"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:bg-surface-600 hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel w-[420px] rounded-xl p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-text-primary">
            {line.line_name}
          </h3>
          <p className="mt-1 text-[10px] text-text-muted">
            Corridor ID: {line.line_id} · Length: {line.length_km} km · Towers:{" "}
            {line.tower_count}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
            title="View details"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleLineCardMinimized}
            aria-label="Minimize card"
            title="Minimize"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-600 hover:text-text-primary"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={closeLineDetail}
            aria-label="Close card"
            title="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-red-500/20 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-surface-700/50 p-3">
        <div>
          <p className="text-[10px] text-text-muted">Health Score</p>
          <span
            className={cn(
              "mt-0.5 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold",
              getHealthBadgeClasses(line.health_score)
            )}
          >
            {line.health_score}% ({getHealthLabel(line.health_score)})
          </span>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-600">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Live Load</p>
          <p className="text-sm font-bold text-text-primary">
            {line.load_mw} MW{" "}
            <span className="text-xs font-normal text-text-muted">({loadPct}% Cap)</span>
          </p>
          <p className="mt-1 text-[10px] text-text-muted">
            Conductor: {line.conductor_type}
          </p>
        </div>
      </div>

      {line.issues.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Active Issues ({line.issues.length} Reported)
          </p>
          <ul className="space-y-1.5">
            {line.issues.map((issue, i) => {
              const Icon = issueIcons[issue.type] ?? Wrench;
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-surface-700/40 px-3 py-2 text-[11px]"
                >
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-medium text-amber-400">
                      [{issue.severity === "High" ? "⚠️ Warning" : "🌿 Notice"}]
                    </span>{" "}
                    <span className="text-text-secondary">{issue.type}</span> at{" "}
                    <span className="text-text-primary">{issue.tower_no}</span>
                    <p className="mt-0.5 text-text-muted">{issue.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {line.next_maintenance_date && (
        <p className="mb-3 text-[11px] text-text-muted">
          Maintenance Status: Scheduled Shutdown for{" "}
          <span className="text-amber-400">{formatDate(line.next_maintenance_date)}</span>
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-[11px] font-medium text-amber-400 hover:bg-amber-500/30"
        >
          <Wrench className="h-3.5 w-3.5" />
          Issue Work Order
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-[11px] font-medium text-cyan-400 hover:bg-cyan-500/30"
        >
          <FileText className="h-3.5 w-3.5" />
          View Drone Thermal Report
        </button>
      </div>
    </div>
  );
}
