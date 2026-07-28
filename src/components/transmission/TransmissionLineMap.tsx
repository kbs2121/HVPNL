"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import type { TransmissionLine } from "@/lib/types/transmissionLine";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
import { useLayoutStore } from "@/hooks/useLayoutStore";
import { getLineColor } from "@/lib/utils";
import { LineSearchBar } from "@/components/transmission/LineSearchBar";
import { TransmissionLineDetailCard } from "@/components/transmission/TransmissionLineDetailCard";
import { MaintenancePatrolTracker } from "@/components/transmission/MaintenancePatrolTracker";
import { cn } from "@/lib/utils";

const HARYANA_CENTER: L.LatLngExpression = [29.0588, 76.0856];
const MAP_ZOOM = 8;

function getPolylineStyle(line: TransmissionLine, isSelected: boolean, isHovered: boolean) {
  const hasCritical =
    line.health_score < 60 || line.issues.some((i) => i.severity === "High");
  const color = getLineColor(line.health_score, line.status, hasCritical);
  const isShutdown = line.status === "Shutdown";

  return {
    color,
    weight: isSelected || isHovered ? 5 : 3,
    opacity: isShutdown ? 0.7 : 0.9,
    dashArray: isShutdown ? "10, 8" : undefined,
  };
}

function MapLegend() {
  return (
    <div className="glass-panel absolute bottom-4 left-4 z-[1000] rounded-lg px-3 py-2">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Line Status
      </p>
      <div className="flex flex-col gap-1">
        {[
          { color: "#10b981", label: "Normal (≥85%)" },
          { color: "#f59e0b", label: "Warning (60–84%)" },
          { color: "#ef4444", label: "Critical / Fault" },
          { color: "#f97316", label: "Scheduled Shutdown", dashed: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="h-1 w-4 rounded-full"
              style={{
                backgroundColor: item.dashed ? "transparent" : item.color,
                border: item.dashed ? `1px dashed ${item.color}` : "none",
              }}
            />
            <span className="text-[10px] text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransmissionLineMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, { polyline: L.Polyline; flow: L.Polyline | null }>>(
    new Map()
  );
  const markersRef = useRef<L.CircleMarker[]>([]);

  const selectedLine = useTransmissionLineStore((s) => s.selectedLine);
  const hoveredLine = useTransmissionLineStore((s) => s.hoveredLine);
  const showLineDetailCard = useTransmissionLineStore((s) => s.showLineDetailCard);
  const setSelectedLine = useTransmissionLineStore((s) => s.setSelectedLine);
  const setHoveredLine = useTransmissionLineStore((s) => s.setHoveredLine);
  const closeLineDetail = useTransmissionLineStore((s) => s.closeLineDetail);
  const getFilteredLines = useTransmissionLineStore((s) => s.getFilteredLines);
  const hierarchyFilters = useTransmissionLineStore((s) => s.hierarchyFilters);
  const filters = useTransmissionLineStore((s) => s.filters);
  const isFullscreen = useTransmissionLineStore((s) => s.isFullscreen);
  const isSidebarCollapsed = useLayoutStore((s) => s.isSidebarCollapsed);

  const lines = useMemo(
    () => getFilteredLines(),
    [getFilteredLines, hierarchyFilters, filters]
  );

  const activeLine = selectedLine && showLineDetailCard ? selectedLine : null;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: HARYANA_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.on("click", () => {
      closeLineDetail();
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current.clear();
      markersRef.current = [];
    };
  }, [closeLineDetail]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timeout = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(timeout);
  }, [isSidebarCollapsed, isFullscreen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach(({ polyline, flow }) => {
      map.removeLayer(polyline);
      if (flow) map.removeLayer(flow);
    });
    layersRef.current.clear();

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const substationSet = new Set<string>();

    lines.forEach((line) => {
      const from: L.LatLngExpression = [
        line.from_substation.lat,
        line.from_substation.lng,
      ];
      const to: L.LatLngExpression = [line.to_substation.lat, line.to_substation.lng];

      const isSelected = selectedLine?.line_id === line.line_id;
      const isHovered = hoveredLine?.line_id === line.line_id;
      const style = getPolylineStyle(line, isSelected, isHovered);
      const isShutdown = line.status === "Shutdown";

      const polyline = L.polyline([from, to], style).addTo(map);

      polyline.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedLine(line);
      });
      polyline.on("mouseover", () => {
        setHoveredLine(line);
        document.body.style.cursor = "pointer";
      });
      polyline.on("mouseout", () => {
        setHoveredLine(null);
        document.body.style.cursor = "default";
      });

      let flowLine: L.Polyline | null = null;
      if (!isShutdown) {
        flowLine = L.polyline([from, to], {
          color: "#ffffff",
          weight: 2,
          opacity: 0.35,
          dashArray: "6, 10",
        }).addTo(map);
      }

      layersRef.current.set(line.line_id, { polyline, flow: flowLine });

      for (const ss of [line.from_substation, line.to_substation]) {
        const key = `${ss.code}`;
        if (!substationSet.has(key)) {
          substationSet.add(key);
          const marker = L.circleMarker([ss.lat, ss.lng], {
            radius: 4,
            color: "#22d3ee",
            fillColor: "#334155",
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindTooltip(ss.name, { direction: "top", offset: [0, -6] })
            .addTo(map);
          markersRef.current.push(marker);
        }
      }
    });
  }, [lines, selectedLine, hoveredLine, setSelectedLine, setHoveredLine]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLine) return;

    const bounds = L.latLngBounds([
      [selectedLine.from_substation.lat, selectedLine.from_substation.lng],
      [selectedLine.to_substation.lat, selectedLine.to_substation.lng],
    ]);
    map.fitBounds(bounds.pad(0.4), { animate: true, maxZoom: 11 });
  }, [selectedLine]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-900",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      <LineSearchBar />
      <MaintenancePatrolTracker />
      <MapLegend />

      {activeLine && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-[1000] -translate-x-1/2">
          <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <TransmissionLineDetailCard line={activeLine} />
          </div>
        </div>
      )}

      <div className="relative min-h-[450px] flex-1 pt-14">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-surface-800/80 px-3 py-1.5 text-[10px] text-text-muted backdrop-blur-sm">
        Showing {lines.length} transmission corridors
      </div>
    </div>
  );
}
