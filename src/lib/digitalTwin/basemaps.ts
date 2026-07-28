/**
 * Basemap definitions — raster tile sources for MapLibre GL.
 * Supports OSM, ESRI, CartoDB, OpenTopoMap, and Mapbox Satellite.
 */
import type { StyleSpecification } from "maplibre-gl";
import { MAPBOX_TOKEN } from "./constants";

export type BasemapId =
  | "esri-satellite"
  | "mapbox-satellite"
  | "osm"
  | "carto-dark"
  | "carto-light"
  | "opentopo"
  | "esri-light";

export interface BasemapConfig {
  id: BasemapId;
  label: string;
  group: "satellite" | "street" | "dark" | "light" | "topo";
  attribution: string;
  maxZoom: number;
  /** Returns a MapLibre style spec */
  getStyle: () => StyleSpecification;
  requiresToken?: boolean;
}

function rasterStyle(
  tiles: string[],
  attribution: string,
  maxzoom = 19
): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      basemap: { type: "raster", tiles, tileSize: 256, attribution, maxzoom },
    },
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  };
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
  "esri-satellite": {
    id: "esri-satellite",
    label: "ESRI World Imagery",
    group: "satellite",
    attribution: "© Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
    getStyle: () =>
      rasterStyle(
        [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        "© Esri"
      ),
  },
  "mapbox-satellite": {
    id: "mapbox-satellite",
    label: "Mapbox Satellite",
    group: "satellite",
    attribution: "© Mapbox © OpenStreetMap",
    maxZoom: 22,
    requiresToken: true,
    getStyle: () =>
      rasterStyle(
        [
          `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
        ],
        "© Mapbox"
      ),
  },
  osm: {
    id: "osm",
    label: "OpenStreetMap",
    group: "street",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    getStyle: () =>
      rasterStyle(
        ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        "© OpenStreetMap"
      ),
  },
  "carto-dark": {
    id: "carto-dark",
    label: "CartoDB Dark Matter",
    group: "dark",
    attribution: "© CARTO © OpenStreetMap",
    maxZoom: 19,
    getStyle: () =>
      rasterStyle(
        [
          "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        ],
        "© CARTO"
      ),
  },
  "carto-light": {
    id: "carto-light",
    label: "CartoDB Positron",
    group: "light",
    attribution: "© CARTO © OpenStreetMap",
    maxZoom: 19,
    getStyle: () =>
      rasterStyle(
        [
          "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        ],
        "© CARTO"
      ),
  },
  opentopo: {
    id: "opentopo",
    label: "OpenTopoMap",
    group: "topo",
    attribution: "© OpenTopoMap © OpenStreetMap",
    maxZoom: 17,
    getStyle: () =>
      rasterStyle(
        ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        "© OpenTopoMap"
      ),
  },
  "esri-light": {
    id: "esri-light",
    label: "ESRI Light Gray Canvas",
    group: "light",
    attribution: "© Esri",
    maxZoom: 16,
    getStyle: () =>
      rasterStyle(
        [
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        ],
        "© Esri"
      ),
  },
};

export const BASEMAP_LIST = Object.values(BASEMAPS);

/** Default basemap — ESRI satellite (no token required) */
export const DEFAULT_BASEMAP: BasemapId = "esri-satellite";

/** Resolve basemap for theme mode */
export function basemapForTheme(
  theme: "light" | "dark",
  preferSatellite = false
): BasemapId {
  if (preferSatellite) return DEFAULT_BASEMAP;
  return theme === "light" ? "esri-light" : "carto-dark";
}

export function getBasemapStyle(id: BasemapId): StyleSpecification {
  const cfg = BASEMAPS[id];
  if (cfg.requiresToken && !MAPBOX_TOKEN) {
    return BASEMAPS["esri-satellite"].getStyle();
  }
  return cfg.getStyle();
}
