"use client";

import { AlertOctagon, CheckCircle2, ChevronRight, ShieldAlert, Sparkles, TrendingUp, Zap } from "lucide-react";
import type { AnalyticsSnapshot } from "@/lib/data/analyticsCompliance";
import type { AnalyticsThemeMode, AnalyticsUiTokens } from "@/lib/analytics/analyticsUiTheme";
import { formatINRLakhs } from "@/lib/data/analyticsCompliance";
import { cn } from "@/lib/utils";

interface ExecutiveVerdictBannerProps {
  snap: AnalyticsSnapshot;
  theme: AnalyticsThemeMode;
  ui: AnalyticsUiTokens;
  onSelectTab?: (tab: string) => void;
}

export function ExecutiveVerdictBanner({ snap, theme, ui, onSelectTab }: ExecutiveVerdictBannerProps) {
  const { saf, totals } = snap;
  const isBreach = saf.status === "breach" || saf.status === "at_risk";
  const isIncentive = saf.status === "incentive";

  const totalExposureINR = totals.fineExposureINR + totals.wearTearINR;

  const topPriorities = [
    {
      title: "Expedite 400kV Transformer Diagnostic Testing",
      desc: "14 EHV power transformers have overdue DGA and SF6 gas pressure tests. Catastrophic risk up to ₹25 Cr per asset.",
      badge: "Critical",
      tab: "protocols",
    },
    {
      title: `Recover ${Math.abs(saf.gapToNormative)}% SAF Deficit`,
      desc: `Availability is ${Math.abs(saf.gapToNormative)}% below the 98% HERC normative floor, placing ${formatINRLakhs(saf.arrAtRiskINR)} ARR recovery at risk at annual true-up.`,
      badge: "Regulatory",
      tab: "trends",
    },
    {
      title: "Resolve Permit-to-Work (PTW) Compliance Gaps",
      desc: "Mandatory CEA statutory safety protocols require mechanical isolation and LOTO audits across 84 GSS sites.",
      badge: "Safety",
      tab: "protocols",
    },
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300",
        theme === "dark"
          ? isBreach
            ? "border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-950 shadow-xl shadow-red-950/20"
            : isIncentive
            ? "border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950 shadow-xl shadow-emerald-950/20"
            : "border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-950 shadow-xl"
          : isBreach
          ? "border-red-200 bg-gradient-to-r from-red-50/80 via-white to-white shadow-[0_4px_20px_-4px_rgba(239,68,68,0.12)]"
          : isIncentive
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-white shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)]"
          : "border-sky-200 bg-gradient-to-r from-sky-50/70 via-white to-white shadow-[0_4px_20px_-4px_rgba(14,165,233,0.1)]"
      )}
    >
      {/* Background Accent Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl",
          isBreach
            ? theme === "dark" ? "bg-red-500/15" : "bg-red-200/50"
            : theme === "dark" ? "bg-cyan-500/15" : "bg-sky-200/50"
        )}
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Column: Verdict Badge & Headline */}
        <div className="flex items-start gap-3.5 max-w-xl">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-md",
              isBreach
                ? theme === "dark"
                  ? "bg-red-500/20 ring-red-400/40 text-red-400"
                  : "bg-red-100 ring-red-300 text-red-700"
                : isIncentive
                ? theme === "dark"
                  ? "bg-emerald-500/20 ring-emerald-400/40 text-emerald-400"
                  : "bg-emerald-100 ring-emerald-300 text-emerald-700"
                : theme === "dark"
                ? "bg-cyan-500/20 ring-cyan-400/40 text-cyan-400"
                : "bg-sky-100 ring-sky-300 text-sky-700"
            )}
          >
            {isBreach ? (
              <AlertOctagon className="h-6 w-6" />
            ) : isIncentive ? (
              <Sparkles className="h-6 w-6" />
            ) : (
              <ShieldAlert className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                  isBreach
                    ? theme === "dark"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-red-100 text-red-800 border border-red-300"
                    : isIncentive
                    ? theme === "dark"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : theme === "dark"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-sky-100 text-sky-800 border border-sky-300"
                )}
              >
                {isBreach ? "Regulatory Penalty Warning" : isIncentive ? "HERC Incentive Eligible" : "Regulatory Safe"}
              </span>

              <span className={cn("text-[11px] font-medium", ui.muted)}>
                HERC Normative Benchmark: <strong>98.0%</strong>
              </span>
            </div>

            <h2 className={cn("mt-1.5 text-base font-bold tracking-tight sm:text-lg", ui.text)}>
              {isBreach
                ? `Fleet Availability at ${saf.currentPct}% (${Math.abs(saf.gapToNormative)}% Below HERC Floor)`
                : isIncentive
                ? `Fleet Operating in Incentive Band at ${saf.currentPct}% (+${saf.gapToNormative}% above Normative)`
                : `Fleet Operating Normatively at ${saf.currentPct}%`}
            </h2>

            <p className={cn("mt-1 text-xs leading-relaxed", ui.muted)}>
              {isBreach ? (
                <>
                  HVPNL faces an estimated <strong className={theme === "dark" ? "text-red-300" : "text-red-700"}>{formatINRLakhs(saf.arrAtRiskINR)} ARR revenue shortfall</strong> plus{" "}
                  <strong>{formatINRLakhs(totalExposureINR)}</strong> in regulatory fines & accelerated equipment wear across {totals.overdueOrMissed} overdue maintenance cycles.
                </>
              ) : (
                <>
                  Fleet availability remains healthy. Maintain proactive transformer DGA testing and SF6 monitoring to safeguard insurance eligibility and ARR recovery.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Column: Key Metrics Pill Box */}
        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          <div
            className={cn(
              "flex-1 rounded-xl border p-2.5 text-center min-w-[110px]",
              theme === "dark" ? "border-white/10 bg-black/30" : "border-slate-200 bg-white shadow-sm"
            )}
          >
            <p className={cn("text-[9px] uppercase tracking-wider font-semibold", ui.muted)}>ARR at Risk</p>
            <p className={cn("mt-0.5 text-base font-bold tabular-nums", isBreach ? (theme === "dark" ? "text-red-400" : "text-red-600") : "text-emerald-500")}>
              {saf.arrAtRiskINR > 0 ? formatINRLakhs(saf.arrAtRiskINR) : "₹0 L (Safe)"}
            </p>
          </div>

          <div
            className={cn(
              "flex-1 rounded-xl border p-2.5 text-center min-w-[110px]",
              theme === "dark" ? "border-white/10 bg-black/30" : "border-slate-200 bg-white shadow-sm"
            )}
          >
            <p className={cn("text-[9px] uppercase tracking-wider font-semibold", ui.muted)}>Total Exposure</p>
            <p className={cn("mt-0.5 text-base font-bold tabular-nums", theme === "dark" ? "text-amber-400" : "text-amber-700")}>
              {formatINRLakhs(totalExposureINR)}
            </p>
          </div>

          <div
            className={cn(
              "flex-1 rounded-xl border p-2.5 text-center min-w-[110px]",
              theme === "dark" ? "border-white/10 bg-black/30" : "border-slate-200 bg-white shadow-sm"
            )}
          >
            <p className={cn("text-[9px] uppercase tracking-wider font-semibold", ui.muted)}>To Normative</p>
            <p className={cn("mt-0.5 text-base font-bold tabular-nums", saf.gapToNormative < 0 ? (theme === "dark" ? "text-red-400" : "text-red-600") : "text-emerald-500")}>
              {saf.gapToNormative >= 0 ? `+${saf.gapToNormative}%` : `${saf.gapToNormative}%`}
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations Strip */}
      <div className={cn("mt-3.5 border-t pt-3", theme === "dark" ? "border-white/10" : "border-slate-200/90")}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", ui.muted)}>
            Executive Action Priorities (Highest Regulatory & Operational ROI)
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {topPriorities.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectTab?.(item.tab)}
              className={cn(
                "group flex cursor-pointer flex-col justify-between rounded-xl border p-2.5 transition-all hover:scale-[1.01]",
                theme === "dark"
                  ? "border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.04]"
                  : "border-slate-200 bg-white/70 hover:border-sky-300 hover:bg-white shadow-sm"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                      item.badge === "Critical"
                        ? theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                        : item.badge === "Regulatory"
                        ? theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-sky-100 text-sky-700"
                        : theme === "dark" ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {item.badge}
                  </span>
                  <span className={cn("text-[9px] flex items-center gap-0.5", ui.muted, "group-hover:text-cyan-400")}>
                    View <ChevronRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <p className={cn("mt-1.5 text-xs font-semibold leading-snug", ui.textSecondary)}>
                  {item.title}
                </p>
                <p className={cn("mt-1 text-[10px] leading-relaxed line-clamp-2", ui.muted)}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
