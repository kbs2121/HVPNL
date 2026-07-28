/**
 * Layer Builder — constructs all deck.gl layers for the digital twin.
 * Separates rendering logic from the React map component.
 */
import {
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
  IconLayer,
  TextLayer,
  GridCellLayer,
} from "@deck.gl/layers";
import { PathStyleExtension } from "@deck.gl/extensions";
import type { Layer } from "@deck.gl/core";
import type {
  Circle,
  Division,
  HealthStatus,
  Substation,
  Tower,
  TransmissionLine,
  Zone,
} from "@/lib/types/digitalTwin";
import type { LayerVisibility } from "@/lib/types/digitalTwin";
import {
  VOLTAGE_COLORS,
  VOLTAGE_WIDTH,
  HEALTH_COLORS,
} from "./constants";
import {
  generateFlowParticles,
  generateFlowArrows,
  dashOffsetForLine,
  type FlowParticle,
} from "./powerFlowEngine";
import { substationIcon, towerIcon } from "./icons";

const pathExt = new PathStyleExtension({ dash: true, highPrecisionDash: true });

export interface LayerBuildContext {
  zones: Zone[];
  circles: Circle[];
  divisions: Division[];
  substations: Substation[];
  towers: Tower[];
  lines: TransmissionLine[];
  layers: LayerVisibility;
  timeMs: number;
  zoom: number;
  iconAtlas: string;
  iconMapping: Record<string, { x: number; y: number; width: number; height: number }>;
  highlightedId: string | null;
  trippedLineId: string | null;
  hoveredId: string | null;
}

function hexToRgba(hex: string, alpha: number): [number, number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    alpha,
  ];
}

function healthGlow(health: HealthStatus): [number, number, number, number] {
  const c = HEALTH_COLORS[health];
  return [c[0], c[1], c[2], 180];
}

function loadGlow(loadPct: number): number {
  return 0.4 + (loadPct / 100) * 0.6;
}

/** Build jurisdiction polygon layers */
function buildJurisdictionLayers(ctx: LayerBuildContext): Layer[] {
  const result: Layer[] = [];
  if (!ctx.layers.jurisdiction.enabled) return result;

  if (ctx.layers.jurisdiction.zones) {
    result.push(
      new PolygonLayer<Zone>({
        id: "jurisdiction-zones",
        data: ctx.zones,
        getPolygon: (d) => d.boundary.coordinates[0],
        getFillColor: (d) => hexToRgba(d.color, 35),
        getLineColor: (d) => hexToRgba(d.color, 160),
        getLineWidth: (d) => (ctx.hoveredId === d.id ? 4 : 2),
        lineWidthMinPixels: 1,
        pickable: true,
        filled: true,
        stroked: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 60],
      })
    );
  }

  if (ctx.layers.jurisdiction.circles) {
    result.push(
      new PolygonLayer<Circle>({
        id: "jurisdiction-circles",
        data: ctx.circles,
        getPolygon: (d) => d.boundary.coordinates[0],
        getFillColor: (d) => hexToRgba(d.color, 25),
        getLineColor: [148, 163, 184, 100],
        getLineWidth: 1,
        pickable: true,
        filled: true,
        stroked: true,
      })
    );
  }

  if (ctx.layers.jurisdiction.divisions) {
    result.push(
      new PolygonLayer<Division>({
        id: "jurisdiction-divisions",
        data: ctx.divisions,
        getPolygon: (d) => d.boundary.coordinates[0],
        getFillColor: (d) => hexToRgba(d.color, 18),
        getLineColor: [100, 116, 139, 70],
        getLineWidth: 1,
        pickable: true,
        filled: true,
        stroked: true,
      })
    );
  }

  return result;
}

/** Build multi-layer transmission corridor rendering */
function buildTransmissionLayers(ctx: LayerBuildContext): Layer[] {
  const result: Layer[] = [];
  if (!ctx.layers.electrical.enabled || !ctx.layers.electrical.lines) return result;

  const activeLines = ctx.lines.filter(
    (l) => l.id !== ctx.trippedLineId
  );

  // Layer 1: Soft outer glow
  result.push(
    new PathLayer<TransmissionLine>({
      id: "lines-glow-outer",
      data: activeLines,
      getPath: (d) => d.path,
      getColor: (d) => {
        const c = VOLTAGE_COLORS[d.voltage_level];
        const glow = loadGlow(d.load_pct);
        return [c[0], c[1], c[2], Math.round(40 * glow)];
      },
      getWidth: (d) => (VOLTAGE_WIDTH[d.voltage_level] + 10) * (1 + d.load_pct / 200),
      widthMinPixels: 6,
      capRounded: true,
      jointRounded: true,
      pickable: false,
    })
  );

  // Layer 2: Main conductor
  result.push(
    new PathLayer<TransmissionLine>({
      id: "lines-conductor",
      data: activeLines,
      getPath: (d) => d.path,
      getColor: (d) => {
        const c = VOLTAGE_COLORS[d.voltage_level];
        return [c[0], c[1], c[2], 230];
      },
      getWidth: (d) => VOLTAGE_WIDTH[d.voltage_level] * (1 + d.load_pct / 150),
      widthMinPixels: 2,
      capRounded: true,
      jointRounded: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 100],
    })
  );

  // Layer 3: Animated rolling dashes (PathStyleExtension)
  if (ctx.layers.electrical.powerFlow || ctx.layers.livePowerFlow.enabled) {
    result.push(
      new PathLayer<TransmissionLine>({
        id: "lines-dash",
        data: activeLines,
        getPath: (d) => d.path,
        getColor: [255, 255, 255, 140],
        getWidth: (d) => VOLTAGE_WIDTH[d.voltage_level] * 0.6,
        widthMinPixels: 1,
        capRounded: true,
        jointRounded: true,
        extensions: [pathExt],
        pickable: false,
        updateTriggers: { getDashOffset: ctx.timeMs },
        // PathStyleExtension props (not in base PathLayer types)
        ...({
          getDashArray: [4, 6],
          dashJustified: true,
          getDashOffset: (d: TransmissionLine) => dashOffsetForLine(d, ctx.timeMs),
        } as object),
      })
    );
  }

  return result;
}

/** Build power flow particle and arrow layers */
function buildPowerFlowLayers(ctx: LayerBuildContext): Layer[] {
  const result: Layer[] = [];
  const showFlow =
    ctx.layers.electrical.enabled &&
    (ctx.layers.electrical.powerFlow || ctx.layers.livePowerFlow.enabled);

  if (!showFlow) return result;

  const activeLines = ctx.lines.filter((l) => l.id !== ctx.trippedLineId);
  const particles = generateFlowParticles(activeLines, ctx.timeMs, 8);

  // Layer 4: Particle glow halo
  result.push(
    new ScatterplotLayer<FlowParticle>({
      id: "flow-glow",
      data: particles,
      getPosition: (d) => d.position,
      getFillColor: (d) => {
        const c = VOLTAGE_COLORS[d.voltage];
        return [c[0], c[1], c[2], d.isPulse ? 120 : 70];
      },
      getRadius: (d) => (d.isPulse ? d.size * 5 : d.size * 3),
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      pickable: false,
    })
  );

  // Layer 4b: White center particles
  result.push(
    new ScatterplotLayer<FlowParticle>({
      id: "flow-particles",
      data: particles,
      getPosition: (d) => d.position,
      getFillColor: (d) =>
        d.isPulse ? [255, 255, 200, 255] : [255, 255, 255, 240],
      getRadius: (d) => d.size,
      radiusMinPixels: 2,
      radiusMaxPixels: 8,
      pickable: false,
    })
  );

  // Flow direction arrows
  const arrows = generateFlowArrows(activeLines, ctx.timeMs);
  result.push(
    new ScatterplotLayer<(typeof arrows)[number]>({
      id: "flow-arrows",
      data: arrows,
      getPosition: (d) => d.position,
      getFillColor: (d) => {
        const c = VOLTAGE_COLORS[d.voltage];
        return [c[0], c[1], c[2], 160];
      },
      getRadius: 3,
      radiusMinPixels: 2,
      radiusMaxPixels: 5,
      pickable: false,
    })
  );

  return result;
}

/** Build tower icon layers with zoom-dependent detail */
function buildTowerLayers(ctx: LayerBuildContext): Layer[] {
  const result: Layer[] = [];
  if (!ctx.layers.electrical.enabled || !ctx.layers.electrical.towers) return result;

  const icon = towerIcon(ctx.zoom);

  if (ctx.iconAtlas) {
    result.push(
      new IconLayer<Tower>({
        id: "towers-icon",
        data: ctx.towers,
        getPosition: (d) => [d.longitude, d.latitude],
        getIcon: () => icon,
        getSize: ctx.zoom >= 12 ? 40 : ctx.zoom >= 9 ? 28 : 18,
        iconAtlas: ctx.iconAtlas,
        iconMapping: ctx.iconMapping,
        pickable: true,
        autoHighlight: true,
        highlightColor: [34, 211, 238, 200],
      })
    );
  } else {
    result.push(
      new ScatterplotLayer<Tower>({
        id: "towers-fallback",
        data: ctx.towers,
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: (d) => healthGlow(d.health),
        getRadius: ctx.zoom >= 12 ? 6 : 4,
        radiusMinPixels: 3,
        radiusMaxPixels: 8,
        pickable: true,
      })
    );
  }

  // Tower labels
  if (ctx.layers.electrical.towerLabels && ctx.zoom >= 10) {
    result.push(
      new TextLayer<Tower>({
        id: "tower-labels",
        data: ctx.towers,
        getPosition: (d) => [d.longitude, d.latitude],
        getText: (d) => d.tower_number,
        getSize: 11,
        getColor: [203, 213, 225, 220],
        getPixelOffset: [0, -18],
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        pickable: false,
      })
    );
  }

  return result;
}

/** Build substation icon layers with health glow rings */
function buildSubstationLayers(ctx: LayerBuildContext): Layer[] {
  const result: Layer[] = [];
  if (!ctx.layers.electrical.enabled || !ctx.layers.electrical.substations) return result;

  const pulse = (Math.sin(ctx.timeMs * 0.003) + 1) / 2;

  // Animated health ring
  result.push(
    new ScatterplotLayer<Substation>({
      id: "substation-ring",
      data: ctx.substations,
      getPosition: (d) => [d.longitude, d.latitude],
      getFillColor: (d) => {
        const c = HEALTH_COLORS[d.health];
        const isHighlight = ctx.highlightedId === d.id;
        return [c[0], c[1], c[2], isHighlight ? 100 : Math.round(30 + pulse * 50)];
      },
      getRadius: (d) => {
        const base = 16 + (d.load_MW / d.capacity_MVA) * 12;
        return ctx.highlightedId === d.id ? base * 1.5 : base;
      },
      radiusMinPixels: 18,
      radiusMaxPixels: 50,
      pickable: false,
    })
  );

  // Substation icons
  if (ctx.iconAtlas) {
    result.push(
      new IconLayer<Substation>({
        id: "substations-icon",
        data: ctx.substations,
        getPosition: (d) => [d.longitude, d.latitude],
        getIcon: (d) => substationIcon(d.voltage_level),
        getSize: 48,
        iconAtlas: ctx.iconAtlas,
        iconMapping: ctx.iconMapping,
        pickable: true,
        autoHighlight: true,
        highlightColor: [34, 211, 238, 200],
      })
    );
  } else {
    result.push(
      new ScatterplotLayer<Substation>({
        id: "substations-fallback",
        data: ctx.substations,
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: (d) => [...HEALTH_COLORS[d.health], 255],
        getRadius: 10,
        radiusMinPixels: 8,
        radiusMaxPixels: 14,
        stroked: true,
        getLineColor: [255, 255, 255, 200],
        lineWidthMinPixels: 2,
        pickable: true,
      })
    );
  }

  // Substation labels
  if (ctx.layers.electrical.substationLabels) {
    result.push(
      new TextLayer<Substation>({
        id: "substation-labels",
        data: ctx.substations,
        getPosition: (d) => [d.longitude, d.latitude],
        getText: (d) => `${d.name} SS`,
        getSize: ctx.zoom >= 10 ? 13 : 11,
        getColor: [241, 245, 249, 240],
        getPixelOffset: [0, -32],
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        getBackgroundColor: [10, 15, 26, 180],
        backgroundPadding: [4, 2],
        pickable: false,
      })
    );
  }

  // Voltage labels on lines
  if (ctx.layers.electrical.voltageLabels && ctx.zoom >= 9) {
    const midpoints = ctx.lines.map((l) => {
      const mid = l.path[Math.floor(l.path.length / 2)];
      return { position: mid, voltage: l.voltage_level, name: l.name };
    });
    result.push(
      new TextLayer({
        id: "voltage-labels",
        data: midpoints,
        getPosition: (d) => d.position,
        getText: (d) => d.voltage,
        getSize: 10,
        getColor: (d) => {
          const c = VOLTAGE_COLORS[d.voltage as keyof typeof VOLTAGE_COLORS];
          return [c[0], c[1], c[2], 220];
        },
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        pickable: false,
      })
    );
  }

  return result;
}

/** Asset health heatmap using grid cells */
function buildHeatmapLayer(ctx: LayerBuildContext): Layer[] {
  if (!ctx.layers.heatMap.enabled) return [];

  const cells = ctx.substations.map((s) => ({
    position: [s.longitude, s.latitude] as [number, number],
    weight: s.load_MW / s.capacity_MVA,
  }));

  return [
    new GridCellLayer({
      id: "health-heatmap",
      data: cells,
      getPosition: (d) => d.position,
      getFillColor: (d) => {
        const w = d.weight;
        if (w > 0.85) return [239, 68, 68, 80];
        if (w > 0.7) return [245, 158, 11, 60];
        return [16, 185, 129, 40];
      },
      cellSize: 15000,
      pickable: false,
    }),
  ];
}

/** Maintenance alert blinking icons */
function buildMaintenanceLayers(ctx: LayerBuildContext): Layer[] {
  if (!ctx.layers.maintenanceAlerts.enabled) return [];

  const blink = Math.sin(ctx.timeMs * 0.008) > 0;
  if (!blink) return [];

  const dueAssets = [
    ...ctx.substations.filter((s) => s.health !== "Healthy"),
    ...ctx.towers.filter((t) => t.health === "Warning"),
  ];

  if (!ctx.iconAtlas || dueAssets.length === 0) return [];

  return [
    new IconLayer({
      id: "maintenance-alerts",
      data: dueAssets,
      getPosition: (d) => [d.longitude, d.latitude],
      getIcon: () => "alert",
      getSize: 24,
      iconAtlas: ctx.iconAtlas,
      iconMapping: ctx.iconMapping,
      getPixelOffset: [16, -16],
      pickable: false,
    }),
  ];
}

/** Compose all layers in correct z-order */
export function buildAllLayers(ctx: LayerBuildContext): Layer[] {
  return [
    ...buildHeatmapLayer(ctx),
    ...buildJurisdictionLayers(ctx),
    ...buildTransmissionLayers(ctx),
    ...buildPowerFlowLayers(ctx),
    ...buildTowerLayers(ctx),
    ...buildSubstationLayers(ctx),
    ...buildMaintenanceLayers(ctx),
  ];
}
