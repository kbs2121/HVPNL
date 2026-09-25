"use client";

import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { BASEMAPS } from "@/lib/digitalTwin/basemaps";

export function StatusBar() {
  const { isConnected, dashboard, mouseCoords, viewState, basemapId } = useDigitalTwinStore();

  return (
    <footer className="dt-glass absolute bottom-0 left-0 right-0 z-30 flex h-8 items-center justify-between px-4 text-[10px]">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          <span className={isConnected ? "text-emerald-400" : "text-red-400"}>
            {isConnected ? "LIVE" : "OFFLINE"}
          </span>
        </span>
        <span className="text-text-muted">SCADA: Connected</span>
        <span className="text-text-muted">
          Updated: {new Date(dashboard.lastUpdate).toLocaleTimeString()}
        </span>
      </div>
      <div className="flex items-center gap-4 text-text-muted">
        {mouseCoords && (
          <span>{mouseCoords.lat.toFixed(4)}°N, {mouseCoords.lng.toFixed(4)}°E</span>
        )}
        <span>Zoom: {viewState.zoom.toFixed(1)}</span>
        <span>Pitch: {viewState.pitch.toFixed(0)}°</span>
        <span>{BASEMAPS[basemapId]?.label ?? basemapId}</span>
      </div>
    </footer>
  );
}
