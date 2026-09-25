"use client";

import { Calendar } from "lucide-react";
import { useMemo } from "react";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";
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
  "w-full rounded-md border border-slate-700/80 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200 outline-none transition focus:border-cyan-500 truncate h-6.5";

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
    <div className="flex min-w-0 flex-1 shrink-0 flex-col gap-0.5">
      <label className="text-[8px] font-bold uppercase tracking-wider text-cyan-400/90 truncate">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, disabled && "cursor-not-allowed opacity-50")}
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

export function HierarchyFilterBar() {
  const hierarchyFilters = useTransmissionLineStore((s) => s.hierarchyFilters);
  const setHierarchyFilters = useTransmissionLineStore((s) => s.setHierarchyFilters);

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
    <div className="shrink-0 border-b border-border-subtle bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
      <div className="rounded-xl border border-cyan-500/20 bg-slate-900/80 p-1.5 shadow-lg">
        <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto scrollbar-none">
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
            disabled={hierarchyFilters.zone === "All" && circles.length === 0}
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

          <div className="flex min-w-0 flex-1 shrink-0 flex-col gap-0.5">
            <label className="text-[8px] font-bold uppercase tracking-wider text-cyan-400/90 truncate">
              Date
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-cyan-400" />
              <select
                value={hierarchyFilters.dateRange}
                onChange={(e) =>
                  handleChange("dateRange", e.target.value as DateRangeOption)
                }
                className={cn(selectClass, "pl-7")}
              >
                <option value="Today" className="bg-slate-900 text-slate-100">Today</option>
                <option value="Last 7 Days" className="bg-slate-900 text-slate-100">Last 7 Days</option>
                <option value="Last 30 Days" className="bg-slate-900 text-slate-100">Last 30 Days</option>
                <option value="Custom Range" className="bg-slate-900 text-slate-100">Custom Range</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
