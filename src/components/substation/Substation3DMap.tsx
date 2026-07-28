"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { SubstationAsset } from "@/lib/data/adhounSubstationAssets";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";
import { SubstationMapControls } from "@/components/substation/SubstationMapControls";
import { cn } from "@/lib/utils";

const SUBSTATION_BG = "/assets/substation-3d-adhoun.jpg";

function statusRingClass(status: SubstationAsset["status"], muted: boolean) {
  if (muted) return "border-slate-500 bg-slate-500/20 shadow-none";
  if (status === "CRITICAL")
    return "border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.6)]";
  if (status === "WARNING")
    return "border-amber-500 bg-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.5)]";
  return "border-emerald-500 bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
}

function pulseClass(status: SubstationAsset["status"]) {
  if (status === "CRITICAL") return "bg-red-500";
  if (status === "WARNING") return "bg-amber-500";
  return "bg-emerald-500";
}

function dotClass(status: SubstationAsset["status"]) {
  if (status === "CRITICAL") return "bg-red-500";
  if (status === "WARNING") return "bg-amber-500";
  return "bg-emerald-500";
}

function badgeClass(status: SubstationAsset["status"]) {
  if (status === "CRITICAL") return "bg-red-500/20 text-red-400";
  if (status === "WARNING") return "bg-amber-500/20 text-amber-400";
  return "bg-emerald-500/20 text-emerald-400";
}

function SingleLineDiagram() {
  return (
    <svg viewBox="0 0 900 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <rect width="900" height="500" fill="#0f172a" />
      <text x="450" y="30" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="600">
        132kV Adhoun — Single Line Diagram (SLD)
      </text>
      <line x1="100" y1="80" x2="800" y2="80" stroke="#f59e0b" strokeWidth="4" />
      <text x="100" y="70" fill="#f59e0b" fontSize="10">
        132kV Bus-1
      </text>
      <line x1="100" y1="120" x2="800" y2="120" stroke="#10b981" strokeWidth="4" />
      <text x="100" y="140" fill="#10b981" fontSize="10">
        132kV Bus-2
      </text>
      <circle cx="450" cy="220" r="40" fill="none" stroke="#ef4444" strokeWidth="3" />
      <text x="450" y="225" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
        T-1
      </text>
      <line x1="450" y1="80" x2="450" y2="180" stroke="#94a3b8" strokeWidth="2" />
      <line x1="450" y1="260" x2="450" y2="320" stroke="#94a3b8" strokeWidth="2" />
      <line x1="150" y1="320" x2="750" y2="320" stroke="#22d3ee" strokeWidth="3" />
      <text x="150" y="340" fill="#22d3ee" fontSize="10">
        33kV Main Bus
      </text>
      {["Abhoun", "Dhurala", "Soodhpur", "Jhansa Rd", "Sirsala"].map((f, i) => (
        <g key={f}>
          <line
            x1={200 + i * 120}
            y1="320"
            x2={200 + i * 120}
            y2="400"
            stroke="#64748b"
            strokeWidth="2"
          />
          <rect x={185 + i * 120} y="400" width="30" height="20" fill="#1e293b" stroke="#475569" />
          <text x={200 + i * 120} y="440" textAnchor="middle" fill="#64748b" fontSize="9">
            {f}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PhotorealisticTwin({ assets }: { assets: SubstationAsset[] }) {
  const setSelectedAsset = useSubstationTwinStore((s) => s.setSelectedAsset);
  const setHoveredAsset = useSubstationTwinStore((s) => s.setHoveredAsset);
  const selectedAsset = useSubstationTwinStore((s) => s.selectedAsset);
  const acknowledgedAlerts = useSubstationTwinStore((s) => s.acknowledgedAlerts);
  const mapTransform = useSubstationTwinStore((s) => s.mapTransform);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative aspect-[16/9] w-full max-w-[1400px] transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${mapTransform.scale}) translate(${mapTransform.x}%, ${mapTransform.y}%)`,
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
          <Image
            src={SUBSTATION_BG}
            alt="132kV Adhoun Substation GIS Map"
            fill
            priority
            className="pointer-events-none select-none object-cover"
            sizes="(max-width: 1400px) 100vw, 1400px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/40 via-transparent to-[#0B0F19]/20" />

          {assets.map((asset) => {
            const isAcknowledged = acknowledgedAlerts[asset.id] === "Acknowledged";
            const isWarning =
              !isAcknowledged &&
              (asset.status === "CRITICAL" || asset.status === "WARNING");

            return (
              <button
                key={asset.id}
                type="button"
                style={{ left: asset.x, top: asset.y }}
                onClick={() => setSelectedAsset(asset)}
                onMouseEnter={() => setHoveredAsset(asset)}
                onMouseLeave={() => setHoveredAsset(null)}
                className={cn(
                  "group absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer",
                  selectedAsset?.id === asset.id && "z-20"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-125",
                    statusRingClass(asset.status, isAcknowledged),
                    isWarning && asset.status === "CRITICAL" && "animate-pulse-red",
                    isWarning && asset.status === "WARNING" && "animate-pulse",
                    selectedAsset?.id === asset.id && "scale-125 ring-2 ring-cyan-400"
                  )}
                >
                  {isWarning && (
                    <span
                      className={cn(
                        "absolute h-full w-full rounded-full opacity-75 animate-ping",
                        pulseClass(asset.status)
                      )}
                    />
                  )}
                  <span
                    className={cn("relative h-3 w-3 rounded-full shadow-lg", dotClass(asset.status))}
                  />
                </div>

                <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center whitespace-nowrap group-hover:flex">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-xs text-white shadow-xl">
                    <span className="font-semibold">
                      {asset.id}: {asset.name}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
                        badgeClass(asset.status)
                      )}
                    >
                      {asset.measuredValue ??
                        asset.telemetry.windingTemp ??
                        asset.telemetry.voltage ??
                        asset.telemetry.mvar ??
                        asset.status}
                    </span>
                  </div>
                  <div className="-mt-1 h-2 w-2 rotate-45 border-b border-r border-slate-700 bg-slate-900" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Substation3DMap() {
  const viewMode = useSubstationTwinStore((s) => s.viewMode);
  const hoveredAsset = useSubstationTwinStore((s) => s.hoveredAsset);
  const selectedAsset = useSubstationTwinStore((s) => s.selectedAsset);
  const isFullscreen = useSubstationTwinStore((s) => s.isFullscreen);
  const assets = useSubstationTwinStore((s) => s.assets);
  const selectedSubstation = useSubstationTwinStore((s) => s.selectedSubstation);

  const filteredAssets = useMemo(() => assets, [assets]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0B0F19]",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      <SubstationMapControls />

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3">
        {viewMode === "3d" ? (
          <PhotorealisticTwin assets={filteredAssets} />
        ) : (
          <div className="h-full w-full max-w-[1200px]">
            <SingleLineDiagram />
          </div>
        )}
      </div>

      {hoveredAsset && !selectedAsset && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs text-white shadow-xl">
          <span className="font-semibold">{hoveredAsset.name}</span>
          <span className="ml-2 text-slate-400">— click for details</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-surface-800/80 px-3 py-1.5 text-[10px] text-text-muted backdrop-blur-sm">
        {selectedSubstation} · {filteredAssets.length} assets · Photorealistic 3D Twin
      </div>
    </div>
  );
}
