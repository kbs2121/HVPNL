import { create } from "zustand";
import type {
  AlertState,
  IncidentStatus,
  SubstationAsset,
} from "@/lib/data/adhounSubstationAssets";
import { ADHOUN_ASSETS, DEFAULT_SUBSTATION } from "@/lib/data/adhounSubstationAssets";
import type { HierarchyFilters } from "@/lib/data/hierarchyFilters";

export type ViewMode = "3d" | "sld";

export interface IncidentRecord {
  status: IncidentStatus;
  assignedTo: string;
  notes: string;
}

export interface MapTransform {
  scale: number;
  x: number;
  y: number;
}

interface SubstationTwinState {
  selectedSubstation: string;
  selectedAsset: SubstationAsset | null;
  hoveredAsset: SubstationAsset | null;
  viewMode: ViewMode;
  isFullscreen: boolean;
  assets: SubstationAsset[];
  hierarchyFilters: HierarchyFilters;
  acknowledgedAlerts: Record<string, AlertState>;
  incidents: Record<string, IncidentRecord>;
  showCrewDrawer: boolean;
  crewDispatchAssetId: string | null;
  mapTransform: MapTransform;
  setSelectedSubstation: (name: string) => void;
  setSelectedAsset: (asset: SubstationAsset | null) => void;
  setHoveredAsset: (asset: SubstationAsset | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setFullscreen: (value: boolean) => void;
  setHierarchyFilters: (filters: HierarchyFilters) => void;
  acknowledgeAlert: (assetId: string) => void;
  saveIncidentLog: (assetId: string, record: IncidentRecord) => void;
  openCrewDrawer: (assetId: string) => void;
  closeCrewDrawer: () => void;
  focusWarnings: () => void;
  resetMapView: () => void;
  getFilteredAssets: () => SubstationAsset[];
}

const defaultHierarchyFilters: HierarchyFilters = {
  zone: "Panchkula",
  circle: "TS Karnal",
  division: "TS Kurukshetra",
  substation: DEFAULT_SUBSTATION,
  voltage: "132kV",
  dateRange: "Today",
};

export const useSubstationTwinStore = create<SubstationTwinState>((set, get) => ({
  selectedSubstation: DEFAULT_SUBSTATION,
  selectedAsset: null,
  hoveredAsset: null,
  viewMode: "3d",
  isFullscreen: false,
  assets: ADHOUN_ASSETS,
  hierarchyFilters: defaultHierarchyFilters,
  acknowledgedAlerts: {},
  incidents: {},
  showCrewDrawer: false,
  crewDispatchAssetId: null,
  mapTransform: { scale: 1, x: 0, y: 0 },

  setSelectedSubstation: (name) =>
    set({ selectedSubstation: name, selectedAsset: null, hoveredAsset: null }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setHoveredAsset: (asset) => set({ hoveredAsset: asset }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setFullscreen: (value) => set({ isFullscreen: value }),

  setHierarchyFilters: (filters) => {
    set({ hierarchyFilters: filters });
    if (filters.substation !== "All") {
      set({ selectedSubstation: filters.substation, selectedAsset: null });
    }
  },

  acknowledgeAlert: (assetId) =>
    set((s) => ({
      acknowledgedAlerts: { ...s.acknowledgedAlerts, [assetId]: "Acknowledged" },
    })),

  saveIncidentLog: (assetId, record) =>
    set((s) => ({
      incidents: { ...s.incidents, [assetId]: record },
    })),

  openCrewDrawer: (assetId) =>
    set({ showCrewDrawer: true, crewDispatchAssetId: assetId }),

  closeCrewDrawer: () =>
    set({ showCrewDrawer: false, crewDispatchAssetId: null }),

  focusWarnings: () => {
    const warningAssets = get().assets.filter(
      (a) => a.status === "WARNING" || a.status === "CRITICAL"
    );
    if (warningAssets.length === 0) {
      set({ mapTransform: { scale: 1, x: 0, y: 0 } });
      return;
    }
    const avgX =
      warningAssets.reduce((sum, a) => sum + parseFloat(a.x), 0) /
      warningAssets.length;
    const avgY =
      warningAssets.reduce((sum, a) => sum + parseFloat(a.y), 0) /
      warningAssets.length;
    set({
      mapTransform: {
        scale: 1.35,
        x: 50 - avgX,
        y: 50 - avgY,
      },
    });
  },

  resetMapView: () => set({ mapTransform: { scale: 1, x: 0, y: 0 } }),

  getFilteredAssets: () => get().assets,
}));

export function useAssetCounts() {
  const assets = useSubstationTwinStore((s) => s.assets);
  return {
    all: assets.length,
    warnings: assets.filter((a) => a.status === "WARNING").length,
    critical: assets.filter((a) => a.status === "CRITICAL").length,
    activeWarnings: assets.filter(
      (a) => a.status === "WARNING" || a.status === "CRITICAL"
    ).length,
  };
}
