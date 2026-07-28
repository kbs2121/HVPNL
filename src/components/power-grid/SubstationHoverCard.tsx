"use client";

import type { Substation } from "@/lib/data/powerGridData";

interface SubstationHoverCardProps {
  substation: Substation;
  x: number;
  y: number;
}

export function SubstationHoverCard({ substation, x, y }: SubstationHoverCardProps) {
  const statusColor =
    substation.status === "Active"
      ? "text-emerald-400"
      : substation.status === "Maintenance"
        ? "text-amber-400"
        : "text-slate-400";

  return (
    <div
      className="pointer-events-none absolute z-[2000] w-72 -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y - 12 }}
    >
      <div className="dt-glass rounded-2xl p-4 shadow-glow-cyan">
        <div className="mb-3 border-b border-white/10 pb-2">
          <h3 className="text-sm font-semibold text-cyan-300">{substation.name}</h3>
          <p className="text-[11px] text-text-muted">{substation.location}</p>
        </div>

        <div className="space-y-2 text-[11px]">
          <Row label="Hierarchy">
            <span className="text-text-secondary">
              {substation.zone.split("—")[0].trim()} → {substation.circle} → {substation.division}
            </span>
          </Row>
          <Row label="Incoming Power">
            <span className="font-medium text-cyan-400">{substation.incomingPower}</span>
          </Row>
          <Row label="Voltage Transform">
            <span className="text-text-secondary">{substation.voltageTransform}</span>
          </Row>
          <Row label="Operational Status">
            <span className={statusColor}>
              Status: {substation.status} | Load: {substation.loadPct}%
            </span>
          </Row>
        </div>

        <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[rgba(10,15,26,0.75)]" />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
