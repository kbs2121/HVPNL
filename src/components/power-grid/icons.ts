import L from "leaflet";

export function createSubstationIcon(isHovered = false): L.DivIcon {
  const glow = isHovered ? "filter: drop-shadow(0 0 14px #00f0ff) drop-shadow(0 0 24px #00f0ff);" : "filter: drop-shadow(0 0 8px #00f0ff);";
  return L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="substation-marker ${isHovered ? "substation-marker--hover" : ""}" style="${glow}">
        <svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="rgba(0,20,40,0.85)" stroke="#00f0ff" stroke-width="1.5"/>
          <path d="M22 10 L16 22 H20 L18 30 L26 18 H22 Z" fill="#00f0ff" stroke="#7ffcff" stroke-width="0.5"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export function createTowerIcon(): L.DivIcon {
  return L.divIcon({
    className: "power-grid-marker",
    html: `
      <div class="tower-marker" style="filter: drop-shadow(0 0 4px #fbbf24);">
        <svg viewBox="0 0 24 32" width="20" height="28" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 L4 30 H8 L12 18 L16 30 H20 Z" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
          <line x1="6" y1="14" x2="18" y2="14" stroke="#fbbf24" stroke-width="1"/>
          <line x1="7" y1="20" x2="17" y2="20" stroke="#fbbf24" stroke-width="1"/>
          <line x1="8" y1="26" x2="16" y2="26" stroke="#fbbf24" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
  });
}
