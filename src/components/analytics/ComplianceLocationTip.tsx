"use client";

import { MapPin } from "lucide-react";
import type { ComplianceLocation } from "@/lib/data/analyticsCompliance";
import { cn } from "@/lib/utils";

interface LocationTooltipPanelProps {
  locations: ComplianceLocation[];
  moreSiteCount?: number;
  className?: string;
}

export function LocationTooltipPanel({
  locations,
  moreSiteCount = 0,
  className,
}: LocationTooltipPanelProps) {
  if (locations.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-[100] mt-1.5 hidden min-w-[10rem] max-w-64 rounded-lg border border-cyan-500/25 bg-[#0c1424] px-3 py-2.5 shadow-xl shadow-black/40 group-hover/loc:block",
        className
      )}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
        <MapPin className="h-3 w-3 shrink-0 text-red-400" />
        Locations
      </p>
      <ul className="space-y-1">
        {locations.map((loc) => (
          <li key={loc.code} className="text-xs leading-snug text-slate-200">
            {loc.substation}
          </li>
        ))}
      </ul>
      {moreSiteCount > 0 && (
        <p className="mt-1.5 text-[10px] text-slate-500">+ {moreSiteCount} more</p>
      )}
    </div>
  );
}

interface ComplianceLocationTipProps {
  locations: ComplianceLocation[];
  moreSiteCount?: number;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
}

export function ComplianceLocationTip({
  locations,
  moreSiteCount = 0,
  children,
  className,
  panelClassName,
}: ComplianceLocationTipProps) {
  if (locations.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("group/loc relative", className)}>
      {children}
      <LocationTooltipPanel
        locations={locations}
        moreSiteCount={moreSiteCount}
        className={cn("left-0", panelClassName)}
      />
    </div>
  );
}
