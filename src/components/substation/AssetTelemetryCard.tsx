"use client";

import { FileText, Wrench, X } from "lucide-react";
import type { SubstationAsset } from "@/lib/data/adhounSubstationAssets";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  CRITICAL: "text-red-400",
  WARNING: "text-amber-400",
  NORMAL: "text-emerald-400",
  MAINTENANCE: "text-cyan-400",
};

export function AssetTelemetryCard({ asset }: { asset: SubstationAsset }) {
  const setSelectedAsset = useSubstationTwinStore((s) => s.setSelectedAsset);

  return (
    <div className="glass-panel w-96 rounded-xl p-4 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-border-subtle pb-2">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{asset.name}</h3>
          <p className="mt-0.5 text-[10px] text-text-muted">
            Asset ID: {asset.id} · Zone: {asset.zone}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedAsset(null)}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-600 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs">
        Status:{" "}
        <span className={cn("font-bold", statusStyles[asset.status])}>
          {asset.status === "CRITICAL" && "⚠️ CRITICAL"}
          {asset.status === "WARNING" && "⚠️ WARNING"}
          {asset.status === "NORMAL" && "✅ NORMAL"}
        </span>
        {asset.status === "CRITICAL" && " (High Temperature)"}
        {asset.status === "WARNING" && asset.id.includes("BUS") && " (Voltage Fluctuation)"}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-text-secondary">
        {asset.telemetry.windingTemp && (
          <p>• Winding Temp: <span className="text-text-primary">{asset.telemetry.windingTemp}</span></p>
        )}
        {asset.telemetry.oilLevel && (
          <p>• Oil Level: <span className="text-text-primary">{asset.telemetry.oilLevel}</span></p>
        )}
        {asset.telemetry.currentLoad && (
          <p>• Current Load: <span className="text-text-primary">{asset.telemetry.currentLoad}</span></p>
        )}
        {asset.telemetry.dissolvedGas && (
          <p>• DGA: <span className="text-text-primary">{asset.telemetry.dissolvedGas}</span></p>
        )}
        {asset.telemetry.voltage && (
          <p>• Voltage: <span className="text-text-primary">{asset.telemetry.voltage}</span></p>
        )}
        {asset.telemetry.mvar && (
          <p>• Reactive Power: <span className="text-text-primary">{asset.telemetry.mvar}</span></p>
        )}
      </div>

      {asset.alarms.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Active Alarms
          </p>
          <ul className="space-y-1">
            {asset.alarms.map((alarm) => (
              <li key={alarm} className="text-[11px] text-amber-400">
                [⚠️] {alarm}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-[11px] font-medium text-cyan-400 hover:bg-cyan-500/30"
        >
          <FileText className="h-3.5 w-3.5" />
          View Maintenance Logs
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-2 text-[11px] font-medium text-amber-400 hover:bg-amber-500/30"
        >
          <Wrench className="h-3.5 w-3.5" />
          Dispatch Field Crew
        </button>
      </div>
    </div>
  );
}
