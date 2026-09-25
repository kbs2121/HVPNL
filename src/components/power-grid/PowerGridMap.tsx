"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { ChevronDown, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEFAULT_GIS_FILTERS,
  GisFilterBar,
  getVisibleGenerationSources,
  getVisibleSubstations,
  type GisFilters,
} from "@/components/GisFilterBar";
import {
  SUBSTATIONS,
  TRANSMISSION_LINES,
  JURISDICTION_ZONES,
  JURISDICTION_CIRCLES,
  JURISDICTION_DIVISIONS,
  findSubstationByCode,
  type Substation,
} from "@/lib/data/powerGridData";
import { substationGisHref } from "@/lib/data/substationNavigation";
import { INJECTION_FLOWS, type GenerationSource } from "@/data/generationSources";
import { MAP_THEMES, type MapTheme } from "@/lib/powerGrid/mapThemes";
import {
  REGION_CENTER,
  REGION_DEFAULT_ZOOM,
  getRegionBounds,
  regionMapOptions,
} from "@/lib/powerGrid/regionBounds";
import {
  createSubstationIcon,
  createTowerIcon,
  createGenerationSourceIcon,
  injectionFlowColor,
} from "./icons";
import {
  LayerControlPanel,
  DEFAULT_LAYERS,
  type LayerVisibility,
} from "./LayerControlPanel";
import { SubstationHoverCard } from "./SubstationHoverCard";
import { GenerationSourceHoverCard } from "./GenerationSourceHoverCard";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";

const VOLTAGE_LINE_CONFIG_DARK: Record<
  string,
  { color: string; weight: number; glowWeight: number }
> = {
  "400kV": {
    color: "#ff1744", // Ultra-bright neon crimson red
    weight: 3.6,
    glowWeight: 9,
  },
  "220kV": {
    color: "#00e5ff", // Ultra-bright neon cyan
    weight: 2.8,
    glowWeight: 7,
  },
  "132kV": {
    color: "#ffb703", // Vivid electric gold amber
    weight: 2.2,
    glowWeight: 5.5,
  },
  "66kV": {
    color: "#00e676", // Vivid electric emerald
    weight: 1.8,
    glowWeight: 4.5,
  },
};

const VOLTAGE_LINE_CONFIG_LIGHT: Record<
  string,
  { color: string; weight: number; glowWeight: number }
> = {
  "400kV": {
    color: "#dc2626", // Deep rich crimson red
    weight: 3.4,
    glowWeight: 7,
  },
  "220kV": {
    color: "#0284c7", // Deep rich vibrant azure
    weight: 2.8,
    glowWeight: 6,
  },
  "132kV": {
    color: "#d97706", // Rich dark amber
    weight: 2.2,
    glowWeight: 5,
  },
  "66kV": {
    color: "#059669", // Rich deep emerald
    weight: 1.8,
    glowWeight: 4,
  },
};

export function PowerGridMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryGroupRef = useRef<L.LayerGroup | null>(null);
  const linesGroupRef = useRef<L.LayerGroup | null>(null);
  const flowGroupRef = useRef<L.LayerGroup | null>(null);
  const towersGroupRef = useRef<L.LayerGroup | null>(null);
  const substationGroupRef = useRef<L.LayerGroup | null>(null);
  const sourcesGroupRef = useRef<L.LayerGroup | null>(null);
  const routerRef = useRef(router);
  routerRef.current = router;

  const [theme, setTheme] = useState<MapTheme>("dark");
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [filters, setFilters] = useState<GisFilters>(DEFAULT_GIS_FILTERS);
  const [hoveredSubstation, setHoveredSubstation] = useState<Substation | null>(null);
  const [hoveredSource, setHoveredSource] = useState<GenerationSource | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeaderSlot(document.getElementById("header-right-slot"));
  }, []);

  const themeConfig = MAP_THEMES[theme];
  const visibleSubstations = useMemo(() => getVisibleSubstations(filters), [filters]);
  const visibleSources = useMemo(() => getVisibleGenerationSources(filters), [filters]);
  const visibleIds = useMemo(
    () => new Set(visibleSubstations.map((s) => s.id)),
    [visibleSubstations]
  );
  const visibleSourceIds = useMemo(
    () => new Set(visibleSources.map((s) => s.id)),
    [visibleSources]
  );

  const visibleLines = useMemo(() => {
    if (filters.substationCode !== "All" && visibleSubstations.length === 1) {
      const targetId = visibleSubstations[0].id;
      return TRANSMISSION_LINES.filter(
        (line) => line.fromId === targetId || line.toId === targetId
      );
    }
    return TRANSMISSION_LINES.filter(
      (line) => visibleIds.has(line.fromId) && visibleIds.has(line.toId)
    );
  }, [filters.substationCode, visibleSubstations, visibleIds]);

  const visibleFlows = useMemo(
    () => INJECTION_FLOWS.filter((f) => visibleSourceIds.has(f.sourceId)),
    [visibleSourceIds]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: REGION_CENTER,
      zoom: REGION_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
      ...regionMapOptions(),
    });

    const tile = L.tileLayer(MAP_THEMES.dark.tileUrl, {
      attribution: MAP_THEMES.dark.tileAttribution,
      maxZoom: 18,
      subdomains: MAP_THEMES.dark.tileSubdomains ?? "",
    }).addTo(map);

    tileLayerRef.current = tile;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.setMaxBounds(getRegionBounds(0.15));

    boundaryGroupRef.current = L.layerGroup().addTo(map);
    linesGroupRef.current = L.layerGroup().addTo(map);
    flowGroupRef.current = L.layerGroup().addTo(map);
    towersGroupRef.current = L.layerGroup();
    substationGroupRef.current = L.layerGroup().addTo(map);
    sourcesGroupRef.current = L.layerGroup().addTo(map);

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
      flowGroupRef.current = null;
      towersGroupRef.current = null;
      substationGroupRef.current = null;
      sourcesGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = MAP_THEMES[theme];
    const tile = L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: 18,
      ...(cfg.tileSubdomains ? { subdomains: cfg.tileSubdomains } : {}),
    }).addTo(map);

    tileLayerRef.current = tile;
  }, [theme]);

  const isInitialMountRef = useRef(true);

  // Fit bounds when region / source filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (
      filters.zone === "All" &&
      filters.circle === "All" &&
      filters.division === "All" &&
      filters.substationCode === "All" &&
      filters.gridLevel === "all"
    ) {
      map.setView(REGION_CENTER, REGION_DEFAULT_ZOOM, { animate: true });
      return;
    }

    if (filters.substationCode !== "All" && visibleSubstations.length === 1) {
      const ss = visibleSubstations[0];
      map.flyTo([ss.lat, ss.lng], 12, { duration: 0.8 });
      return;
    }

    const points: [number, number][] = [
      ...visibleSubstations.map((s) => [s.lat, s.lng] as [number, number]),
      ...visibleSources.map((s) => [s.lat, s.lng] as [number, number]),
    ];
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds.pad(0.18), { animate: true, maxZoom: 11 });
  }, [
    filters.zone,
    filters.circle,
    filters.division,
    filters.substationCode,
    filters.gridLevel,
    visibleSubstations,
    visibleSources,
  ]);

  // Synchronize layer group visibility instantaneously without rebuilding DOM
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncLayer = (group: L.LayerGroup | null, visible: boolean) => {
      if (!group) return;
      const isAdded = map.hasLayer(group);
      if (visible && !isAdded) {
        map.addLayer(group);
      } else if (!visible && isAdded) {
        map.removeLayer(group);
      }
    };

    syncLayer(boundaryGroupRef.current, layers.jurisdiction.enabled);
    syncLayer(linesGroupRef.current, layers.electrical.lines);
    syncLayer(flowGroupRef.current, layers.electrical.lines && layers.electrical.flowAnimation);
    syncLayer(towersGroupRef.current, layers.electrical.towers);
    syncLayer(substationGroupRef.current, layers.electrical.substations);
    syncLayer(sourcesGroupRef.current, layers.electrical.generationSources);
  }, [
    layers.jurisdiction.enabled,
    layers.electrical.lines,
    layers.electrical.flowAnimation,
    layers.electrical.towers,
    layers.electrical.substations,
    layers.electrical.generationSources,
  ]);

  // Jurisdiction boundary polygons (populates only when boundaries or theme change)
  useEffect(() => {
    const group = boundaryGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (layers.jurisdiction.zones) {
      for (const zone of JURISDICTION_ZONES) {
        const latLngs = zone.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: zone.color,
          weight: 2,
          opacity: 0.85,
          fillColor: zone.color,
          fillOpacity: theme === "light" ? 0.05 : 0.08,
          dashArray: "8, 6",
        })
          .bindTooltip(
            `<div class="text-xs font-semibold text-white">Zone: ${zone.name}</div>`,
            { sticky: true, className: "power-grid-tooltip" }
          )
          .addTo(group);
      }
    }

    if (layers.jurisdiction.circles) {
      for (const circle of JURISDICTION_CIRCLES) {
        const latLngs = circle.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: circle.color,
          weight: 1.8,
          opacity: 0.65,
          fillColor: circle.color,
          fillOpacity: theme === "light" ? 0.04 : 0.06,
          dashArray: "5, 5",
        })
          .bindTooltip(
            `<div class="text-xs font-semibold text-cyan-300">Circle: ${circle.name}</div>`,
            { sticky: true, className: "power-grid-tooltip" }
          )
          .addTo(group);
      }
    }

    if (layers.jurisdiction.divisions) {
      for (const division of JURISDICTION_DIVISIONS) {
        const latLngs = division.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polygon(latLngs, {
          color: division.color,
          weight: 1.2,
          opacity: 0.5,
          fillColor: division.color,
          fillOpacity: theme === "light" ? 0.03 : 0.04,
          dashArray: "3, 4",
        })
          .bindTooltip(
            `<div class="text-xs font-semibold text-amber-300">Division: ${division.name}</div>`,
            { sticky: true, className: "power-grid-tooltip" }
          )
          .addTo(group);
      }
    }
  }, [
    layers.jurisdiction.zones,
    layers.jurisdiction.circles,
    layers.jurisdiction.divisions,
    theme,
  ]);

  // Transmission corridors (single luminous polyline with hardware drop-shadow)
  useEffect(() => {
    const group = linesGroupRef.current;
    if (!group) return;

    group.clearLayers();
    const isLight = theme === "light";

    for (const line of visibleLines) {
      const latLngs = line.path.map(([lng, lat]) => [lat, lng] as [number, number]);
      const vCfg =
        (isLight ? VOLTAGE_LINE_CONFIG_LIGHT : VOLTAGE_LINE_CONFIG_DARK)[line.voltage] ??
        (isLight ? VOLTAGE_LINE_CONFIG_LIGHT["220kV"] : VOLTAGE_LINE_CONFIG_DARK["220kV"]);

      L.polyline(latLngs, {
        color: vCfg.color,
        weight: vCfg.weight,
        opacity: 1.0,
        lineCap: "round",
        lineJoin: "round",
        className: `electric-line electric-line--${line.voltage}`,
      })
        .bindTooltip(
          `<div class="text-xs"><strong>${line.voltage} Transmission Line</strong><br/><span class="${isLight ? "text-slate-700" : "text-slate-300"}">${line.fromName} ↔ ${line.toName}</span></div>`,
          { sticky: true, className: "power-grid-tooltip" }
        )
        .addTo(group);
    }
  }, [theme, visibleLines]);

  // Injection flow: Gen / Inter-State → Tx → Dist (single animated polyline)
  useEffect(() => {
    const group = flowGroupRef.current;
    if (!group) return;

    group.clearLayers();
    const isLight = theme === "light";

    for (const flow of visibleFlows) {
      const color = isLight
        ? flow.category === "thermal"
          ? "#d97706"
          : flow.category === "interstate"
          ? "#0284c7"
          : "#059669"
        : injectionFlowColor(flow.category);
      const latLngs: [number, number][] = [flow.from, flow.to];
      const weight = flow.stage === "injection" ? 3.6 : 2.4;

      L.polyline(latLngs, {
        color,
        weight,
        opacity: 1.0,
        lineCap: "round",
        lineJoin: "round",
        className: `injection-flow injection-flow--${flow.category}`,
      })
        .bindTooltip(
          `<div class="text-xs font-semibold"><strong>${flow.label}</strong><br/><span class="${isLight ? "text-amber-800" : "text-amber-300"} font-mono">${flow.mw != null ? `${flow.mw} MW injection` : "Grid injection"}</span></div>`,
          { sticky: true, className: "power-grid-tooltip" }
        )
        .addTo(group);
    }
  }, [theme, visibleFlows]);

  // Towers
  useEffect(() => {
    const group = towersGroupRef.current;
    if (!group) return;

    group.clearLayers();
    const icon = createTowerIcon(theme);

    for (const line of visibleLines) {
      for (const tower of line.towers) {
        L.marker([tower.lat, tower.lng], { icon }).addTo(group);
      }
    }
  }, [visibleLines, theme]);

  // Substations (DOM reused on hover via CSS classes)
  useEffect(() => {
    const group = substationGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();

    for (const ss of visibleSubstations) {
      const marker = L.marker([ss.lat, ss.lng], {
        icon: createSubstationIcon(ss, false, theme),
        title: `${ss.name} · ${ss.code}`,
      });

      marker.on("mouseover", (e) => {
        setHoveredSource(null);
        setHoveredSubstation(ss);
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
        const el = marker.getElement()?.querySelector(".substation-marker");
        el?.classList.add("substation-marker--hover");
        marker.setZIndexOffset(1000);
      });

      marker.on("mousemove", (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
      });

      marker.on("mouseout", () => {
        setHoveredSubstation(null);
        const el = marker.getElement()?.querySelector(".substation-marker");
        el?.classList.remove("substation-marker--hover");
        marker.setZIndexOffset(0);
      });

      marker.on("click", () => {
        setHoveredSubstation(null);
        routerRef.current.push(substationGisHref(ss));
      });

      marker.addTo(group);
    }
  }, [visibleSubstations, theme]);

  // Generation / inter-state sources (DOM reused on hover via CSS classes)
  useEffect(() => {
    const group = sourcesGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();

    for (const src of visibleSources) {
      const marker = L.marker([src.lat, src.lng], {
        icon: createGenerationSourceIcon(src, false, theme),
        title: src.name,
        zIndexOffset: 500,
      });

      marker.on("mouseover", (e) => {
        setHoveredSubstation(null);
        setHoveredSource(src);
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
        const el = marker.getElement()?.querySelector(".generation-marker");
        el?.classList.add("generation-marker--hover");
        marker.setZIndexOffset(1200);
      });

      marker.on("mousemove", (e) => {
        const point = map.latLngToContainerPoint(e.latlng);
        setHoverPos({ x: point.x, y: point.y });
      });

      marker.on("mouseout", () => {
        setHoveredSource(null);
        const el = marker.getElement()?.querySelector(".generation-marker");
        el?.classList.remove("generation-marker--hover");
        marker.setZIndexOffset(500);
      });

      marker.on("click", () => {
        const ss = findSubstationByCode(src.connectedSubstationCode);
        if (ss) {
          map.flyTo([ss.lat, ss.lng], 11, { duration: 0.7 });
        }
      });

      marker.addTo(group);
    }
  }, [visibleSources, theme]);

  const openSubstationGis = (code: string) => {
    const ss = findSubstationByCode(code);
    const map = mapRef.current;
    if (ss && map) {
      map.flyTo([ss.lat, ss.lng], 12, { duration: 0.7 });
    }
    window.setTimeout(() => {
      if (ss) {
        routerRef.current.push(substationGisHref(ss));
      } else {
        routerRef.current.push(
          `/dashboard/substation-gis?code=${encodeURIComponent(code)}`
        );
      }
    }, 450);
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        themeConfig.panelClass,
        `pg-theme-${theme}`
      )}
    >
      {headerSlot &&
        createPortal(
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-surface-900/80 px-3 py-1.5 shadow-sm backdrop-blur-md xl:flex">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-white tracking-tight">Haryana Network Grid</h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                    Live GIS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {visibleSubstations.length} SS · {visibleSources.length} Sources
                </p>
              </div>
            </div>
            <ThemeSwitcher theme={theme} onChange={setTheme} />
          </div>,
          headerSlot
        )}

      <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-0 z-[1500] flex flex-col p-2.5 sm:p-3">
        <div className="pointer-events-auto w-full shrink-0">
          <GisFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_GIS_FILTERS)}
            onSubstationSelect={openSubstationGis}
            visibleCount={visibleSubstations.length}
            totalCount={SUBSTATIONS.length}
            sourceCount={visibleSources.length}
            theme={theme}
          />
        </div>

        {/* Decoupled interactive controls canvas */}
        <div className="relative min-h-0 flex-1 mt-2">
          {/* Top-Right: Layer Control Panel */}
          <div className="pointer-events-auto absolute right-0 top-0">
            <LayerControlPanel
              layers={layers}
              onChange={setLayers}
              theme={theme}
              themeClass={themeConfig.panelClass}
            />
          </div>

          {/* Bottom-Left: Collapsible Interactive Legend */}
          <LegendCard theme={theme} />
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
      {hoveredSource && (
        <GenerationSourceHoverCard
          source={hoveredSource}
          x={hoverPos.x}
          y={hoverPos.y}
          theme={theme}
        />
      )}
    </div>
  );
}

function LegendCard({ theme }: { theme: MapTheme }) {
  const [open, setOpen] = useState(true);
  const isLight = theme === "light";

  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-0 left-0 w-fit min-w-[210px] max-w-[290px] rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300",
        isLight
          ? "border border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-300/40"
          : "border border-white/10 bg-slate-900/85 text-slate-100 dt-glass"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition",
          isLight ? "hover:bg-slate-100/80 border-b border-slate-200/90" : "hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isLight ? "bg-cyan-600" : "bg-cyan-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isLight ? "bg-cyan-600" : "bg-cyan-500"
              )}
            />
          </span>
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-wider",
              isLight ? "text-slate-900" : "text-white"
            )}
          >
            Network Legend
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {!open && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[9px] font-mono",
                isLight
                  ? "bg-slate-100 text-slate-700 border border-slate-300"
                  : "bg-white/10 text-slate-300"
              )}
            >
              8 types
            </span>
          )}
          <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.2 }}>
            <ChevronDown className={cn("h-3.5 w-3.5", isLight ? "text-slate-500" : "text-slate-400")} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "space-y-1.5 px-3.5 pb-3 pt-2",
                isLight ? "border-t border-slate-200/90" : "border-t border-white/5"
              )}
            >
              <LegendItem color={isLight ? "#dc2626" : "#ff1744"} label="400 kV — Hexagon" ring isLight={isLight} />
              <LegendItem color={isLight ? "#0284c7" : "#00e5ff"} label="220 kV — Cyan node" ring isLight={isLight} />
              <LegendItem color={isLight ? "#d97706" : "#ffb703"} label="132 kV — Amber node" ring isLight={isLight} />
              <LegendItem color={isLight ? "#059669" : "#00e676"} label="66 kV — Green node" ring isLight={isLight} />
              <LegendItem color={isLight ? "#d97706" : "#ff9100"} label="Thermal plant (HPGCL)" ring isLight={isLight} />
              <LegendItem color={isLight ? "#0284c7" : "#00e5ff"} label="Inter-State / PGCIL" ring isLight={isLight} />
              <LegendItem color={isLight ? "#059669" : "#00e676"} label="Renewable interconnect" ring isLight={isLight} />
              <LegendItem color={isLight ? "#d97706" : "#ffb703"} label="Injection flow pulse" dashed glow isLight={isLight} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({
  color,
  label,
  glow,
  dashed,
  ring,
  isLight,
}: {
  color: string;
  label: string;
  glow?: boolean;
  dashed?: boolean;
  ring?: boolean;
  isLight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {ring ? (
        <div
          className="h-3 w-3 shrink-0 rounded-full border-2"
          style={{
            borderColor: color,
            boxShadow: isLight ? `0 1px 2px rgba(0,0,0,0.15)` : `0 0 6px ${color}`,
          }}
        />
      ) : (
        <div
          className="h-1.5 w-5 shrink-0 rounded-full"
          style={{
            backgroundColor: dashed ? "transparent" : color,
            border: dashed ? `1.5px dashed ${color}` : "none",
            boxShadow: glow && !isLight ? `0 0 8px ${color}` : undefined,
          }}
        />
      )}
      <span className={cn("text-[11px] font-medium", isLight ? "text-slate-800 font-semibold" : "text-slate-300")}>
        {label}
      </span>
    </div>
  );
}
