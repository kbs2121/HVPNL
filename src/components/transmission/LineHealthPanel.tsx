"use client";

import { Calendar, Leaf, Thermometer, Zap } from "lucide-react";
import {
  useHealthDistribution,
  useIssueBreakdown,
} from "@/hooks/useTransmissionLineStore";
import { scheduledMaintenance } from "@/lib/data/mockTransmissionLines";
import { formatDate } from "@/lib/utils";

export function LineHealthPanel() {
  const { optimal, warning, critical } = useHealthDistribution();
  const { vegetation, hotspots, insulators } = useIssueBreakdown();
  const total = optimal + warning + critical;

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col overflow-hidden border-r border-border-subtle bg-surface-800/50">
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">Line Health & Issues</h2>
        <p className="text-[11px] text-text-muted">Corridor integrity overview</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="mb-3 text-xs font-medium text-text-secondary">
            Line Health Index Distribution
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Optimal (Health ≥ 85%)", count: optimal, color: "bg-emerald-500" },
              { label: "Warning (60% – 84%)", count: warning, color: "bg-amber-500" },
              { label: "Critical (< 60%)", count: critical, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-semibold text-text-primary">{item.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-600">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${total ? (item.count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <h3 className="mb-3 text-xs font-medium text-text-secondary">
            Active Issues Categorization
          </h3>
          <div className="space-y-2">
            {[
              { icon: Leaf, label: "Vegetation Encroachment", count: vegetation, color: "text-emerald-400" },
              { icon: Thermometer, label: "Hotspots / Thermal Anomaly", count: hotspots, color: "text-red-400" },
              { icon: Zap, label: "Insulator Degradation", count: insulators, color: "text-amber-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-surface-700/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span className="text-[11px] text-text-secondary">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled Shutdown Maintenance
          </h3>
          <ul className="space-y-2">
            {scheduledMaintenance.map((item) => (
              <li
                key={item.line_name}
                className="rounded-lg border border-border-subtle bg-surface-700/40 px-3 py-2"
              >
                <p className="text-[11px] font-medium text-text-primary line-clamp-2">
                  {item.line_name}
                </p>
                <p className="mt-0.5 text-[10px] text-amber-400">
                  {formatDate(item.date)} ({item.time})
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
