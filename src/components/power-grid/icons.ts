import L from "leaflet";
import type { Substation } from "@/lib/data/powerGridData";

function statusRingColor(ss: Substation): string {
  if (ss.status === "Overload Alert" || ss.loadPct >= 90) return "#fbbf24";
  if (ss.status === "Maintenance") return "#f59e0b";
  if (ss.status === "Standby") return "#94a3b8";
  if (ss.loadPct >= 80) return "#facc15";
  return "#10b981";
}

export function createSubstationIcon(ss: Substation, isHovered = false): L.DivIcon {
  const ring = statusRingColor(ss);
  const scale = isHovered ? 1.18 : 1;
  const glow = isHovered
    ? `filter: drop-shadow(0 0 16px ${ring}) drop-shadow(0 0 28px #00f0ff);`
    : `filter: drop-shadow(0 0 10px ${ring});`;

  return L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="substation-marker ${isHovered ? "substation-marker--hover" : ""}" style="transform:scale(${scale});${glow}">
        <svg viewBox="0 0 48 48" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="rgba(8,12,24,0.9)" stroke="${ring}" stroke-width="2.5"/>
          <circle cx="24" cy="24" r="17" fill="none" stroke="${ring}" stroke-width="1" opacity="0.35"/>
          <rect x="14" y="18" width="20" height="14" rx="2" fill="none" stroke="#00f0ff" stroke-width="1.2" opacity="0.8"/>
          <path d="M18 22 h4 l-2 4 l2 4 h-4 l2-6 h-3 z" fill="#00f0ff"/>
          <circle cx="34" cy="14" r="4" fill="${ring}" opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export function createTowerIcon(): L.DivIcon {
  return L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="tower-marker" style="filter: drop-shadow(0 0 6px #fbbf24);">
        <svg viewBox="0 0 28 40" width="22" height="32" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2 L4 38 H8 L14 22 L20 38 H24 Z" fill="none" stroke="#e2e8f0" stroke-width="1.4"/>
          <line x1="7" y1="16" x2="21" y2="16" stroke="#fbbf24" stroke-width="1.2"/>
          <line x1="8" y1="22" x2="20" y2="22" stroke="#fbbf24" stroke-width="1.2"/>
          <line x1="9" y1="28" x2="19" y2="28" stroke="#fbbf24" stroke-width="1.2"/>
          <line x1="10" y1="34" x2="18" y2="34" stroke="#fbbf24" stroke-width="1.2"/>
          <circle cx="7" cy="16" r="1.8" fill="#00f0ff" opacity="0.95"/>
          <circle cx="21" cy="16" r="1.8" fill="#00f0ff" opacity="0.95"/>
          <circle cx="8" cy="22" r="1.8" fill="#00f0ff" opacity="0.95"/>
          <circle cx="20" cy="22" r="1.8" fill="#00f0ff" opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [22, 32],
    iconAnchor: [11, 32],
  });
}
