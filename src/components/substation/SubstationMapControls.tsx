"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useSubstationTwinStore, useAssetCounts } from "@/hooks/useSubstationTwinStore";
import { cn } from "@/lib/utils";

export function SubstationMapControls() {
  const viewMode = useSubstationTwinStore((s) => s.viewMode);
  const setViewMode = useSubstationTwinStore((s) => s.setViewMode);
  const isFullscreen = useSubstationTwinStore((s) => s.isFullscreen);
  const setFullscreen = useSubstationTwinStore((s) => s.setFullscreen);
  const focusWarnings = useSubstationTwinStore((s) => s.focusWarnings);
  const resetMapView = useSubstationTwinStore((s) => s.resetMapView);
  const counts = useAssetCounts();

  return (
    <div className="absolute right-4 top-4 z-[1000] flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-end gap-2">
      <div className="flex rounded-full border border-border-subtle bg-surface-800/95 p-0.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setViewMode("3d")}
          className={cn(
            "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
            viewMode === "3d"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          3D Isometric View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("sld")}
          className={cn(
            "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
            viewMode === "sld"
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Single Line Diagram (SLD)
        </button>
      </div>

      <button
        type="button"
        onClick={focusWarnings}
        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-400 backdrop-blur-sm hover:bg-amber-500/20"
      >
        🎯 Focus Warnings ({counts.activeWarnings})
      </button>

      <button
        type="button"
        onClick={resetMapView}
        className="rounded-full border border-border-subtle bg-surface-800/95 px-3 py-1.5 text-[10px] font-semibold text-text-secondary backdrop-blur-sm hover:bg-surface-600"
      >
        🌐 Full View
      </button>

      <button
        type="button"
        onClick={() => setFullscreen(!isFullscreen)}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-800/95 text-text-secondary backdrop-blur-sm hover:bg-surface-600"
      >
        {isFullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
