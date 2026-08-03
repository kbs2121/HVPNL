"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Zap } from "lucide-react";
import {
  SUBSTATIONS,
  TRANSMISSION_LINES,
  JURISDICTION_ZONES,
  JURISDICTION_CIRCLES,
  JURISDICTION_DIVISIONS,
  HARYANA_CENTER,
  DEFAULT_ZOOM,
  type Substation,
} from "@/lib/data/powerGridData";
import { MAP_THEMES, type MapTheme } from "@/lib/powerGrid/mapThemes";
import { createSubstationIcon, createTowerIcon } from "./icons";
import {
  LayerControlPanel,
  DEFAULT_LAYERS,
  type LayerVisibility,
} from "./LayerControlPanel";
import { SubstationHoverCard } from "./SubstationHoverCard";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";

export function PowerGridMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryGroupRef = useRef<L.LayerGroup | null>(null);
  const linesGroupRef = useRef<L.LayerGroup | null>(null);
  const towersGroupRef = useRef<L.LayerGroup | null>(null);
  const substationGroupRef = useRef<L.LayerGroup | null>(null);

  const [theme, setTheme] = useState<MapTheme>("dark");
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [hoveredSubstation, setHoveredSubstation] = useState<Substation | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const themeConfig = MAP_THEMES[theme];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: HARYANA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    const tile = L.tileLayer(MAP_THEMES.dark.tileUrl, {
      attribution: MAP_THEMES.dark.tileAttribution,
      maxZoom: 19,
      subdomains: MAP_THEMES.dark.tileSubdomains ?? "",
    }).addTo(map);

    tileLayerRef.current = tile;
    L.control.zoom({ position: "bottomright" }).addTo(map);

    boundaryGroupRef.current = L.layerGroup().addTo(map);
    linesGroupRef.current = L.layerGroup().addTo(map);
    towersGroupRef.current = L.layerGroup().addTo(map);
    substationGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      boundaryGroupRef.current = null;
      linesGroupRef.current = null;
      towersGroupRef.current = null;
      substationGroupRef.current = null;
    };
  }, []);

  // Swap basemap on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = MAP_THEMES[theme];
    const tile = L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: 19,
      ...(cfg.tileSubdomains ? { subdomains: cfg.tileSubdomains } : {}),
    }).addTo(map);

    tileLayerRef.current = tile;
  }, [theme]);

  // Jurisdiction layers
  useEffect(() => {
    const group = boundaryGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!layers.jurisdiction.enabled) return;

    if (layers.jurisdiction.zones) {
      for (const zone of JURISDICTION_ZONES) {
        const latLngs = zone.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: zone.color,
          weight: 2,
          opacity: 0.75,
          fillColor: zone.color,
          fillOpacity: theme === "light" ? 0.06 : 0.1,
          dashArray: "10, 6",
        })
          .bindTooltip(zone.name, { sticky: true, className: "power-grid-tooltip" })
          .addTo(group);
      }
    }

    if (layers.jurisdiction.circles) {
      for (const circle of JURISDICTION_CIRCLES) {
        const latLngs = circle.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: circle.color,
          weight: 1.5,
          opacity: 0.55,
          fillColor: circle.color,
          fillOpacity: theme === "light" ? 0.04 : 0.06,
        })
          .bindTooltip(circle.name, { sticky: true, className: "power-grid-tooltip" })
          .addTo(group);
      }
    }

    if (layers.jurisdiction.divisions) {
      for (const division of JURISDICTION_DIVISIONS) {
        const latLngs = division.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: division.color,
          weight: 1,
          opacity: 0.45,
          fillColor: division.color,
          fillOpacity: theme === "light" ? 0.03 : 0.05,
          dashArray: "4, 4",
        })
          .bindTooltip(division.name, { sticky: true, className: "power-grid-tooltip" })
          .addTo(group);
      }
    }
  }, [layers.jurisdiction, theme]);

  // Transmission lines
  useEffect(() => {
    const group = linesGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!layers.electrical.lines) return;

    const glow = themeConfig.lineGlow;
    const lineClass = themeConfig.lineClass;

    for (const line of TRANSMISSION_LINES) {
      const latLngs = line.path.map(([lng, lat]) => [lat, lng] as [number, number]);

      L.polyline(latLngs, {
        color: glow,
        weight: theme === "dark" || theme === "satellite" ? 7 : 5,
        opacity: theme === "light" ? 0.12 : 0.18,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(group);

      L.polyline(latLngs, {
        color: glow,
        weight: 3,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
        className: lineClass,
      }).addTo(group);
    }
  }, [layers.electrical.lines, theme, themeConfig]);

  // Towers
  useEffect(() => {
    const group = towersGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!layers.electrical.towers) return;

    for (const line of TRANSMISSION_LINES) {
      for (const tower of line.towers) {
        L.marker([tower.lat, tower.lng], { icon: createTowerIcon() }).addTo(group);
      }
    }
  }, [layers.electrical.towers]);

  // Substations
  useEffect(() => {
    const group = substationGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();
    if (!layers.electrical.substations) return;

    for (const ss of SUBSTATIONS) {
      const marker = L.marker([ss.lat, ss.lng], {
        icon: createSubstationIcon(ss, false),
      });

      marker.on("mouseover", (e) => {
        setHoveredSubstation(ss);
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
        marker.setIcon(createSubstationIcon(ss, true));
        marker.setZIndexOffset(1000);
      });

      marker.on("mousemove", (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
      });

      marker.on("mouseout", () => {
        setHoveredSubstation(null);
        marker.setIcon(createSubstationIcon(ss, false));
        marker.setZIndexOffset(0);
      });

      marker.addTo(group);
    }
  }, [layers.electrical.substations]);

  return (
    <div className={cn("relative h-full w-full", themeConfig.panelClass)}>
      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      <LayerControlPanel
        layers={layers}
        onChange={setLayers}
        themeClass={themeConfig.panelClass}
      />

      {/* Header */}
      <div className="dt-glass pointer-events-none absolute left-4 top-4 z-[1500] rounded-2xl px-5 py-3">
        <div className="pointer-events-auto mb-2 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15">
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-400">
              Haryana Power Grid
            </p>
            <h1 className="text-lg font-bold text-white">Transmission Network GIS</h1>
            <p className="text-[11px] text-text-muted">
              {SUBSTATIONS.length} substations · {TRANSMISSION_LINES.length} corridors · Live SCADA view
            </p>
          </div>
        </div>
        <div className="pointer-events-auto">
          <ThemeSwitcher theme={theme} onChange={setTheme} />
        </div>
      </div>

      {/* Legend */}
      <div className="dt-glass pointer-events-none absolute bottom-4 left-4 z-[1500] rounded-xl px-4 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Legend
        </p>
        <div className="space-y-1.5">
          <LegendItem color={themeConfig.lineGlow} label="Animated Electricity Flow" glow />
          <LegendItem color="#fbbf24" label="HV Transmission Pylon" />
          <LegendItem color="#10b981" label="Substation — Operational" ring />
          <LegendItem color="#fbbf24" label="Substation — High Load" ring />
          <LegendItem color="#6366f1" label="Zone / Circle / Division" dashed />
        </div>
      </div>

      {hoveredSubstation && (
        <SubstationHoverCard
          substation={hoveredSubstation}
          x={hoverPos.x}
          y={hoverPos.y}
          theme={theme}
        />
      )}
    </div>
  );
}

function LegendItem({
  color,
  label,
  glow,
  dashed,
  ring,
}: {
  color: string;
  label: string;
  glow?: boolean;
  dashed?: boolean;
  ring?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {ring ? (
        <div className="h-3 w-3 rounded-full border-2" style={{ borderColor: color, boxShadow: `0 0 6px ${color}` }} />
      ) : (
        <div
          className="h-1 w-5 rounded-full"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            border: dashed ? `1px dashed ${color}` : "none",
            boxShadow: glow ? `0 0 8px ${color}` : undefined,
          }}
        />
      )}
      <span className="text-[10px] text-text-secondary">{label}</span>
    </div>
  );
}
