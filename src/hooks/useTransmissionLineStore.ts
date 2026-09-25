import { create } from "zustand";
import type {
  TransmissionLine,
  TransmissionFilters,
  VoltageLevel,
} from "@/lib/types/transmissionLine";
import {
  transmissionLines,
  kpiMetrics,
} from "@/lib/data/mockTransmissionLines";
import {
  defaultHierarchyFilters,
  type HierarchyFilters,
} from "@/lib/data/hierarchyFilters";
import { matchesFilters } from "@/lib/filterTransmissionLines";

interface TransmissionLineState {
  lines: TransmissionLine[];
  selectedLine: TransmissionLine | null;
  lastSelectedLine: TransmissionLine | null;
  hoveredLine: TransmissionLine | null;
  filters: TransmissionFilters;
  hierarchyFilters: HierarchyFilters;
  isFullscreen: boolean;
  isLineCardMinimized: boolean;
  showLineDetailCard: boolean;
  showPatrolCard: boolean;
  kpi: typeof kpiMetrics;
  setSelectedLine: (line: TransmissionLine | null) => void;
  setHoveredLine: (line: TransmissionLine | null) => void;
  closeLineDetail: () => void;
  openLineDetail: () => void;
  toggleLineCardMinimized: () => void;
  togglePatrolCard: () => void;
  setFilters: (partial: Partial<TransmissionFilters>) => void;
  setHierarchyFilters: (filters: HierarchyFilters) => void;
  toggleVoltage: (voltage: VoltageLevel) => void;
  setFullscreen: (value: boolean) => void;
  getFilteredLines: () => TransmissionLine[];
}

export const useTransmissionLineStore = create<TransmissionLineState>((set, get) => ({
  lines: transmissionLines,
  selectedLine: null,
  lastSelectedLine: null,
  hoveredLine: null,
  filters: {
    search: "",
    voltages: [],
    health: "all",
    issueCategory: "all",
  },
  hierarchyFilters: defaultHierarchyFilters,
  isFullscreen: false,
  isLineCardMinimized: false,
  showLineDetailCard: false,
  showPatrolCard: true,
  kpi: kpiMetrics,
  setSelectedLine: (line) =>
    set({
      selectedLine: line,
      lastSelectedLine: line ?? get().lastSelectedLine,
      showLineDetailCard: line ? true : get().showLineDetailCard,
      isLineCardMinimized: false,
    }),
  setHoveredLine: (line) => set({ hoveredLine: line }),
  closeLineDetail: () =>
    set({ selectedLine: null, showLineDetailCard: false, isLineCardMinimized: false }),
  openLineDetail: () => {
    const last = get().lastSelectedLine;
    if (last) {
      set({ selectedLine: last, showLineDetailCard: true, isLineCardMinimized: false });
    }
  },
  toggleLineCardMinimized: () =>
    set((state) => ({ isLineCardMinimized: !state.isLineCardMinimized })),
  togglePatrolCard: () => set((state) => ({ showPatrolCard: !state.showPatrolCard })),
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  setHierarchyFilters: (hierarchyFilters) => set({ hierarchyFilters }),
  toggleVoltage: (voltage) =>
    set((state) => {
      const voltages = state.filters.voltages.includes(voltage)
        ? state.filters.voltages.filter((v) => v !== voltage)
        : [...state.filters.voltages, voltage];
      return { filters: { ...state.filters, voltages } };
    }),
  setFullscreen: (value) => set({ isFullscreen: value }),
  getFilteredLines: () => {
    const { lines, filters, hierarchyFilters } = get();
    return lines.filter((line) => matchesFilters(line, filters, hierarchyFilters));
  },
}));

export function useIssueBreakdown() {
  const lines = useTransmissionLineStore((s) => s.lines);
  let vegetation = 0;
  let hotspots = 0;
  let insulators = 0;

  for (const line of lines) {
    for (const issue of line.issues) {
      if (issue.type === "Vegetation") vegetation++;
      if (issue.type === "Hotspot") hotspots++;
      if (issue.type === "Insulator") insulators++;
    }
  }

  return { vegetation, hotspots, insulators };
}

export function useHealthDistribution() {
  const lines = useTransmissionLineStore((s) => s.lines);
  const optimal = lines.filter((l) => l.health_score >= 85).length;
  const warning = lines.filter((l) => l.health_score >= 60 && l.health_score < 85).length;
  const critical = lines.filter((l) => l.health_score < 60).length;
  return { optimal, warning, critical };
}
