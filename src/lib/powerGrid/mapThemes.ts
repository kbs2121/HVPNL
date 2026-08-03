export type MapTheme = "dark" | "light" | "satellite";

export interface ThemeConfig {
  id: MapTheme;
  label: string;
  tileUrl: string;
  tileAttribution: string;
  tileSubdomains?: string;
  lineClass: string;
  lineGlow: string;
  lineAccent: string;
  panelClass: string;
}

export const MAP_THEMES: Record<MapTheme, ThemeConfig> = {
  dark: {
    id: "dark",
    label: "Dark",
    tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    tileSubdomains: "abcd",
    lineClass: "electric-line electric-line--dark",
    lineGlow: "#00f0ff",
    lineAccent: "#ff0055",
    panelClass: "pg-theme-dark",
  },
  light: {
    id: "light",
    label: "Light",
    tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    tileSubdomains: "abcd",
    lineClass: "electric-line electric-line--light",
    lineGlow: "#0891b2",
    lineAccent: "#7c3aed",
    panelClass: "pg-theme-light",
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    tileUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    tileAttribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    lineClass: "electric-line electric-line--satellite",
    lineGlow: "#00f0ff",
    lineAccent: "#ff0055",
    panelClass: "pg-theme-satellite",
  },
};
