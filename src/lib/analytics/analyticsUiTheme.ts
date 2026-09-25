export type AnalyticsThemeMode = "light" | "dark";

export const ANALYTICS_THEME_STORAGE_KEY = "sms-analytics-theme";

export interface AnalyticsUiTokens {
  page: string;
  pageMesh: string;
  pageGrid: string;
  header: string;
  headerGlow: string;
  headerOrb: string;
  titleGradient: string;
  titleSolid: string;
  titleUnderline: string;
  sectionBand: string;
  sectionTitle: string;
  sectionDot: string;
  card: string;
  cardHighlight: string;
  cardHover: string;
  panelInset: string;
  text: string;
  textSecondary: string;
  muted: string;
  mutedFaint: string;
  border: string;
  borderSubtle: string;
  select: string;
  clearBtn: string;
  clearBtnDisabled: string;
  metric: string;
  rowHover: string;
  rowSurface: string;
  gapsPanel: string;
  footer: string;
  progressTrack: string;
  pmAccordion: string;
  pmAccordionHover: string;
  tableHead: string;
  tabsContainer: string;
  tabActive: string;
  tabInactive: string;
  chartGrid: string;
  chartText: string;
  chartTooltip: string;
  kpiShell: Record<"red" | "cyan" | "emerald" | "orange", string>;
  kpiLabel: Record<"red" | "cyan" | "emerald" | "orange", string>;
  kpiAccentBar: Record<"red" | "cyan" | "emerald" | "orange", string>;
}

export const ANALYTICS_UI: Record<AnalyticsThemeMode, AnalyticsUiTokens> = {
  dark: {
    page: "bg-[#070b14]",
    pageMesh:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)]",
    pageGrid:
      "[background-image:radial-gradient(rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.35]",
    header: "border-white/[0.06] bg-slate-950/60 backdrop-blur-md",
    headerGlow: "from-cyan-500/[0.06] via-transparent to-violet-500/[0.04]",
    headerOrb: "bg-cyan-400/10",
    titleGradient: "from-white via-cyan-100 to-cyan-300/90",
    titleSolid: "",
    titleUnderline: "from-cyan-400 via-cyan-400/40 to-transparent",
    sectionBand:
      "border-white/[0.06] bg-gradient-to-b from-slate-900/60 to-slate-950/40 shadow-inner shadow-black/20",
    sectionTitle: "text-slate-300",
    sectionDot: "bg-cyan-400/80 shadow-[0_0_8px_#22d3ee]",
    card: "border border-white/5 bg-slate-900/50 backdrop-blur-md hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/[0.04]",
    cardHighlight:
      "border border-red-500/20 bg-gradient-to-b from-red-500/[0.05] via-slate-900/55 to-slate-900/50 shadow-lg shadow-red-500/[0.06]",
    cardHover: "transition-all duration-300",
    panelInset: "border border-white/5 bg-black/25",
    text: "text-white",
    textSecondary: "text-slate-200",
    muted: "text-slate-400",
    mutedFaint: "text-slate-500",
    border: "border-white/5",
    borderSubtle: "border-white/[0.06]",
    select: "border-slate-700/80 bg-slate-950/70 text-slate-200 focus:border-cyan-500/50 shadow-sm",
    clearBtn:
      "border-slate-600/70 bg-slate-950/80 text-slate-300 hover:border-red-400/45 hover:bg-red-500/10 hover:text-red-300 hover:shadow-md hover:shadow-red-500/10",
    clearBtnDisabled: "border-white/5 bg-slate-950/40 text-slate-600",
    metric: "border border-white/5 bg-black/20",
    rowHover: "hover:bg-white/[0.03]",
    rowSurface: "border border-white/5 bg-black/20 hover:border-red-500/20 hover:bg-black/30",
    gapsPanel: "border border-red-500/15 bg-gradient-to-b from-slate-900/80 to-[#0a1018] shadow-xl",
    footer: "text-slate-500",
    progressTrack: "bg-slate-800/80",
    pmAccordion: "bg-slate-900/60",
    pmAccordionHover: "hover:bg-slate-900/80",
    tableHead: "bg-white/[0.03]",
    tabsContainer: "border-white/10 bg-slate-950/70 p-1 shadow-inner",
    tabActive: "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm",
    tabInactive: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
    chartGrid: "#1e293b",
    chartText: "#94a3b8",
    chartTooltip: "border border-slate-700 bg-slate-900/95 text-white shadow-2xl backdrop-blur-md rounded-xl p-3",
    kpiShell: {
      red: "border border-red-400/35 bg-gradient-to-br from-red-500/[0.1] via-slate-900/85 to-slate-950/90 shadow-md shadow-red-500/15",
      cyan: "border border-cyan-400/35 bg-gradient-to-br from-cyan-500/[0.1] via-slate-900/85 to-slate-950/90 shadow-md shadow-cyan-500/15",
      emerald:
        "border border-emerald-400/35 bg-gradient-to-br from-emerald-500/[0.1] via-slate-900/85 to-slate-950/90 shadow-md shadow-emerald-500/15",
      orange:
        "border border-orange-400/35 bg-gradient-to-br from-orange-500/[0.1] via-slate-900/85 to-slate-950/90 shadow-md shadow-orange-500/15",
    },
    kpiLabel: {
      red: "text-red-400/80",
      cyan: "text-cyan-400/80",
      emerald: "text-emerald-400/80",
      orange: "text-orange-400/80",
    },
    kpiAccentBar: {
      red: "border-t-2 border-t-red-500",
      cyan: "border-t-2 border-t-cyan-500",
      emerald: "border-t-2 border-t-emerald-500",
      orange: "border-t-2 border-t-orange-500",
    },
  },
  light: {
    page: "bg-[#f8fafc]",
    pageMesh:
      "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_10%_-10%,rgba(14,165,233,0.06),transparent),radial-gradient(ellipse_70%_50%_at_95%_0%,rgba(99,102,241,0.04),transparent)]",
    pageGrid:
      "[background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-60",
    header:
      "border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(15,23,42,0.05),0_4px_20px_-6px_rgba(15,23,42,0.04)]",
    headerGlow: "from-sky-100/60 via-transparent to-indigo-50/40",
    headerOrb: "bg-sky-200/30",
    titleGradient: "",
    titleSolid: "text-slate-900 font-extrabold",
    titleUnderline: "from-sky-500 via-sky-400/50 to-transparent",
    sectionBand:
      "border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06),0_1px_0_0_rgba(255,255,255,0.8)_inset]",
    sectionTitle: "text-slate-800 font-bold",
    sectionDot: "bg-sky-500 shadow-sm shadow-sky-200",
    card: "border border-slate-200/90 bg-white shadow-[0_2px_14px_-4px_rgba(15,23,42,0.06)] hover:border-sky-300 hover:shadow-[0_8px_25px_-6px_rgba(14,165,233,0.12)]",
    cardHighlight:
      "border border-red-200/90 bg-gradient-to-b from-red-50/40 via-white to-white shadow-[0_4px_18px_-6px_rgba(239,68,68,0.12)]",
    cardHover: "transition-all duration-300",
    panelInset: "border border-slate-200/80 bg-slate-50/80 shadow-inner shadow-slate-200/20",
    text: "text-slate-900 font-semibold",
    textSecondary: "text-slate-800",
    muted: "text-slate-600 font-normal",
    mutedFaint: "text-slate-500",
    border: "border-slate-200/90",
    borderSubtle: "border-slate-200/70",
    select:
      "border-slate-300/90 bg-white text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:border-sky-500 focus:ring-2 focus:ring-sky-100",
    clearBtn:
      "border-slate-300/90 bg-white text-slate-700 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700",
    clearBtnDisabled: "border-slate-200 bg-slate-100/80 text-slate-400",
    metric: "border border-slate-200/80 bg-white shadow-sm shadow-slate-100",
    rowHover: "hover:bg-sky-50/50",
    rowSurface:
      "border border-slate-200/80 bg-white shadow-sm shadow-slate-100/80 hover:border-red-200/80 hover:bg-red-50/40",
    gapsPanel:
      "border border-red-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(239,68,68,0.12)]",
    footer: "text-slate-500",
    progressTrack: "bg-slate-200/90",
    pmAccordion: "bg-slate-50/90",
    pmAccordionHover: "hover:bg-sky-50/60",
    tableHead: "bg-slate-50/95 font-semibold text-slate-700",
    tabsContainer: "border border-slate-200/90 bg-slate-100/80 p-1 shadow-inner",
    tabActive: "bg-white text-sky-700 border border-slate-200 shadow-sm font-semibold",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-white/50",
    chartGrid: "#e2e8f0",
    chartText: "#64748b",
    chartTooltip: "border border-slate-200 bg-white text-slate-900 shadow-xl rounded-xl p-3",
    kpiShell: {
      red: "border border-red-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(239,68,68,0.1)]",
      cyan: "border border-sky-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(14,165,233,0.1)]",
      emerald: "border border-emerald-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(16,185,129,0.1)]",
      orange: "border border-orange-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(249,115,22,0.1)]",
    },
    kpiLabel: {
      red: "text-red-700 font-bold",
      cyan: "text-sky-700 font-bold",
      emerald: "text-emerald-700 font-bold",
      orange: "text-orange-700 font-bold",
    },
    kpiAccentBar: {
      red: "border-l-[4px] border-l-red-500",
      cyan: "border-l-[4px] border-l-sky-500",
      emerald: "border-l-[4px] border-l-emerald-500",
      orange: "border-l-[4px] border-l-orange-500",
    },
  },
};

export const STATUS_PILL: Record<
  AnalyticsThemeMode,
  Record<string, string>
> = {
  dark: {
    "On Track": "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30",
    "Due Soon": "text-amber-400 bg-amber-500/15 border border-amber-500/30",
    Overdue: "text-orange-400 bg-orange-500/15 border border-orange-500/30",
    Missed: "text-red-400 bg-red-500/15 border border-red-500/30",
  },
  light: {
    "On Track": "text-emerald-800 bg-emerald-50 border border-emerald-300 font-semibold",
    "Due Soon": "text-amber-800 bg-amber-50 border border-amber-300 font-semibold",
    Overdue: "text-orange-800 bg-orange-50 border border-orange-300 font-semibold",
    Missed: "text-red-800 bg-red-50 border border-red-300 font-semibold",
  },
};

export const COMPLIANCE_LABEL_THEME: Record<
  AnalyticsThemeMode,
  Record<string, string>
> = {
  dark: {
    PMC: "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30",
    Testing: "text-cyan-400 bg-cyan-500/15 border border-cyan-500/30",
    Safety: "text-amber-400 bg-amber-500/15 border border-amber-500/30",
    SAF: "text-pink-400 bg-pink-500/15 border border-pink-500/30",
  },
  light: {
    PMC: "text-emerald-800 bg-emerald-50 border border-emerald-300 font-semibold",
    Testing: "text-sky-800 bg-sky-50 border border-sky-300 font-semibold",
    Safety: "text-amber-800 bg-amber-50 border border-amber-300 font-semibold",
    SAF: "text-rose-800 bg-rose-50 border border-rose-300 font-semibold",
  },
};

export const ASSET_TONE: Record<
  AnalyticsThemeMode,
  Record<"substation" | "line" | "tower", string>
> = {
  dark: {
    substation: "text-cyan-400 bg-cyan-500/15 border border-cyan-500/25",
    line: "text-violet-400 bg-violet-500/15 border border-violet-500/25",
    tower: "text-amber-400 bg-amber-500/15 border border-amber-500/25",
  },
  light: {
    substation: "text-sky-800 bg-sky-50 border border-sky-300 font-semibold",
    line: "text-violet-800 bg-violet-50 border border-violet-300 font-semibold",
    tower: "text-amber-800 bg-amber-50 border border-amber-300 font-semibold",
  },
};
