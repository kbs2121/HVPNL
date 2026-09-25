"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IncidentStatus, SubstationAsset } from "@/lib/data/adhounSubstationAssets";
import { OFFICER_OPTIONS } from "@/lib/data/adhounSubstationAssets";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";
import { cn } from "@/lib/utils";

type TabId = "OVERVIEW" | "LOGS" | "ASSIGN";

export function AssetActionModal() {
  const asset = useSubstationTwinStore((s) => s.selectedAsset);
  const setSelectedAsset = useSubstationTwinStore((s) => s.setSelectedAsset);
  const acknowledgeAlert = useSubstationTwinStore((s) => s.acknowledgeAlert);
  const acknowledgedAlerts = useSubstationTwinStore((s) => s.acknowledgedAlerts);
  const incidents = useSubstationTwinStore((s) => s.incidents);
  const saveIncidentLog = useSubstationTwinStore((s) => s.saveIncidentLog);
  const openCrewDrawer = useSubstationTwinStore((s) => s.openCrewDrawer);

  const [activeTab, setActiveTab] = useState<TabId>("OVERVIEW");
  const [status, setStatus] = useState<IncidentStatus>("Open");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!asset) return;
    const existing = incidents[asset.id];
    setActiveTab("OVERVIEW");
    setStatus(existing?.status ?? (asset.status === "NORMAL" ? "Resolved" : "Open"));
    setAssignedTo(existing?.assignedTo ?? "");
    setNotes(existing?.notes ?? "");
    setSaved(false);
  }, [asset, incidents]);

  if (!asset) return null;

  const isAcknowledged = acknowledgedAlerts[asset.id] === "Acknowledged";
  const hasWarning = asset.status === "WARNING" || asset.status === "CRITICAL";
  const sparkline = asset.telemetrySparkline ?? [];
  const measured =
    asset.measuredValue ??
    asset.telemetry.voltage ??
    asset.telemetry.windingTemp ??
    asset.telemetry.mvar ??
    "—";
  const nominal =
    asset.nominalValue ??
    asset.telemetry.currentLoad?.replace(" nominal", "") ??
    "—";

  const handleAcknowledge = () => {
    acknowledgeAlert(asset.id);
  };

  const handleSave = () => {
    saveIncidentLog(asset.id, { status, assignedTo, notes });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setSelectedAsset(null)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#1E293B] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-700 bg-[#0F172A] p-4">
          <div>
            {hasWarning && (
              <span
                className={cn(
                  "font-mono text-xs font-bold",
                  isAcknowledged ? "text-slate-400" : "text-amber-400"
                )}
              >
                {isAcknowledged ? "✓ ACKNOWLEDGED" : "⚠️ ACTIVE WARNING"}
              </span>
            )}
            {!hasWarning && (
              <span className="font-mono text-xs font-bold text-emerald-400">
                ✅ ASSET NORMAL
              </span>
            )}
            <h2 className="text-lg font-bold">{asset.name}</h2>
            <p className="text-xs text-slate-400">
              ID: {asset.id} · Zone: {asset.zone}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAsset(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-700 bg-slate-800/40 text-xs font-semibold">
          {(
            [
              { id: "OVERVIEW" as const, label: "Overview & Actions" },
              {
                id: "LOGS" as const,
                label: `Maintenance Logs (${asset.maintenanceLogs.length})`,
              },
              { id: "ASSIGN" as const, label: "Assign & Status" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 border-b-2 py-2.5 text-center transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 bg-slate-800/80 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5 text-sm">
          {activeTab === "OVERVIEW" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
                <div>
                  <span className="text-xs text-slate-400">Measured Value</span>
                  <p className="text-base font-bold text-amber-400">{measured}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Nominal Threshold</span>
                  <p className="text-base font-bold text-slate-200">{nominal}</p>
                </div>
                {asset.telemetry.windingTemp && (
                  <div>
                    <span className="text-xs text-slate-400">Winding Temp</span>
                    <p className="text-base font-bold text-red-400">
                      {asset.telemetry.windingTemp}
                    </p>
                  </div>
                )}
              </div>

              {sparkline.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    60-Minute Telemetry Trend
                  </p>
                  <div className="h-[100px] rounded-xl border border-slate-700/50 bg-slate-800/30 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkline}>
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="time"
                          tick={{ fill: "#64748b", fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#64748b", fontSize: 9 }}
                          axisLine={false}
                          tickLine={false}
                          width={36}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: 8,
                            fontSize: 11,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#f59e0b"
                          fill="url(#sparkGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {asset.alarms.length > 0 && (
                <ul className="space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                  {asset.alarms.map((alarm) => (
                    <li key={alarm}>[⚠️] {alarm}</li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  disabled={isAcknowledged || !hasWarning}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isAcknowledged ? "Alert Acknowledged" : "Acknowledge Alert"}
                </button>
                <button
                  type="button"
                  onClick={() => openCrewDrawer(asset.id)}
                  className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold shadow hover:bg-amber-700"
                >
                  Dispatch Crew
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold shadow hover:bg-slate-600"
                >
                  Create PTW
                </button>
              </div>
            </div>
          )}

          {activeTab === "LOGS" && (
            <div className="space-y-3">
              {asset.maintenanceLogs.map((log) => (
                <div
                  key={`${log.date}-${log.title}`}
                  className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 text-xs"
                >
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>{log.title}</span>
                    <span
                      className={cn(
                        log.outcome === "Passed" || log.outcome === "Normal"
                          ? "text-emerald-400"
                          : "text-cyan-400"
                      )}
                    >
                      {log.outcome}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-400">
                    Logged on {log.date} by {log.loggedBy}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "ASSIGN" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block text-slate-400">
                  Assign Responsible Officer
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200"
                >
                  {OFFICER_OPTIONS.map((opt) => (
                    <option key={opt.value || "none"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">Incident Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Inspection">Under Inspection</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-slate-400">
                  Comments & Handover Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='e.g. "Voltage dip attributed to upstream feeder trip at 16:45"'
                  className="h-20 w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="mt-2 w-full rounded-lg bg-emerald-600 py-2 font-bold text-white transition hover:bg-emerald-700"
              >
                {saved ? "✓ Incident Log Saved" : "Save Incident Log"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
