import { create } from "zustand";
import type {
  HoverInfo,
  LayerVisibility,
  MapViewState,
  SearchResult,
  ThemeMode,
  DashboardStats,
} from "@/lib/types/digitalTwin";
import type { BasemapId } from "@/lib/digitalTwin/basemaps";
import { DEFAULT_BASEMAP } from "@/lib/digitalTwin/basemaps";
import {
  loadThemeMode,
  saveThemeMode,
  resolveUiTheme,
} from "@/lib/digitalTwin/themeManager";
import { getStats } from "@/lib/digitalTwin/dataService";
import { HARYANA_VIEW } from "@/lib/digitalTwin/constants";
import type { FlyoverWaypoint } from "@/lib/digitalTwin/flyover";

interface DigitalTwinState {
  viewState: MapViewState;
  basemapId: BasemapId;
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  syncBasemapToTheme: boolean;
  layers: LayerVisibility;
  layerPanelOpen: boolean;
  hoverInfo: HoverInfo | null;
  searchQuery: string;
  searchResults: SearchResult[];
  highlightedAssetId: string | null;
  dashboard: DashboardStats;
  isConnected: boolean;
  isOutageMode: boolean;
  trippedLineId: string | null;
  showLoading: boolean;
  flyoverComplete: boolean;
  mouseCoords: { lng: number; lat: number } | null;
  animationTime: number;

  setViewState: (vs: Partial<MapViewState>) => void;
  flyTo: (lng: number, lat: number, zoom?: number, pitch?: number, bearing?: number) => void;
  flyToWaypoint: (wp: FlyoverWaypoint) => void;
  setBasemap: (id: BasemapId) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLayers: (patch: Partial<LayerVisibility>) => void;
  toggleLayer: (group: keyof LayerVisibility, key: string) => void;
  setLayerPanelOpen: (open: boolean) => void;
  setHoverInfo: (info: HoverInfo | null) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  selectSearchResult: (result: SearchResult) => void;
  refreshDashboard: () => void;
  setConnected: (v: boolean) => void;
  toggleOutageMode: () => void;
  setShowLoading: (v: boolean) => void;
  setFlyoverComplete: (v: boolean) => void;
  setMouseCoords: (coords: { lng: number; lat: number } | null) => void;
  setAnimationTime: (t: number) => void;
}

const defaultLayers: LayerVisibility = {
  jurisdiction: { enabled: true, zones: true, circles: true, divisions: false },
  electrical: {
    enabled: true,
    substations: true,
    towers: true,
    lines: true,
    powerFlow: true,
    towerLabels: false,
    substationLabels: true,
    voltageLabels: true,
  },
  weather: { enabled: false },
  heatMap: { enabled: false },
  assetHealth: { enabled: true },
  livePowerFlow: { enabled: true },
  maintenanceAlerts: { enabled: true },
};

export const useDigitalTwinStore = create<DigitalTwinState>((set, get) => ({
  viewState: HARYANA_VIEW,
  basemapId: DEFAULT_BASEMAP,
  themeMode: "dark",
  resolvedTheme: "dark",
  syncBasemapToTheme: false,
  layers: defaultLayers,
  layerPanelOpen: true,
  hoverInfo: null,
  searchQuery: "",
  searchResults: [],
  highlightedAssetId: null,
  dashboard: getStats(),
  isConnected: true,
  isOutageMode: false,
  trippedLineId: null,
  showLoading: true,
  flyoverComplete: false,
  mouseCoords: null,
  animationTime: 0,

  setViewState: (vs) => set((s) => ({ viewState: { ...s.viewState, ...vs } })),

  flyTo: (lng, lat, zoom = 12, pitch = 50, bearing = -15) =>
    set({
      viewState: {
        ...get().viewState,
        longitude: lng,
        latitude: lat,
        zoom,
        pitch,
        bearing,
        transitionDuration: 2000,
      },
      highlightedAssetId: null,
    }),

  flyToWaypoint: (wp) =>
    set({
      viewState: {
        longitude: wp.longitude,
        latitude: wp.latitude,
        zoom: wp.zoom,
        pitch: wp.pitch,
        bearing: wp.bearing,
        transitionDuration: wp.duration,
      },
    }),

  setBasemap: (id) => set({ basemapId: id }),

  setThemeMode: (mode) => {
    saveThemeMode(mode);
    const resolved = resolveUiTheme(mode);
    set({ themeMode: mode, resolvedTheme: resolved });
  },

  setLayers: (patch) =>
    set((s) => ({
      layers: {
        jurisdiction: { ...s.layers.jurisdiction, ...patch.jurisdiction },
        electrical: { ...s.layers.electrical, ...patch.electrical },
        weather: { ...s.layers.weather, ...patch.weather },
        heatMap: { ...s.layers.heatMap, ...patch.heatMap },
        assetHealth: { ...s.layers.assetHealth, ...patch.assetHealth },
        livePowerFlow: { ...s.layers.livePowerFlow, ...patch.livePowerFlow },
        maintenanceAlerts: { ...s.layers.maintenanceAlerts, ...patch.maintenanceAlerts },
      },
    })),

  toggleLayer: (group, key) =>
    set((s) => {
      const g = s.layers[group] as Record<string, boolean>;
      return {
        layers: {
          ...s.layers,
          [group]: { ...g, [key]: !g[key] },
        },
      };
    }),

  setLayerPanelOpen: (open) => set({ layerPanelOpen: open }),
  setHoverInfo: (info) => set({ hoverInfo: info }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),

  selectSearchResult: (result) => {
    set({
      highlightedAssetId: result.id,
      searchQuery: "",
      searchResults: [],
      viewState: {
        ...get().viewState,
        longitude: result.longitude,
        latitude: result.latitude,
        zoom: result.type === "line" ? 10 : result.type === "tower" ? 14 : 12,
        transitionDuration: 2000,
      },
    });
    setTimeout(() => set({ highlightedAssetId: null }), 5000);
  },

  refreshDashboard: () => set({ dashboard: getStats() }),
  setConnected: (v) => set({ isConnected: v }),

  toggleOutageMode: () => {
    const s = get();
    set({
      isOutageMode: !s.isOutageMode,
      trippedLineId: s.isOutageMode ? null : "TL-7",
    });
  },

  setShowLoading: (v) => set({ showLoading: v }),
  setFlyoverComplete: (v) => set({ flyoverComplete: v }),
  setMouseCoords: (coords) => set({ mouseCoords: coords }),
  setAnimationTime: (t) => set({ animationTime: t }),
}));

/** Hydrate theme from localStorage on client */
export function hydrateThemeStore() {
  const mode = loadThemeMode();
  useDigitalTwinStore.setState({
    themeMode: mode,
    resolvedTheme: resolveUiTheme(mode),
  });
}
