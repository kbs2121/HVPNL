/**
 * Theme Manager — Light / Dark / Auto with localStorage persistence.
 * Syncs UI theme and optionally the basemap.
 */
import type { BasemapId } from "./basemaps";
import { basemapForTheme } from "./basemaps";

export type ThemeMode = "light" | "dark" | "auto";

const STORAGE_KEY = "hsetcl-theme-mode";

export function loadThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  return "dark";
}

export function saveThemeMode(mode: ThemeMode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function resolveUiTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "auto") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }
  return mode;
}

export function themeBasemap(
  mode: ThemeMode,
  currentBasemap: BasemapId,
  syncBasemap: boolean
): BasemapId | null {
  if (!syncBasemap) return null;
  const ui = resolveUiTheme(mode);
  // Don't override if user explicitly chose satellite
  if (currentBasemap === "esri-satellite" || currentBasemap === "mapbox-satellite") {
    return null;
  }
  return basemapForTheme(ui);
}

/** CSS class applied to root for UI theming */
export function uiThemeClass(resolved: "light" | "dark"): string {
  return resolved === "light" ? "dt-theme-light" : "dt-theme-dark";
}
