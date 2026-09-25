import L from "leaflet";
import type { Substation, VoltageLevel } from "@/lib/data/powerGridData";
import type { GenerationCategory, GenerationSource } from "@/data/generationSources";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";

const VOLTAGE_STYLE: Record<
  VoltageLevel,
  { color: string; shape: "hex" | "circle"; size: number }
> = {
  "400kV": { color: "#ef4444", shape: "hex", size: 40 },
  "220kV": { color: "#0ea5e9", shape: "circle", size: 34 },
  "132kV": { color: "#f59e0b", shape: "circle", size: 28 },
  "66kV": { color: "#10b981", shape: "circle", size: 24 },
};

function statusRingColor(ss: Substation): string {
  if (ss.status === "Overload Alert" || ss.loadPct >= 90) return "#fbbf24";
  if (ss.status === "Maintenance") return "#f59e0b";
  if (ss.status === "Standby") return "#94a3b8";
  if (ss.loadPct >= 80) return "#facc15";
  return VOLTAGE_STYLE[ss.voltage]?.color ?? "#10b981";
}

function hexagonSvg(color: string, ring: string, isLight: boolean, isHighLoad: boolean): string {
  const bg = isLight ? "#ffffff" : "rgba(8,12,24,0.94)";
  const strokeW = isLight ? "2.5" : "2.2";
  const radar = isHighLoad
    ? `<circle class="ss-radar-pulse" cx="24" cy="24" r="18" fill="none" stroke="${color}" stroke-width="1.8" />`
    : "";

  return `
    ${radar}
    <!-- Outer Precision Brackets -->
    <polygon points="24,2 43,13 43,35 24,46 5,35 5,13" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3, 4" opacity="0.65"/>
    <!-- Main Hexagon Body -->
    <polygon points="24,5 40,14 40,34 24,43 8,34 8,14" fill="${bg}" stroke="${color}" stroke-width="${strokeW}"/>
    <!-- Concentric Inner Ring -->
    <polygon points="24,11 34,17 34,31 24,37 14,31 14,17" fill="none" stroke="${ring}" stroke-width="1.2" opacity="0.75"/>
    <!-- Core Luminous Dot -->
    <circle cx="24" cy="24" r="5" fill="${color}"/>
    <circle cx="24" cy="24" r="2" fill="#ffffff" opacity="0.95"/>
  `;
}

function circleSvg(color: string, ring: string, isLight: boolean, isHighLoad: boolean): string {
  const bg = isLight ? "#ffffff" : "rgba(8,12,24,0.94)";
  const strokeW = isLight ? "2.5" : "2.2";
  const radar = isHighLoad
    ? `<circle class="ss-radar-pulse" cx="24" cy="24" r="18" fill="none" stroke="${color}" stroke-width="1.8" />`
    : "";

  return `
    ${radar}
    <!-- Outer Precision Target Ticks -->
    <circle cx="24" cy="24" r="22" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3, 6" opacity="0.55"/>
    <!-- Main Circle Body -->
    <circle cx="24" cy="24" r="18" fill="${bg}" stroke="${color}" stroke-width="${strokeW}"/>
    <!-- Concentric Target Ring -->
    <circle cx="24" cy="24" r="12" fill="none" stroke="${ring}" stroke-width="1.2" opacity="0.7"/>
    <!-- Core Luminous Dot -->
    <circle cx="24" cy="24" r="4.5" fill="${color}"/>
    <circle cx="24" cy="24" r="1.8" fill="#ffffff" opacity="0.95"/>
  `;
}

// Global cached icon instances to prevent repeated DOM SVG parsing
const substationIconCache = new Map<string, L.DivIcon>();
const sourceIconCache = new Map<string, L.DivIcon>();
const towerIconCache = new Map<string, L.DivIcon>();

export function createSubstationIcon(
  ss: Substation,
  isHovered = false,
  theme: MapTheme = "dark"
): L.DivIcon {
  const isLight = theme === "light";
  const isHighLoad = ss.voltage === "400kV" || ss.status === "Overload Alert";
  const ring = statusRingColor(ss);
  const cacheKey = `${ss.voltage}_${ring}_${isLight}_${isHighLoad}_${isHovered}`;

  const cached = substationIconCache.get(cacheKey);
  if (cached) return cached;

  const style = VOLTAGE_STYLE[ss.voltage] ?? VOLTAGE_STYLE["66kV"];
  const scale = isHovered ? 1.25 : 1;

  const glow = isHovered
    ? isLight
      ? `filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 10px ${style.color});`
      : `filter: drop-shadow(0 0 16px ${style.color});`
    : isLight
    ? `filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));`
    : `filter: drop-shadow(0 0 8px ${style.color});`;

  const body =
    style.shape === "hex"
      ? hexagonSvg(style.color, ring, isLight, isHighLoad)
      : circleSvg(style.color, ring, isLight, isHighLoad);
  const size = style.size;

  const icon = L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="substation-marker ${isHovered ? "substation-marker--hover" : ""}" style="transform:scale(${scale});${glow}">
        <svg viewBox="0 0 48 48" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          ${body}
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  substationIconCache.set(cacheKey, icon);
  return icon;
}

export function createTowerIcon(theme: MapTheme = "dark"): L.DivIcon {
  const isLight = theme === "light";
  const cacheKey = isLight ? "light" : "dark";

  const cached = towerIconCache.get(cacheKey);
  if (cached) return cached;

  const strokeColor = isLight ? "#1e293b" : "#f1f5f9";
  const glow = isLight
    ? "filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));"
    : "filter: drop-shadow(0 0 6px #fbbf24);";

  const icon = L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="tower-marker" style="${glow}">
        <svg viewBox="0 0 28 42" width="20" height="30" xmlns="http://www.w3.org/2000/svg">
          <!-- Aviation Clearance Strobe Beacon at Apex -->
          <circle class="pylon-beacon" cx="14" cy="3" r="2.5" fill="#ef4444" />

          <!-- Pylon Lattice Truss Geometry -->
          <path d="M14 4 L5 38 M14 4 L23 38" stroke="${strokeColor}" stroke-width="1.8" fill="none" opacity="0.95"/>
          <path d="M3 11 L25 11 M5 17 L23 17 M6 23 L22 23 M8 29 L20 29" stroke="${strokeColor}" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M5 11 L23 17 M23 11 L5 17 M5 17 L22 23 M23 17 L6 23 M6 23 L20 29 M22 23 L8 29 M8 29 L14 38 M20 29 L14 38" stroke="${strokeColor}" stroke-width="1" fill="none" opacity="0.6"/>
          <!-- Insulator strings -->
          <circle cx="3" cy="11" r="2" fill="#0284c7" opacity="0.95"/>
          <circle cx="25" cy="11" r="2" fill="#0284c7" opacity="0.95"/>
          <circle cx="5" cy="17" r="2" fill="#0284c7" opacity="0.95"/>
          <circle cx="23" cy="17" r="2" fill="#0284c7" opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [20, 30],
    iconAnchor: [10, 30],
  });

  towerIconCache.set(cacheKey, icon);
  return icon;
}

const SOURCE_STYLE: Record<
  GenerationCategory,
  { glow: string; accent: string; label: string }
> = {
  thermal: { glow: "#f59e0b", accent: "#fb923c", label: "Thermal" },
  interstate: { glow: "#0ea5e9", accent: "#38bdf8", label: "Inter-State" },
  renewable: { glow: "#10b981", accent: "#34d399", label: "Renewable" },
};

/** Lucide-like factory / zap / sun glyphs as inline SVG for Leaflet DivIcon */
function sourceGlyph(category: GenerationCategory, accent: string, isLight: boolean): string {
  const bg = isLight ? "#ffffff" : "rgba(8,12,24,0.95)";
  if (category === "thermal") {
    // Factory
    return `
      <rect x="10" y="22" width="28" height="14" rx="2" fill="${bg}" stroke="${accent}" stroke-width="2"/>
      <path d="M14 22 V14 H20 V22" fill="none" stroke="${accent}" stroke-width="2"/>
      <path d="M24 22 V10 H30 V22" fill="none" stroke="${accent}" stroke-width="2"/>
      <rect x="16" y="26" width="4" height="5" fill="${accent}" opacity="0.9"/>
      <rect x="24" y="26" width="4" height="5" fill="${accent}" opacity="0.9"/>
      <path d="M32 14 c2-4 6-4 8 0" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.75"/>
    `;
  }
  if (category === "interstate") {
    // Zap / grid
    return `
      <path d="M26 8 L16 26 H24 L22 40 L34 20 H26 Z" fill="${accent}" stroke="#083344" stroke-width="1"/>
      <circle cx="24" cy="24" r="18" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>
    `;
  }
  // Sun
  return `
    <circle cx="24" cy="24" r="8" fill="${accent}"/>
    <g stroke="${accent}" stroke-width="2" stroke-linecap="round">
      <line x1="24" y1="8" x2="24" y2="12"/>
      <line x1="24" y1="36" x2="24" y2="40"/>
      <line x1="8" y1="24" x2="12" y2="24"/>
      <line x1="36" y1="24" x2="40" y2="24"/>
      <line x1="12.5" y1="12.5" x2="15.5" y2="15.5"/>
      <line x1="32.5" y1="32.5" x2="35.5" y2="35.5"/>
      <line x1="12.5" y1="35.5" x2="15.5" y2="32.5"/>
      <line x1="32.5" y1="12.5" x2="35.5" y2="15.5"/>
    </g>
  `;
}

export function createGenerationSourceIcon(
  source: GenerationSource,
  isHovered = false,
  theme: MapTheme = "dark"
): L.DivIcon {
  const isLight = theme === "light";
  const cacheKey = `${source.category}_${isLight}_${isHovered}`;

  const cached = sourceIconCache.get(cacheKey);
  if (cached) return cached;

  const style = SOURCE_STYLE[source.category];
  const scale = isHovered ? 1.25 : 1;

  const glow = isHovered
    ? isLight
      ? `filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)) drop-shadow(0 0 10px ${style.glow});`
      : `filter: drop-shadow(0 0 20px ${style.glow});`
    : isLight
    ? `filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));`
    : `filter: drop-shadow(0 0 10px ${style.glow});`;

  const bg = isLight ? "#ffffff" : "rgba(8,12,24,0.92)";

  const icon = L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="generation-marker ${isHovered ? "generation-marker--hover" : ""}" style="transform:scale(${scale});${glow}">
        <svg viewBox="0 0 48 48" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="21" fill="${bg}" stroke="${style.glow}" stroke-width="2.5"/>
          <!-- Hardware-accelerated Pulsing Ambient Energy Orbit -->
          <circle cx="24" cy="24" r="21" fill="none" stroke="${style.glow}" stroke-width="2" class="source-orbit-pulse" opacity="0.35"/>
          ${sourceGlyph(source.category, style.accent, isLight)}
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  sourceIconCache.set(cacheKey, icon);
  return icon;
}

export function injectionFlowColor(category: GenerationCategory): string {
  return SOURCE_STYLE[category].glow;
}
