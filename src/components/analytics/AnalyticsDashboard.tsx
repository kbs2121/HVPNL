"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Cable,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FilterX,
  Gauge,
  Layers,
  ListChecks,
  MapPin,
  RadioTower,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  DEFAULT_ANALYTICS_FILTERS,
  analyticsFilterOptions,
  buildAnalyticsSnapshot,
  formatINR,
  formatINRLakhs,
  type AnalyticsFilters,
  type AnalyticsSnapshot,
  type AssetKind,
  type ComplianceStatus,
  type MaintenanceRecord,
} from "@/lib/data/analyticsCompliance";
import { ComplianceLocationTip, LocationTooltipPanel } from "@/components/analytics/ComplianceLocationTip";
import { AnalyticsThemeToggle } from "@/components/analytics/AnalyticsThemeToggle";
import { useAnalyticsTheme } from "@/hooks/useAnalyticsTheme";
import type { AnalyticsUiTokens, AnalyticsThemeMode } from "@/lib/analytics/analyticsUiTheme";
import {
  ASSET_TONE,
  COMPLIANCE_LABEL_THEME,
  STATUS_PILL,
} from "@/lib/analytics/analyticsUiTheme";
import { PM_FREQUENCY_SHORT } from "@/lib/data/hvpnlComplianceFramework";
import { ExecutiveVerdictBanner } from "./ExecutiveVerdictBanner";
import { SafTrendChart } from "./SafTrendChart";
import { HealthDecayChart } from "./HealthDecayChart";
import { JurisdictionBenchmarkChart } from "./JurisdictionBenchmarkChart";
import { cn } from "@/lib/utils";

function statusStyle(status: ComplianceStatus, theme: AnalyticsThemeMode) {
  return STATUS_PILL[theme][status];
}

function assetTone(kind: AssetKind, theme: AnalyticsThemeMode) {
  return ASSET_TONE[theme][kind];
}

function complianceLabelStyle(label: string, theme: AnalyticsThemeMode) {
  return COMPLIANCE_LABEL_THEME[theme][label] ?? COMPLIANCE_LABEL_THEME[theme].PMC;
}

const selectBaseClass =
  "h-8 rounded-lg border px-2 text-xs outline-none transition-colors";

function safAccent(
  status: AnalyticsSnapshot["saf"]["status"],
  theme: "light" | "dark"
): string {
  if (status === "breach" || status === "at_risk") {
    return theme === "dark" ? "text-red-400" : "text-red-600";
  }
  if (status === "incentive") {
    return theme === "dark" ? "text-emerald-400" : "text-emerald-600";
  }
  return theme === "dark" ? "text-cyan-400" : "text-sky-700";
}

const ASSET_KIND_META: Record<
  AssetKind,
  { label: string; icon: typeof Building2 }
> = {
  substation: { label: "GSS", icon: Building2 },
  line: { label: "Line", icon: Cable },
  tower: { label: "Tower", icon: RadioTower },
};

function StatusPill({ status, theme }: { status: ComplianceStatus; theme: AnalyticsThemeMode }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        statusStyle(status, theme)
      )}
    >
      {status}
    </span>
  );
}

function SiteCountBadge({ count, theme }: { count: number; theme: AnalyticsThemeMode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tabular-nums",
        theme === "dark"
          ? "border-red-500/20 bg-red-500/10 text-red-400"
          : "border-red-200 bg-red-50 text-red-700 shadow-sm"
      )}
    >
      <MapPin className={cn("h-3 w-3", theme === "dark" ? "text-red-400" : "text-red-600")} />
      {count}
    </span>
  );
}

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_ANALYTICS_FILTERS);
  const [activeTab, setActiveTab] = useState<"insights" | "jurisdiction" | "protocols" | "queue">("insights");
  const [pmOpen, setPmOpen] = useState<string | null>("daily_weekly");
  const [snap, setSnap] = useState<AnalyticsSnapshot | null>(null);
  const { theme, toggle, ui } = useAnalyticsTheme();
  const options = useMemo(() => analyticsFilterOptions(filters), [filters]);

  useEffect(() => {
    setSnap(buildAnalyticsSnapshot(filters));
  }, [filters]);

  const update = (patch: Partial<AnalyticsFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const clearFilters = () => setFilters(DEFAULT_ANALYTICS_FILTERS);

  const hasActiveFilters =
    filters.zone !== "All" ||
    filters.circle !== "All" ||
    filters.division !== "All" ||
    filters.assetKind !== "all";

  if (!snap) {
    return (
      <div className={cn("relative flex min-h-0 flex-1 items-center justify-center", ui.page)}>
        <div className={cn("absolute inset-0", ui.pageMesh)} />
        <p className={cn("relative text-sm", ui.muted)}>Loading compliance intelligence…</p>
      </div>
    );
  }

  const { saf } = snap;
  const { locations: safLoc } = saf;
  const safAchievedPct =
    safLoc.totalGss > 0 ? Math.round((safLoc.achievedCount / safLoc.totalGss) * 1000) / 10 : 0;

  const safColor = safAccent(saf.status, theme);

  const safKpiTheme =
    saf.status === "breach" || saf.status === "at_risk"
      ? "red"
      : saf.status === "incentive"
      ? "emerald"
      : "cyan";

  const exposureTotal = snap.totals.fineExposureINR + snap.totals.wearTearINR;

  const pmByFreq = {
    daily_weekly: snap.pmChecklist.filter((r) => r.frequency === "daily_weekly"),
    monthly_quarterly: snap.pmChecklist.filter((r) => r.frequency === "monthly_quarterly"),
    annual_biennial: snap.pmChecklist.filter((r) => r.frequency === "annual_biennial"),
  };

  const topConsequences = [
    saf.gapToNormative < 0 && {
      title: "Below HERC normative floor",
      body: `Fleet SAF is ${Math.abs(saf.gapToNormative)}% under the ${saf.normativeTarget}% minimum — HVPNL may under-recover ARR from discoms at true-up.`,
    },
    snap.totals.overdueOrMissed > 0 && {
      title: "Maintenance backlog accumulation",
      body: `${snap.totals.overdueOrMissed} PM items overdue or missed across GSS — raises forced outage, insulation puncture, and tripping risk.`,
    },
    saf.arrAtRiskINR > 0 && {
      title: "Direct ARR revenue exposure",
      body: `${formatINRLakhs(saf.arrAtRiskINR)} of annual revenue recovery (ARR) is at risk if SAF is not restored before the regulatory true-up.`,
    },
    {
      title: "Equipment diagnostic gaps",
      body: "Skipped DGA or relay tests can mask transformer faults and void manufacturer warranties and insurance claims.",
    },
  ].filter(Boolean) as { title: string; body: string }[];

  const tabs = [
    { id: "insights" as const, label: "Executive Insights & Trends", icon: Gauge, count: undefined },
    { id: "jurisdiction" as const, label: "Jurisdiction Benchmark", icon: BarChart3, count: snap.byCircle.length },
    { id: "protocols" as const, label: "Protocols & Testing", icon: ListChecks, count: snap.pmChecklist.length + snap.testingProtocols.length },
    { id: "queue" as const, label: "Priority Risk Queue", icon: AlertTriangle, count: snap.spotlight.length },
  ];

  return (
    <div
      className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-300", ui.page)}
      style={{ ["--ad-ring" as string]: theme === "dark" ? "#0a1018" : "#ffffff" }}
    >
      <div className={cn("absolute inset-0", ui.pageMesh)} />
      <div className={cn("pointer-events-none absolute inset-0", ui.pageGrid)} />

      {/* Header Bar */}
      <div className={cn("relative shrink-0 overflow-hidden border-b px-5 py-3.5", ui.header)}>
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r", ui.headerGlow)} />
        <div className={cn("pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full blur-3xl", ui.headerOrb)} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-400 shadow-sm">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h1
                className={cn(
                  "font-display text-lg font-bold uppercase tracking-[0.2em] sm:text-xl",
                  theme === "light"
                    ? ui.titleSolid
                    : cn("bg-gradient-to-r bg-clip-text text-transparent", ui.titleGradient)
                )}
              >
                Compliance Dashboard
              </h1>
            </div>
            <p className={cn("mt-0.5 text-[10px]", ui.muted)}>
              HVPNL 220/400 kV Transmission Network · Statutory & Operational Compliance Framework
            </p>
          </div>

          {/* Filters & Theme Toggle */}
          <div className="flex flex-wrap items-end gap-2">
            <FilterSelect
              label="Zone"
              value={filters.zone}
              onChange={(zone) => update({ zone, circle: "All", division: "All" })}
              options={["All", ...options.zones]}
              ui={ui}
            />
            <FilterSelect
              label="Circle"
              value={filters.circle}
              onChange={(circle) => update({ circle, division: "All" })}
              options={["All", ...options.circles]}
              ui={ui}
            />
            <FilterSelect
              label="Division"
              value={filters.division}
              onChange={(division) => update({ division })}
              options={["All", ...options.divisions]}
              ui={ui}
            />
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              title="Clear all filter selections"
              aria-label="Clear all filter selections"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                hasActiveFilters ? ui.clearBtn : cn(ui.clearBtnDisabled, "cursor-not-allowed opacity-50")
              )}
            >
              <FilterX className="h-3.5 w-3.5 shrink-0" />
              Clear
            </button>
            <AnalyticsThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin space-y-4">
        {/* 1. Executive Verdict & Decision Intelligence Banner */}
        <ExecutiveVerdictBanner
          snap={snap}
          theme={theme}
          ui={ui}
          onSelectTab={(tabKey) => {
            if (tabKey === "trends") setActiveTab("insights");
            else if (tabKey === "protocols") setActiveTab("protocols");
            else if (tabKey === "queue") setActiveTab("queue");
            else if (tabKey === "jurisdiction") setActiveTab("jurisdiction");
          }}
        />

        {/* 2. Top KPI Metric Band */}
        <div className={cn("rounded-2xl border p-3.5", ui.sectionBand)}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="System Availability (SAF)"
              value={`${saf.currentPct}%`}
              sub={`Target: ${saf.normativeTarget}% · Bonus: ${saf.incentiveTarget}%`}
              accent={safColor}
              theme={safKpiTheme}
              ui={ui}
              themeMode={theme}
              title="System Availability Factor for 220/400kV Grid"
            />
            <Kpi
              label="PM Compliance (PMC)"
              value={`${snap.totals.complianceScore}%`}
              sub={`${snap.totals.plannedMaintenance} scheduled maintenance tasks`}
              accent={theme === "dark" ? "text-emerald-400" : "text-emerald-700"}
              theme="emerald"
              ui={ui}
              themeMode={theme}
              title="Preventive Maintenance Compliance score"
            />
            <Kpi
              label="Overdue / Missed Tasks"
              value={String(snap.totals.overdueOrMissed)}
              sub={`${snap.totals.dueSoon} tasks due within 7 days`}
              accent={theme === "dark" ? "text-orange-400" : "text-orange-700"}
              theme="orange"
              ui={ui}
              themeMode={theme}
              title="Maintenance backlog requiring immediate work orders"
            />
            <Kpi
              label="Total Financial Exposure"
              value={formatINRLakhs(exposureTotal)}
              sub="Regulatory fines + accelerated equipment wear"
              accent={theme === "dark" ? "text-red-400" : "text-red-700"}
              theme="red"
              ui={ui}
              themeMode={theme}
              title="Combined financial risk from overdue compliance"
            />
          </div>
        </div>

        {/* 3. Insight-Driven Tab Navigation */}
        <div className={cn("flex flex-wrap items-center gap-1.5 rounded-xl border p-1", ui.tabsContainer)}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                  active ? ui.tabActive : ui.tabInactive
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-cyan-400" : "opacity-70")} />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[9px] font-bold tabular-nums",
                      active
                        ? theme === "dark" ? "bg-cyan-500/20 text-cyan-300" : "bg-sky-100 text-sky-800"
                        : theme === "dark" ? "bg-white/10 text-slate-400" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Executive Insights & Trends */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SafTrendChart saf={saf} theme={theme} ui={ui} />
              <HealthDecayChart decaySeries={snap.decaySeries} theme={theme} ui={ui} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Detailed Availability Breakdown */}
              <Card
                title="System Availability Factor (HERC True-Up Impact)"
                highlight={saf.status === "breach" || saf.status === "at_risk"}
                ui={ui}
                accent="red"
                themeMode={theme}
                icon={<Zap className="h-5 w-5 text-red-400" />}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-3xl font-extrabold tabular-nums", safColor)}>
                        {saf.currentPct}%
                      </span>
                      <span className={cn("text-xs font-medium", ui.muted)}>
                        Normative {saf.normativeTarget}% · Bonus {saf.incentiveTarget}%
                      </span>
                    </div>
                    <p className={cn("mt-1 text-[11px] leading-relaxed", ui.muted)}>
                      Percentage of hours the 220/400 kV network was energised and ready to carry transmission load.
                    </p>
                  </div>
                </div>

                {/* GSS location breakdown */}
                <div className={cn("mt-3 rounded-lg border p-3", ui.panelInset)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", ui.muted)}>
                        GSS Locations Meeting SAF ≥ {saf.normativeTarget}%
                      </span>
                    </div>
                    <span className={cn("text-xs font-semibold tabular-nums", ui.textSecondary)}>
                      {safLoc.achievedCount}
                      <span className="text-slate-500"> / </span>
                      {safLoc.totalGss} GSS
                    </span>
                  </div>
                  <div className={cn("mt-2.5 h-2.5 overflow-hidden rounded-full", ui.progressTrack)}>
                    <div className="flex h-full">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                        style={{ width: `${safAchievedPct}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all"
                        style={{ width: `${Math.max(0, 100 - safAchievedPct)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 text-center">
                      <p className="text-[9px] uppercase tracking-wide text-emerald-400 font-semibold">Achieved Normative</p>
                      <p className="text-sm font-bold tabular-nums text-emerald-300">{safLoc.achievedCount}</p>
                    </div>
                    <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-center">
                      <p className="text-[9px] uppercase tracking-wide text-amber-400 font-semibold">Below Floor</p>
                      <p className="text-sm font-bold tabular-nums text-amber-300">{safLoc.pendingCount}</p>
                    </div>
                    <div className={cn("rounded-md border px-2 py-1.5 text-center", ui.border, theme === "dark" ? "bg-white/[0.02]" : "bg-white")}>
                      <p className={cn("text-[9px] uppercase tracking-wide font-semibold", ui.muted)}>Bonus Tier (≥99.2%)</p>
                      <p className={cn("text-sm font-bold tabular-nums text-cyan-400")}>{safLoc.incentiveCount}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Metric
                    label="Gap to Normative"
                    value={`${saf.gapToNormative >= 0 ? "+" : ""}${saf.gapToNormative}%`}
                    warn={saf.gapToNormative < 0}
                    hint="Distance from HERC 98% floor"
                    ui={ui}
                    theme={theme}
                  />
                  <Metric
                    label="ARR Revenue at Risk"
                    value={saf.arrAtRiskINR > 0 ? formatINRLakhs(saf.arrAtRiskINR) : "None (Safe)"}
                    warn={saf.arrAtRiskINR > 0}
                    hint="Unrecovered fixed cost at annual true-up"
                    ui={ui}
                    theme={theme}
                  />
                </div>
              </Card>

              {/* Regulatory Consequences & Risk Impact */}
              <Card
                title="Regulatory & Operational Risk Assessment"
                icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
                ui={ui}
                accent="amber"
                themeMode={theme}
              >
                <div className="space-y-3">
                  {topConsequences.map((c) => (
                    <div key={c.title} className={cn("flex gap-3 rounded-lg border p-2.5", ui.panelInset)}>
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <p className={cn("text-xs font-semibold", ui.textSecondary)}>{c.title}</p>
                        <p className={cn("mt-0.5 text-[11px] leading-relaxed", ui.muted)}>{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Jurisdiction Intelligence */}
        {activeTab === "jurisdiction" && (
          <div className="space-y-4">
            <JurisdictionBenchmarkChart
              byCircle={snap.byCircle}
              byZone={snap.byZone}
              theme={theme}
              ui={ui}
            />

            {/* Jurisdiction Breakdown Table */}
            <Card
              title="Circle-Wise Compliance & Financial Exposure Roster"
              icon={<Building2 className="h-5 w-5 text-cyan-400" />}
              ui={ui}
              accent="cyan"
              themeMode={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={cn("text-[10px] uppercase tracking-wider", ui.muted, ui.tableHead)}>
                    <tr>
                      <th className="pb-2.5 pr-3 font-semibold">Circle</th>
                      <th className="pb-2.5 pr-3 font-semibold">Zone</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Substations</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Lines</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Avg Health</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Overdue PM</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Compliance</th>
                      <th className="pb-2.5 pr-3 font-semibold text-right">Fine Exposure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.byCircle.map((b) => (
                      <tr key={b.key} className={cn("border-t transition-colors", ui.borderSubtle, ui.rowHover)}>
                        <td className={cn("py-2.5 pr-3 font-semibold", ui.textSecondary)}>{b.key}</td>
                        <td className={cn("py-2.5 pr-3", ui.muted)}>{b.zone}</td>
                        <td className="py-2.5 pr-3 text-center tabular-nums">{b.substations}</td>
                        <td className="py-2.5 pr-3 text-center tabular-nums">{b.lines}</td>
                        <td className="py-2.5 pr-3 text-center">
                          <span
                            className={cn(
                              "font-bold tabular-nums",
                              b.avgHealth >= 80 ? "text-emerald-400" : b.avgHealth >= 60 ? "text-amber-400" : "text-red-400"
                            )}
                          >
                            {b.avgHealth}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-center">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              b.overdueCount > 0
                                ? theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                                : theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {b.overdueCount}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-center">
                          <span
                            className={cn(
                              "font-bold tabular-nums",
                              b.compliancePct >= 80 ? "text-emerald-400" : "text-amber-400"
                            )}
                          >
                            {b.compliancePct}%
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-amber-400">
                          {formatINR(b.fineExposureINR)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Protocols & Testing */}
        {activeTab === "protocols" && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Preventive Maintenance Checklists */}
              <Card
                title="Preventive Maintenance Protocols (220/400 kV GSS)"
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                ui={ui}
                accent="emerald"
                themeMode={theme}
              >
                <div className="space-y-2">
                  {(["daily_weekly", "monthly_quarterly", "annual_biennial"] as const).map((freq) => {
                    const rows = pmByFreq[freq];
                    const onTrack = rows.filter((r) => r.status === "On Track").length;
                    const open = pmOpen === freq;
                    return (
                      <div key={freq} className={cn("overflow-hidden rounded-lg border", ui.border)}>
                        <button
                          type="button"
                          onClick={() => setPmOpen(open ? null : freq)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors",
                            ui.pmAccordion,
                            ui.pmAccordionHover
                          )}
                        >
                          <span className={cn("flex items-center gap-2 text-xs font-medium", ui.textSecondary)}>
                            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                              {PM_FREQUENCY_SHORT[freq]}
                            </span>
                            {rows[0]?.frequencyLabel}
                          </span>
                          <span className={cn("text-[10px] font-semibold", ui.muted)}>
                            {onTrack}/{rows.length} on track
                          </span>
                        </button>
                        {open && (
                          <div className="pt-0.5">
                            <div className={cn("grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider", ui.muted, ui.tableHead)}>
                              <span>Category & Tasks</span>
                              <span className="w-14 text-center">Sites</span>
                              <span className="w-20 text-right">Status</span>
                            </div>
                            {rows.map((r) => (
                              <ComplianceLocationTip
                                key={r.id}
                                locations={r.locations}
                                moreSiteCount={r.moreSiteCount}
                                className="block"
                              >
                                <div className={cn("grid grid-cols-[1fr_auto_auto] items-start gap-2 px-3 py-2 transition-colors border-t", ui.borderSubtle, ui.rowHover)}>
                                  <div className="min-w-0">
                                    <p className={cn("text-xs font-semibold", ui.textSecondary)}>{r.category}</p>
                                    <p className={cn("mt-0.5 text-[10px]", ui.muted)}>{r.tasks.join(" · ")}</p>
                                  </div>
                                  <div className="flex w-14 justify-center pt-0.5">
                                    <SiteCountBadge count={r.siteCount} theme={theme} />
                                  </div>
                                  <div className="flex w-20 justify-end">
                                    <StatusPill status={r.status} theme={theme} />
                                  </div>
                                </div>
                              </ComplianceLocationTip>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Safety & Labor Statutory Requirements */}
              <Card
                title="Safety & Labor Compliance (CEA Regulations)"
                icon={<ShieldAlert className="h-5 w-5 text-amber-500" />}
                ui={ui}
                accent="amber"
                themeMode={theme}
              >
                <div className={cn("mb-2 grid grid-cols-[1fr_auto] gap-2 px-1 text-[9px] font-bold uppercase tracking-wider", ui.muted)}>
                  <span>Requirement</span>
                  <span className="text-center w-14">Sites</span>
                </div>
                <div className="space-y-2">
                  {snap.safetyCompliance.map((s) => (
                    <ComplianceLocationTip
                      key={s.id}
                      locations={s.locations}
                      moreSiteCount={s.moreSiteCount}
                    >
                      <div className={cn("grid grid-cols-[1fr_auto] items-start gap-2 rounded-lg border px-3 py-2 transition-colors", ui.rowSurface)}>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-semibold", ui.textSecondary)}>{s.area}</p>
                          <p className={cn("mt-0.5 text-[10px] leading-snug", ui.muted)}>{s.requirement}</p>
                        </div>
                        <div className="flex w-14 justify-center pt-0.5">
                          <SiteCountBadge count={s.siteCount} theme={theme} />
                        </div>
                      </div>
                    </ComplianceLocationTip>
                  ))}
                </div>
              </Card>
            </div>

            {/* Equipment Testing & Diagnostic Protocols */}
            <Card
              title="Equipment Testing & Diagnostic Protocols"
              icon={<Activity className="h-5 w-5 text-violet-500" />}
              ui={ui}
              accent="violet"
              themeMode={theme}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={cn("text-[10px] uppercase tracking-wider", ui.muted, ui.tableHead)}>
                    <tr>
                      <th className="pb-2.5 pr-3 font-semibold">Cadence</th>
                      <th className="pb-2.5 pr-3 font-semibold">Equipment Category</th>
                      <th className="pb-2.5 pr-3 font-semibold">Diagnostic Protocol</th>
                      <th className="pb-2.5 pr-3 font-semibold text-center">Sites</th>
                      <th className="pb-2.5 font-semibold">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snap.testingProtocols.map((p) => (
                      <tr key={p.id} className={cn("group/loc relative border-t transition-colors", ui.borderSubtle, ui.rowHover)}>
                        <td className={cn("py-2.5 pr-3 whitespace-nowrap font-medium", ui.muted)}>{p.frequency}</td>
                        <td className={cn("py-2.5 pr-3 font-semibold whitespace-nowrap", ui.textSecondary)}>{p.category}</td>
                        <td className={cn("py-2.5 pr-3", ui.muted)}>{p.task}</td>
                        <td className="py-2.5 pr-3 text-center">
                          <SiteCountBadge count={p.siteCount} theme={theme} />
                        </td>
                        <td className="relative py-2.5">
                          <StatusPill status={p.status} theme={theme} />
                          <LocationTooltipPanel
                            locations={p.locations}
                            moreSiteCount={p.moreSiteCount}
                            className="right-0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: Priority Risk Queue */}
        {activeTab === "queue" && (
          <div>
            {snap.spotlight.length > 0 ? (
              <ComplianceGapsPanel rows={snap.spotlight} totalOverdue={snap.totals.overdueOrMissed} ui={ui} theme={theme} />
            ) : (
              <div className={cn("rounded-xl border p-8 text-center", ui.card)}>
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <p className={cn("mt-2 text-sm font-bold", ui.text)}>No Critical Compliance Gaps in Current Filter Scope</p>
                <p className={cn("mt-1 text-xs", ui.muted)}>All high-priority maintenance items in this circle/division are currently on track.</p>
              </div>
            )}
          </div>
        )}

        <p className={cn("mt-4 pb-2 text-center text-[10px]", ui.footer)}>
          HVPNL Compliance Intelligence Framework · Regulatory Reference: HERC Transmission Tariff Regulations & CEA Safety Standards · {snap.generatedAt.slice(0, 16).replace("T", " ")} UTC
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  ui,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  ui: AnalyticsUiTokens;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className={cn("text-[9px] font-bold uppercase tracking-wider", ui.muted)}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectBaseClass, ui.select)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "All" ? `All ${label}s` : o}
          </option>
        ))}
      </select>
    </label>
  );
}

type KpiTheme = "red" | "cyan" | "emerald" | "orange";

function Kpi({
  label,
  value,
  sub,
  accent,
  title,
  theme: kpiTheme = "cyan",
  ui,
  themeMode,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
  title?: string;
  theme?: KpiTheme;
  ui: AnalyticsUiTokens;
  themeMode: AnalyticsThemeMode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl px-3.5 py-3 transition-all duration-300",
        ui.kpiShell[kpiTheme],
        ui.kpiAccentBar[kpiTheme]
      )}
      title={title}
    >
      <p className={cn("text-[9px] font-bold uppercase tracking-wider", ui.kpiLabel[kpiTheme])}>{label}</p>
      <p className={cn("mt-1.5 text-2xl font-extrabold tabular-nums leading-none", accent ?? ui.text)}>{value}</p>
      <p className={cn("mt-1.5 text-[10px] leading-snug", ui.muted)}>{sub}</p>
    </div>
  );
}

const CARD_ACCENT: Record<string, { iconDark: string; iconLight: string; bar: string }> = {
  red: {
    iconDark: "bg-red-500/15 ring-red-400/25",
    iconLight: "border border-red-200 bg-red-50 ring-red-200",
    bar: "from-red-500",
  },
  amber: {
    iconDark: "bg-amber-500/15 ring-amber-400/25",
    iconLight: "border border-amber-200 bg-amber-50 ring-amber-200",
    bar: "from-amber-500",
  },
  emerald: {
    iconDark: "bg-emerald-500/15 ring-emerald-400/25",
    iconLight: "border border-emerald-200 bg-emerald-50 ring-emerald-200",
    bar: "from-emerald-500",
  },
  violet: {
    iconDark: "bg-violet-500/15 ring-violet-400/25",
    iconLight: "border border-violet-200 bg-violet-50 ring-violet-200",
    bar: "from-violet-500",
  },
  cyan: {
    iconDark: "bg-cyan-500/15 ring-cyan-400/25",
    iconLight: "border border-sky-200 bg-sky-50 ring-sky-200",
    bar: "from-sky-500",
  },
};

function Card({
  title,
  icon,
  children,
  className,
  highlight,
  ui,
  accent,
  themeMode,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
  ui: AnalyticsUiTokens;
  accent?: keyof typeof CARD_ACCENT;
  themeMode: AnalyticsThemeMode;
}) {
  const accentStyle = accent ? CARD_ACCENT[accent] : CARD_ACCENT.cyan;

  return (
    <div
      className={cn(
        "rounded-xl p-4",
        highlight ? ui.cardHighlight : ui.card,
        ui.cardHover,
        className
      )}
    >
      <div className={cn("mb-3.5 flex items-center gap-3 border-b pb-3", ui.borderSubtle)}>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
              themeMode === "light" ? accentStyle.iconLight : accentStyle.iconDark
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className={cn("font-display text-sm font-bold uppercase tracking-wide", ui.text)}>
            {title}
          </h2>
          <div className={cn("mt-1.5 h-0.5 w-16 bg-gradient-to-r to-transparent", accentStyle.bar)} />
        </div>
      </div>
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  warn,
  hint,
  ui,
  theme,
}: {
  label: string;
  value: string;
  warn?: boolean;
  hint?: string;
  ui: AnalyticsUiTokens;
  theme: "light" | "dark";
}) {
  return (
    <div className={cn("rounded-lg border px-2.5 py-2", ui.metric)}>
      <p className={cn("text-[10px]", ui.muted)}>{label}</p>
      <p
        className={cn(
          "mt-0.5 font-bold tabular-nums text-sm",
          warn ? (theme === "dark" ? "text-red-400" : "text-red-600") : ui.textSecondary
        )}
      >
        {value}
      </p>
      {hint && <p className={cn("mt-0.5 text-[9px] leading-snug", ui.mutedFaint)}>{hint}</p>}
    </div>
  );
}

function ComplianceGapsPanel({
  rows,
  totalOverdue,
  ui,
  theme,
}: {
  rows: MaintenanceRecord[];
  totalOverdue: number;
  ui: AnalyticsUiTokens;
  theme: "light" | "dark";
}) {
  const totalExposure = rows.reduce((s, r) => s + r.fineExposureINR + r.wearTearINR, 0);

  return (
    <section className={cn("overflow-hidden rounded-xl border", ui.gapsPanel)}>
      <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5", ui.border)}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h2 className={cn("font-display text-sm font-bold uppercase tracking-wide sm:text-base", ui.text)}>
              Priority Compliance Gaps (High Financial Exposure)
            </h2>
            <p className={cn("mt-0.5 text-[11px]", ui.muted)}>
              Top {rows.length} critical non-compliance items ranked by regulatory fine and asset wear risk
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-[9px] font-bold uppercase tracking-wider", ui.muted)}>Total Queue Exposure</p>
          <p className={cn("text-base font-bold tabular-nums", theme === "dark" ? "text-amber-400" : "text-amber-700")}>
            {formatINR(totalExposure)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead className={cn("text-[10px] uppercase tracking-wider", ui.muted, ui.tableHead)}>
            <tr>
              <th className="px-4 py-2.5 font-semibold w-8">#</th>
              <th className="px-3 py-2.5 font-semibold">Asset Name & Details</th>
              <th className="px-3 py-2.5 font-semibold">Jurisdiction</th>
              <th className="px-3 py-2.5 font-semibold">Compliance Requirement</th>
              <th className="px-3 py-2.5 font-semibold">Status & Overdue</th>
              <th className="px-4 py-2.5 font-semibold text-right">Exposure Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <ComplianceGapRow key={row.id} row={row} rank={index + 1} ui={ui} theme={theme} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComplianceGapRow({
  row,
  rank,
  ui,
  theme,
}: {
  row: MaintenanceRecord;
  rank: number;
  ui: AnalyticsUiTokens;
  theme: "light" | "dark";
}) {
  const meta = ASSET_KIND_META[row.assetKind];
  const Icon = meta.icon;
  const totalExposure = row.fineExposureINR + row.wearTearINR;
  const labelStyle = complianceLabelStyle(row.complianceLabel, theme);
  const tone = assetTone(row.assetKind, theme);

  return (
    <tr className={cn("group border-t transition-colors", ui.borderSubtle, ui.rowHover)}>
      <td className={cn("px-4 py-3 tabular-nums text-[10px] font-bold", ui.mutedFaint)}>{rank}</td>
      <td className="px-3 py-3">
        <div className="flex items-start gap-2.5 min-w-[200px]">
          <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", tone)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold leading-snug", ui.textSecondary)}>{row.assetName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase", tone)}>
                {meta.label}
              </span>
              {row.voltage && <span className={cn("text-[10px]", ui.muted)}>{row.voltage}</span>}
              <span className={cn("inline-flex items-center gap-0.5 text-[10px]", ui.mutedFaint)}>
                <MapPin className="h-2.5 w-2.5 text-red-400" />
                {row.zone}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <p className={cn("font-medium", ui.textSecondary)}>{row.circle}</p>
        <p className={cn("mt-0.5 text-[10px]", ui.muted)}>{row.division}</p>
      </td>
      <td className="px-3 py-3 min-w-[200px]">
        <div className="flex flex-col items-start gap-1">
          <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", labelStyle)}>
            {row.complianceLabel}
          </span>
          <p className={cn("font-medium leading-snug", ui.textSecondary)}>{row.complianceName}</p>
          <p className={cn("max-w-[240px] text-[10px] leading-relaxed", ui.muted)}>{row.complianceTarget}</p>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1">
          <StatusPill status={row.status} theme={theme} />
          {row.daysOverdue > 0 && (
            <span className={cn("text-[10px] font-bold tabular-nums", theme === "dark" ? "text-red-400" : "text-red-600")}>
              {row.daysOverdue}d overdue
            </span>
          )}
          <span className={cn("max-w-[160px] truncate text-[10px]", ui.mutedFaint)}>Planned: {row.plannedDate}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <p className={cn("font-bold tabular-nums text-sm", theme === "dark" ? "text-amber-400" : "text-amber-700")}>
          {row.fineExposureINR > 0 ? formatINR(row.fineExposureINR) : "—"}
        </p>
        <p className={cn("mt-0.5 text-[9px] font-medium", ui.muted)}>Regulatory fine</p>
        {row.wearTearINR > 0 && (
          <p className={cn("mt-0.5 text-[9px] tabular-nums", ui.muted)}>+ {formatINR(row.wearTearINR)} wear decay</p>
        )}
        <p className={cn("mt-1 text-[10px] font-semibold tabular-nums", ui.mutedFaint)}>Total: {formatINR(totalExposure)}</p>
      </td>
    </tr>
  );
}
