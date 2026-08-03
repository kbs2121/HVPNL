"use client";

import type { Substation } from "@/lib/data/powerGridData";
import type { MapTheme } from "@/lib/powerGrid/mapThemes";
import { cn } from "@/lib/utils";

interface SubstationHoverCardProps {
  substation: Substation;
  x: number;
  y: number;
  theme?: MapTheme;
}

export function SubstationHoverCard({ substation, x, y, theme = "dark" }: SubstationHoverCardProps) {
  const statusColor =
    substation.status === "Overload Alert"
      ? "text-red-400"
      : substation.status === "Active"
        ? substation.loadPct >= 85
          ? "text-amber-400"
          : "text-emerald-400"
        : substation.status === "Maintenance"
          ? "text-amber-400"
          : "text-slate-400";

  const zoneLabel = substation.zone.includes("—")
    ? substation.zone.split("—")[0].trim()
    : substation.zone;

  return (
    <div
      className="pointer-events-none absolute z-[2000] w-80 -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y - 14 }}
    >
      <div
        className={cn(
          "dt-glass rounded-2xl p-4 shadow-glow-cyan",
          theme === "light" && "border-indigo-200/40 bg-white/90 text-slate-900",
          theme === "satellite" && "border-cyan-500/30 bg-[rgba(8,12,24,0.92)]"
        )}
      >
        <div className="mb-3 border-b border-white/10 pb-2">
          <h3 className="text-sm font-semibold text-cyan-300">
            {substation.name}, {substation.location}
          </h3>
        </div>

        <div className="space-y-2.5 text-[11px]">
          <Row label="Hierarchy Path" theme={theme}>
            <span className="text-text-secondary">
              {zoneLabel} ➔ {substation.circle} ➔ {substation.division}
            </span>
          </Row>
          <Row label="Incoming Power" theme={theme}>
            <span className="font-semibold text-cyan-400">{substation.incomingPower}</span>
          </Row>
          <Row label="Step-Down Voltage" theme={theme}>
            <span className="text-text-secondary">{substation.voltageTransform}</span>
          </Row>
          <Row label="Operational Status" theme={theme}>
            <span className={statusColor}>
              {substation.status} | Capacity: {substation.loadPct}%
            </span>
          </Row>
        </div>

        <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[rgba(10,15,26,0.75)]" />
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  theme,
}: {
  label: string;
  children: React.ReactNode;
  theme: MapTheme;
}) {
  return (
    <div>
      <p
        className={cn(
          "mb-0.5 text-[10px] font-medium uppercase tracking-wider text-text-muted",
          theme === "light" && "text-slate-500"
        )}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
