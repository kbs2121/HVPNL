import type { MapOptions } from "leaflet";
import L from "leaflet";

/** SW / NE corners covering Haryana + Chandigarh + Punjab [lat, lng] */
export const REGION_SW: [number, number] = [27.0, 73.8];
export const REGION_NE: [number, number] = [31.8, 78.2];

export const REGION_BOUNDS_CORNERS: [[number, number], [number, number]] = [
  REGION_SW,
  REGION_NE,
];

export const REGION_CENTER: [number, number] = [29.6, 76.3];
export const REGION_DEFAULT_ZOOM = 7.8;
export const REGION_MIN_ZOOM = 6.5;
export const REGION_MAX_ZOOM = 18;

export function getRegionBounds(pad = 0.15): L.LatLngBounds {
  return L.latLngBounds(REGION_SW, REGION_NE).pad(pad);
}

/** Leaflet map options that lock pan/zoom to the tri-state region */
export function regionMapOptions(
  overrides: Partial<MapOptions> = {}
): Partial<MapOptions> {
  return {
    maxBounds: getRegionBounds(0.12),
    maxBoundsViscosity: 1.0,
    minZoom: REGION_MIN_ZOOM,
    maxZoom: REGION_MAX_ZOOM,
    ...overrides,
  };
}
