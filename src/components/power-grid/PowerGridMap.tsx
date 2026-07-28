"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  SUBSTATIONS,
  TRANSMISSION_LINES,
  JURISDICTION_ZONES,
  JURISDICTION_CIRCLES,
  HARYANA_CENTER,
  DEFAULT_ZOOM,
  type Substation,
} from "@/lib/data/powerGridData";
import { createSubstationIcon, createTowerIcon } from "./icons";
import { LayerControlPanel, type LayerVisibility } from "./LayerControlPanel";
import { SubstationHoverCard } from "./SubstationHoverCard";

const DEFAULT_LAYERS: LayerVisibility = {
  electricalGrid: true,
  jurisdiction: true,
  substations: true,
};

export function PowerGridMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const gridGroupRef = useRef<L.LayerGroup | null>(null);
  const boundaryGroupRef = useRef<L.LayerGroup | null>(null);
  const substationGroupRef = useRef<L.LayerGroup | null>(null);

  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [hoveredSubstation, setHoveredSubstation] = useState<Substation | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: HARYANA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    gridGroupRef.current = L.layerGroup().addTo(map);
    boundaryGroupRef.current = L.layerGroup().addTo(map);
    substationGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      gridGroupRef.current = null;
      boundaryGroupRef.current = null;
      substationGroupRef.current = null;
    };
  }, []);

  // Build jurisdiction boundaries
  useEffect(() => {
    const group = boundaryGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!layers.jurisdiction) return;

    for (const zone of JURISDICTION_ZONES) {
      const latLngs = zone.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
      L.polygon(latLngs, {
        color: zone.color,
        weight: 2,
        opacity: 0.7,
        fillColor: zone.color,
        fillOpacity: 0.08,
        dashArray: "8, 6",
      })
        .bindTooltip(zone.name, { sticky: true, className: "power-grid-tooltip" })
        .addTo(group);
    }

    for (const circle of JURISDICTION_CIRCLES) {
      const latLngs = circle.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
      L.polygon(latLngs, {
        color: circle.color,
        weight: 1.5,
        opacity: 0.5,
        fillColor: circle.color,
        fillOpacity: 0.05,
      })
        .bindTooltip(circle.name, { sticky: true, className: "power-grid-tooltip" })
        .addTo(group);
    }
  }, [layers.jurisdiction]);

  // Build electrical grid (lines + towers)
  useEffect(() => {
    const group = gridGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!layers.electricalGrid) return;

    for (const line of TRANSMISSION_LINES) {
      const latLngs = line.path.map(([lng, lat]) => [lat, lng] as [number, number]);

      // Glow base line
      L.polyline(latLngs, {
        color: "#00f0ff",
        weight: 6,
        opacity: 0.15,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      // Animated electricity flow line
      L.polyline(latLngs, {
        color: "#00f0ff",
        weight: 3,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
        className: "electric-line",
      }).addTo(group);

      // Tower markers
      for (const tower of line.towers) {
        L.marker([tower.lat, tower.lng], { icon: createTowerIcon() }).addTo(group);
      }
    }
  }, [layers.electricalGrid]);

  // Build substation markers
  useEffect(() => {
    const group = substationGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();
    if (!layers.substations) return;

    for (const ss of SUBSTATIONS) {
      const marker = L.marker([ss.lat, ss.lng], {
        icon: createSubstationIcon(false),
      });

      marker.on("mouseover", (e) => {
        setHoveredSubstation(ss);
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
        marker.setIcon(createSubstationIcon(true));
        marker.setZIndexOffset(1000);
      });

      marker.on("mousemove", (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
      });

      marker.on("mouseout", () => {
        setHoveredSubstation(null);
        marker.setIcon(createSubstationIcon(false));
        marker.setZIndexOffset(0);
      });

      marker.addTo(group);
    }
  }, [layers.substations]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      <LayerControlPanel layers={layers} onToggle={handleToggleLayer} />

      {/* Header */}
      <div className="dt-glass pointer-events-none absolute left-4 top-4 z-[1500] rounded-2xl px-5 py-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
          Haryana Power Grid
        </p>
        <h1 className="text-lg font-bold text-white">Transmission Network GIS</h1>
        <p className="text-[11px] text-text-muted">
          {SUBSTATIONS.length} substations · {TRANSMISSION_LINES.length} corridors · Live flow
        </p>
      </div>

      {/* Legend */}
      <div className="dt-glass absolute bottom-4 left-4 z-[1500] rounded-xl px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Legend
        </p>
        <div className="space-y-1.5">
          <LegendItem color="#00f0ff" label="Transmission Line (Animated Flow)" glow />
          <LegendItem color="#fbbf24" label="Transmission Tower / Pylon" />
          <LegendItem color="#00f0ff" label="HV Substation" icon="bolt" />
          <LegendItem color="#6366f1" label="Zone Boundary" dashed />
        </div>
      </div>

      {hoveredSubstation && (
        <SubstationHoverCard substation={hoveredSubstation} x={hoverPos.x} y={hoverPos.y} />
      )}
    </div>
  );
}

function LegendItem({
  color,
  label,
  glow,
  dashed,
  icon,
}: {
  color: string;
  label: string;
  glow?: boolean;
  dashed?: boolean;
  icon?: "bolt";
}) {
  return (
    <div className="flex items-center gap-2">
      {icon === "bolt" ? (
        <svg viewBox="0 0 16 16" width="14" height="14" style={{ filter: glow ? `drop-shadow(0 0 4px ${color})` : undefined }}>
          <path d="M9 2 L6 9 H8 L7 14 L11 7 H9 Z" fill={color} />
        </svg>
      ) : (
        <div
          className="h-1 w-5 rounded-full"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            border: dashed ? `1px dashed ${color}` : "none",
            boxShadow: glow ? `0 0 6px ${color}` : undefined,
          }}
        />
      )}
      <span className="text-[10px] text-text-secondary">{label}</span>
    </div>
  );
}
