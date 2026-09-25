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
    tileUrl:
      "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    tileAttribution:
      "Tiles &copy; Esri &mdash; Dark Gray Canvas",
    lineClass: "electric-line electric-line--dark",
    lineGlow: "#00e5ff",
    lineAccent: "#ff1744",
    panelClass: "pg-theme-dark",
  },
  light: {
    id: "light",
    label: "Light",
    tileUrl:
      "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    tileAttribution:
      "Tiles &copy; Esri &mdash; Esri Light Gray Canvas",
    lineClass: "electric-line electric-line--light",
    lineGlow: "#0284c7",
    lineAccent: "#dc2626",
    panelClass: "pg-theme-light",
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    tileUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    tileAttribution:
      "Tiles &copy; Esri &mdash; World Imagery",
    lineClass: "electric-line electric-line--satellite",
    lineGlow: "#00e5ff",
    lineAccent: "#ff1744",
    panelClass: "pg-theme-satellite",
  },
};
