"use client";

import { Calendar } from "lucide-react";
import { useMemo } from "react";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";
import {
  getCircleOptions,
  getDivisionOptions,
  getSubstationOptions,
  getZoneOptions,
  type DateRangeOption,
  type HierarchyFilters,
} from "@/lib/data/hierarchyFilters";
import { cn } from "@/lib/utils";

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-[#0F172A] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-cyan-500";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, disabled && "cursor-not-allowed opacity-50")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SubstationHierarchyFilterBar() {
  const hierarchyFilters = useSubstationTwinStore((s) => s.hierarchyFilters);
  const setHierarchyFilters = useSubstationTwinStore((s) => s.setHierarchyFilters);

  const zones = useMemo(() => getZoneOptions(), []);
  const circles = useMemo(
    () => getCircleOptions(hierarchyFilters.zone),
    [hierarchyFilters.zone]
  );
  const divisions = useMemo(
    () => getDivisionOptions(hierarchyFilters.zone, hierarchyFilters.circle),
    [hierarchyFilters.zone, hierarchyFilters.circle]
  );
  const substationList = useMemo(
    () =>
      getSubstationOptions(
        hierarchyFilters.zone,
        hierarchyFilters.circle,
        hierarchyFilters.division,
        hierarchyFilters.voltage
      ),
    [
      hierarchyFilters.zone,
      hierarchyFilters.circle,
      hierarchyFilters.division,
      hierarchyFilters.voltage,
    ]
  );

  const handleChange = (field: keyof HierarchyFilters, value: string) => {
    const updated: HierarchyFilters = { ...hierarchyFilters, [field]: value };

    if (field === "zone") {
      updated.circle = "All";
      updated.division = "All";
      updated.substation = "All";
    } else if (field === "circle") {
      updated.division = "All";
      updated.substation = "All";
    } else if (field === "division") {
      updated.substation = "All";
    } else if (field === "voltage") {
      updated.substation = "All";
    }

    setHierarchyFilters(updated);
  };

  return (
    <div className="shrink-0 border-b border-border-subtle bg-surface-800/60 px-4 py-2">
      <div className="rounded-xl border border-slate-700/60 bg-[#1E293B] p-2.5 shadow-lg">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <FilterSelect
            label="Zone Name"
            value={hierarchyFilters.zone}
            onChange={(v) => handleChange("zone", v)}
            options={[
              { value: "All", label: "All" },
              ...zones.map((z) => ({ value: z, label: z })),
            ]}
          />

          <FilterSelect
            label="Circle Name"
            value={hierarchyFilters.circle}
            onChange={(v) => handleChange("circle", v)}
            options={[
              { value: "All", label: "All" },
              ...circles.map((c) => ({ value: c, label: c })),
            ]}
          />

          <FilterSelect
            label="Division Name"
            value={hierarchyFilters.division}
            onChange={(v) => handleChange("division", v)}
            options={[
              { value: "All", label: "All" },
              ...divisions.map((d) => ({ value: d, label: d })),
            ]}
          />

          <FilterSelect
            label="Sub Station Name"
            value={hierarchyFilters.substation}
            onChange={(v) => handleChange("substation", v)}
            options={[
              { value: "All", label: "All" },
              ...substationList.map((s) => ({ value: s.name, label: s.name })),
            ]}
          />

          <FilterSelect
            label="Voltage Level"
            value={hierarchyFilters.voltage}
            onChange={(v) => handleChange("voltage", v)}
            options={[
              { value: "All", label: "All" },
              { value: "400kV", label: "400kV" },
              { value: "220kV", label: "220kV" },
              { value: "132kV", label: "132kV" },
              { value: "66kV", label: "66kV" },
            ]}
          />

          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Date Range
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <select
                value={hierarchyFilters.dateRange}
                onChange={(e) =>
                  handleChange("dateRange", e.target.value as DateRangeOption)
                }
                className={cn(selectClass, "pl-9")}
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
