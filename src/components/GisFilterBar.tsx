"use client";

import { useMemo, useState } from "react";
import { Filter, MapPin, RotateCcw, Zap, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getCircleOptions,
  getDivisionOptions,
  getSubstationOptions,
  getZoneOptions,
  normalizeZone,
} from "@/lib/data/hierarchyFilters";
import { SUBSTATIONS, type Substation, type VoltageLevel } from "@/lib/data/powerGridData";
import {
  GENERATION_SOURCES,
  GRID_LEVEL_OPTIONS,
  filterSourcesByGridLevel,
  type GenerationSource,
  type GridLevelFilter,
} from "@/data/generationSources";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

export interface GisFilters {
  zone: string;
  circle: string;
  division: string;
  substationCode: string;
  voltage: string;
  gridLevel: GridLevelFilter;
}

export const DEFAULT_GIS_FILTERS: GisFilters = {
  zone: "All",
  circle: "All",
  division: "All",
  substationCode: "All",
  voltage: "All",
  gridLevel: "all",
};

function matchesHierarchy(ss: Substation, filters: GisFilters): boolean {
  if (filters.zone !== "All" && normalizeZone(ss.zone) !== filters.zone) return false;
  if (filters.circle !== "All" && ss.circle !== filters.circle) return false;
  if (filters.division !== "All" && ss.division !== filters.division) return false;
  if (filters.voltage !== "All" && ss.voltage !== filters.voltage) return false;
  if (filters.substationCode !== "All" && String(ss.code) !== filters.substationCode) {
    return false;
  }
  return true;
}

function matchesGridLevel(ss: Substation, level: GridLevelFilter): boolean {
  if (level === "all") return true;
  if (level === "generating" || level === "interstate") return false;
  if (level === "400kv") return ss.voltage === "400kV";
  if (level === "220kv") return ss.voltage === "220kV";
  if (level === "distribution") return ss.voltage === "132kV" || ss.voltage === "66kV";
  return true;
}

export function getVisibleSubstations(filters: GisFilters): Substation[] {
  const regionScoped =
    filters.zone !== "All" || filters.circle !== "All" || filters.division !== "All";

  let list = SUBSTATIONS.filter((ss) => matchesHierarchy(ss, filters));

  if (!regionScoped && filters.voltage === "All" && filters.substationCode === "All") {
    if (filters.gridLevel === "all") {
      list = list.filter((ss) => ss.voltage === "400kV" || ss.voltage === "220kV");
    }
  }

  list = list.filter((ss) => matchesGridLevel(ss, filters.gridLevel));
  return list;
}

export function getVisibleGenerationSources(filters: GisFilters): GenerationSource[] {
  const sources = filterSourcesByGridLevel(filters.gridLevel);

  const regionScoped =
    filters.zone !== "All" || filters.circle !== "All" || filters.division !== "All";
  if (!regionScoped) return sources;

  const regionCodes = new Set(
    SUBSTATIONS.filter((ss) => matchesHierarchy(ss, { ...filters, gridLevel: "all" })).map(
      (s) => s.code
    )
  );

  return sources.filter(
    (src) =>
      regionCodes.has(src.connectedSubstationCode) ||
      (src.distributionCodes ?? []).some((c) => regionCodes.has(c))
  );
}

export function GisFilterBar({
  filters,
  onChange,
  onReset,
  onSubstationSelect,
  visibleCount,
  totalCount = SUBSTATIONS.length,
  sourceCount = GENERATION_SOURCES.length,
  theme = "dark",
}: {
  filters: GisFilters;
  onChange: (next: GisFilters) => void;
  onReset: () => void;
  onSubstationSelect: (code: string) => void;
  visibleCount: number;
  totalCount?: number;
  sourceCount?: number;
  theme?: MapTheme;
}) {
  const isLight = theme === "light";
  const [isExpanded, setIsExpanded] = useState(true);

  const zones = useMemo(() => getZoneOptions(), []);
  const circles = useMemo(() => getCircleOptions(filters.zone), [filters.zone]);
  const divisions = useMemo(
    () => getDivisionOptions(filters.zone, filters.circle),
    [filters.zone, filters.circle]
  );
  const substations = useMemo(
    () =>
      getSubstationOptions(
        filters.zone,
        filters.circle,
        filters.division,
        filters.voltage === "All" ? "All" : filters.voltage
      ),
    [filters.zone, filters.circle, filters.division, filters.voltage]
  );

  const update = (patch: Partial<GisFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleZone = (zone: string) => {
    update({ zone, circle: "All", division: "All", substationCode: "All" });
  };

  const handleCircle = (circle: string) => {
    update({ circle, division: "All", substationCode: "All" });
  };

  const handleDivision = (division: string) => {
    update({ division, substationCode: "All" });
  };

  const handleSubstation = (code: string) => {
    update({ substationCode: code });
    if (code !== "All") onSubstationSelect(code);
  };

  const isFiltered =
    filters.zone !== "All" ||
    filters.circle !== "All" ||
    filters.division !== "All" ||
    filters.substationCode !== "All" ||
    filters.voltage !== "All" ||
    filters.gridLevel !== "all";

  const selectClass = cn(
    "h-6.5 w-full min-w-0 rounded-md px-1.5 py-0 text-[10.5px] font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-45 truncate",
    isLight
      ? "border border-slate-300 bg-white/90 text-slate-900 shadow-xs focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 hover:border-slate-400"
      : "border border-slate-700/70 bg-slate-950/80 text-slate-200 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 hover:border-cyan-500/40"
  );

  return (
    <div className="pointer-events-auto w-full">
      <motion.div
        layout
        className={cn(
          "rounded-xl shadow-xl backdrop-blur-xl transition-all duration-300 overflow-hidden",
          isLight
            ? "border border-slate-200/90 bg-white/95 text-slate-900"
            : "border border-cyan-500/20 bg-slate-950/85 text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        )}
      >
        {/* Top Control Bar with Compact Meta + Toggle Button */}
        <div className="flex h-8 items-center justify-between gap-2 px-2.5 py-1">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition",
                isLight
                  ? "bg-cyan-100/80 text-cyan-800 hover:bg-cyan-200/80"
                  : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30"
              )}
            >
              <Filter className="h-3 w-3 text-cyan-400" />
              <span>Hierarchy Filters</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 opacity-70" />
              ) : (
                <ChevronDown className="h-3 w-3 opacity-70" />
              )}
            </button>

            <div className="flex min-w-0 items-center gap-1.5 text-[10px]">
              <span className={cn(isLight ? "text-slate-400" : "text-slate-600")}>•</span>
              <p
                className={cn(
                  "truncate font-mono text-[10px]",
                  isLight ? "text-slate-700 font-medium" : "text-slate-300"
                )}
              >
                <span className="font-semibold text-cyan-400">{visibleCount}</span>/{totalCount} SS
                · <span className="font-semibold text-cyan-400">{sourceCount}</span> sources
                {!isFiltered ? " (400/220kV)" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isFiltered && (
              <button
                type="button"
                onClick={onReset}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition shadow-xs",
                  isLight
                    ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    : "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                )}
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition",
                isLight
                  ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
              title={isExpanded ? "Collapse Filters" : "Expand Filters"}
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Filters Row — Always strictly 1 horizontal row across all screen sizes */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-white/10 px-2.5 py-1.5"
            >
              <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                <FilterSelect
                  label="Zone"
                  icon={<MapPin className="h-2 w-2" />}
                  value={filters.zone}
                  onChange={handleZone}
                  isLight={isLight}
                  selectClass={selectClass}
                  options={[
                    { value: "All", label: "All Zones" },
                    ...zones.map((z) => ({ value: z, label: z })),
                  ]}
                />

                <FilterSelect
                  label="Circle"
                  value={filters.circle}
                  onChange={handleCircle}
                  isLight={isLight}
                  selectClass={selectClass}
                  options={[
                    { value: "All", label: "All Circles" },
                    ...circles.map((c) => ({ value: c, label: c })),
                  ]}
                />

                <FilterSelect
                  label="Division"
                  value={filters.division}
                  onChange={handleDivision}
                  isLight={isLight}
                  selectClass={selectClass}
                  options={[
                    { value: "All", label: "All Divisions" },
                    ...divisions.map((d) => ({ value: d, label: d })),
                  ]}
                />

                <FilterSelect
                  label="Substation"
                  value={filters.substationCode}
                  onChange={handleSubstation}
                  isLight={isLight}
                  selectClass={selectClass}
                  options={[
                    { value: "All", label: "All Substations" },
                    ...substations.map((s) => ({
                      value: String(s.code),
                      label: `${s.name} (${s.code})`,
                    })),
                  ]}
                />

                <FilterSelect
                  label="Voltage"
                  icon={<Zap className="h-2 w-2" />}
                  value={filters.voltage}
                  onChange={(voltage) =>
                    update({ voltage: voltage as VoltageLevel | "All", substationCode: "All" })
                  }
                  isLight={isLight}
                  selectClass={selectClass}
                  options={[
                    { value: "All", label: "All Voltages" },
                    { value: "400kV", label: "400 kV" },
                    { value: "220kV", label: "220 kV" },
                    { value: "132kV", label: "132 kV" },
                    { value: "66kV", label: "66 kV" },
                  ]}
                />

                <FilterSelect
                  label="Grid Level / Source"
                  value={filters.gridLevel}
                  onChange={(v) => update({ gridLevel: v as GridLevelFilter })}
                  isLight={isLight}
                  selectClass={selectClass}
                  options={GRID_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />

                <div className="flex shrink-0 flex-col gap-0.5 min-w-[110px]">
                  <span
                    className={cn(
                      "flex h-2.5 items-center gap-1 text-[8px] font-bold uppercase tracking-wider",
                      isLight ? "text-slate-600" : "text-cyan-400/90"
                    )}
                  >
                    <Sparkles className="h-2 w-2" />
                    Quick Preset
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        zone: "All",
                        circle: "All",
                        division: "All",
                        substationCode: "All",
                        voltage: "All",
                        gridLevel: "all",
                      })
                    }
                    className={cn(
                      "h-6.5 w-full rounded-md px-2 text-[10px] font-bold transition truncate border",
                      isLight
                        ? "border-cyan-400 bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
                        : "border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 hover:bg-cyan-500/30"
                    )}
                  >
                    Major 400/220 kV
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon,
  disabled,
  isLight,
  selectClass,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  disabled?: boolean;
  isLight?: boolean;
  selectClass: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 shrink-0 flex-col gap-0.5">
      <label
        className={cn(
          "flex h-2.5 items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider truncate",
          isLight ? "text-slate-600" : "text-cyan-400/90"
        )}
      >
        {icon}
        <span className="truncate">{label}</span>
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
