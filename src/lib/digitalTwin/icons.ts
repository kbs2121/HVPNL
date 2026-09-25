/**
 * Icon Atlas — generates substation and tower SVG icons for deck.gl IconLayer.
 * Icons are rendered to a shared canvas atlas at runtime.
 */

export type IconName =
  | "sub-400"
  | "sub-220"
  | "sub-132"
  | "sub-66"
  | "sub-33"
  | "tower-sm"
  | "tower-md"
  | "tower-lg"
  | "alert";

const ICON_DEFS: Record<IconName, { svg: string; size: number }> = {
  "sub-400": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#ef4444" opacity="0.3"/>
      <rect x="18" y="20" width="28" height="24" rx="3" fill="#1e293b" stroke="#ef4444" stroke-width="2.5"/>
      <path d="M26 28h12M26 34h12M26 40h8" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="14" r="4" fill="#ef4444"/>
      <path d="M32 18v2" stroke="#ef4444" stroke-width="2"/>
    </svg>`,
  },
  "sub-220": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#f97316" opacity="0.3"/>
      <rect x="18" y="20" width="28" height="24" rx="3" fill="#1e293b" stroke="#f97316" stroke-width="2.5"/>
      <path d="M26 28h12M26 34h12M26 40h8" stroke="#f97316" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="14" r="4" fill="#f97316"/>
    </svg>`,
  },
  "sub-132": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="#3b82f6" opacity="0.3"/>
      <rect x="18" y="20" width="28" height="24" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="2.5"/>
      <path d="M26 28h12M26 34h12" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="14" r="4" fill="#3b82f6"/>
    </svg>`,
  },
  "sub-66": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="26" fill="#22c55e" opacity="0.3"/>
      <rect x="20" y="22" width="24" height="20" rx="2" fill="#1e293b" stroke="#22c55e" stroke-width="2"/>
      <path d="M28 30h8M28 36h8" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "sub-33": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="#06b6d4" opacity="0.3"/>
      <rect x="22" y="24" width="20" height="16" rx="2" fill="#1e293b" stroke="#06b6d4" stroke-width="2"/>
      <path d="M28 32h8" stroke="#06b6d4" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  "tower-sm": {
    size: 32,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16 4 L22 28 L10 28 Z" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="11" y1="18" x2="21" y2="18" stroke="#94a3b8" stroke-width="1"/>
      <line x1="12" y1="23" x2="20" y2="23" stroke="#94a3b8" stroke-width="1"/>
    </svg>`,
  },
  "tower-md": {
    size: 48,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M24 4 L34 42 L14 42 Z" fill="none" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="16" y1="24" x2="32" y2="24" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="17" y1="30" x2="31" y2="30" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="18" y1="36" x2="30" y2="36" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="24" cy="4" r="2" fill="#f59e0b"/>
    </svg>`,
  },
  "tower-lg": {
    size: 64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M32 2 L46 58 L18 58 Z" fill="rgba(30,41,59,0.8)" stroke="#e2e8f0" stroke-width="2.5" filter="url(#glow)"/>
      <line x1="22" y1="30" x2="42" y2="30" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="23" y1="38" x2="41" y2="38" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="24" y1="46" x2="40" y2="46" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="32" cy="2" r="3" fill="#fbbf24"/>
    </svg>`,
  },
  alert: {
    size: 32,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#ef4444" opacity="0.9"/>
      <text x="16" y="21" text-anchor="middle" fill="white" font-size="16" font-weight="bold">!</text>
    </svg>`,
  },
};

export interface IconMapping {
  [key: string]: { x: number; y: number; width: number; height: number; mask?: boolean };
}

let cachedAtlas: { atlas: string; mapping: IconMapping } | null = null;

/** Build a sprite atlas from SVG definitions (client-side only) */
export function getIconAtlas(): { atlas: string; mapping: IconMapping } {
  if (cachedAtlas) return cachedAtlas;
  if (typeof document === "undefined") {
    return { atlas: "", mapping: {} };
  }

  const names = Object.keys(ICON_DEFS) as IconName[];
  const cellSize = 64;
  const cols = 4;
  const rows = Math.ceil(names.length / cols);
  const canvas = document.createElement("canvas");
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext("2d")!;
  const mapping: IconMapping = {};

  names.forEach((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize;
    const y = row * cellSize;
    const def = ICON_DEFS[name];

    const img = new Image();
    const blob = new Blob([def.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    // Synchronous fallback — draw placeholder rect; real icons load async
    ctx.fillStyle = "transparent";
    ctx.fillRect(x, y, cellSize, cellSize);

    mapping[name] = { x, y, width: cellSize, height: cellSize, mask: false };

    img.onload = () => {
      ctx.drawImage(img, x, y, cellSize, cellSize);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

  cachedAtlas = { atlas: canvas.toDataURL(), mapping };
  return cachedAtlas;
}

/** Pre-load atlas asynchronously for crisp icons */
export function preloadIconAtlas(): Promise<{ atlas: string; mapping: IconMapping }> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve({ atlas: "", mapping: {} });
      return;
    }

    const names = Object.keys(ICON_DEFS) as IconName[];
    const cellSize = 64;
    const cols = 4;
    const rows = Math.ceil(names.length / cols);
    const canvas = document.createElement("canvas");
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    const ctx = canvas.getContext("2d")!;
    const mapping: IconMapping = {};

    let loaded = 0;
    names.forEach((name, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellSize;
      const y = row * cellSize;
      mapping[name] = { x, y, width: cellSize, height: cellSize };

      const img = new Image();
      const blob = new Blob([ICON_DEFS[name].svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, x, y, cellSize, cellSize);
        URL.revokeObjectURL(url);
        loaded++;
        if (loaded === names.length) {
          cachedAtlas = { atlas: canvas.toDataURL(), mapping };
          resolve(cachedAtlas);
        }
      };
      img.src = url;
    });
  });
}

export function substationIcon(voltageLevel: string): IconName {
  if (voltageLevel.includes("400")) return "sub-400";
  if (voltageLevel.includes("220")) return "sub-220";
  if (voltageLevel.includes("132")) return "sub-132";
  if (voltageLevel.includes("66")) return "sub-66";
  return "sub-33";
}

export function towerIcon(zoom: number): IconName {
  if (zoom >= 12) return "tower-lg";
  if (zoom >= 9) return "tower-md";
  return "tower-sm";
}
