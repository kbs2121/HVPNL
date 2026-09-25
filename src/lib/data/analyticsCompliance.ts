/**
 * Analytics — fleet health & maintenance compliance across Zone → Circle → Division.
 * Derives portfolio metrics from substations.json + transmission lines, with
 * deterministic maintenance schedules and overdue consequence modelling.
 */

import { SUBSTATIONS, type Substation, type VoltageLevel } from "@/lib/data/powerGridData";
import { transmissionLines } from "@/lib/data/mockTransmissionLines";
import { normalizeZone } from "@/lib/data/hierarchyFilters";
import {
  PM_CHECKLIST_220_400,
  PM_FREQUENCY_LABEL,
  SAF_CONSEQUENCES,
  SAF_INCENTIVE_TARGET,
  SAF_NORMATIVE_TARGET,
  SAFETY_REQUIREMENTS,
  TESTING_PROTOCOLS,
  type PmFrequency,
  type ComplianceDomain,
} from "@/lib/data/hvpnlComplianceFramework";

export type AssetKind = "substation" | "line" | "tower";
export type ComplianceStatus = "On Track" | "Due Soon" | "Overdue" | "Missed";
export type HealthBand = "Healthy" | "Watch" | "Critical";

export interface AnalyticsFilters {
  zone: string;
  circle: string;
  division: string;
  assetKind: "all" | AssetKind;
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
  zone: "All",
  circle: "All",
  division: "All",
  assetKind: "all",
};

export interface MaintenanceRecord {
  id: string;
  assetKind: AssetKind;
  assetId: string;
  assetName: string;
  zone: string;
  circle: string;
  division: string;
  voltage?: VoltageLevel | string;
  plannedDate: string; // ISO date
  completedDate: string | null;
  status: ComplianceStatus;
  daysOverdue: number;
  currentHealth: number;
  projectedHealthIfMissed: number;
  healthDecayPts: number;
  fineExposureINR: number;
  wearTearINR: number;
  consequence: string;
  complianceDomain: ComplianceDomain;
  complianceLabel: string;
  complianceName: string;
  complianceTarget: string;
  fineSource: string;
  fineBasis: string;
}

export interface HierarchyBucket {
  key: string;
  zone: string;
  circle?: string;
  division?: string;
  substations: number;
  lines: number;
  towers: number;
  avgHealth: number;
  overdueCount: number;
  compliancePct: number;
  fineExposureINR: number;
}

export interface SafLocationBreakdown {
  totalGss: number;
  achievedCount: number;
  pendingCount: number;
  incentiveCount: number;
}

export interface SafMetrics {
  currentPct: number;
  normativeTarget: number;
  incentiveTarget: number;
  gapToNormative: number;
  gapToIncentive: number;
  status: "incentive" | "compliant" | "at_risk" | "breach";
  arrAtRiskINR: number;
  incentiveEligibleINR: number;
  projectedSafIfMissed: number;
  safTrend: { month: string; actual: number; target: number }[];
  locations: SafLocationBreakdown;
}

export interface ComplianceLocation {
  substation: string;
  code: number;
  zone: string;
  circle: string;
  division: string;
  voltage: string;
}

export interface PmChecklistRow {
  id: string;
  frequency: PmFrequency;
  frequencyLabel: string;
  category: string;
  tasks: string[];
  voltages: string[];
  status: ComplianceStatus;
  compliancePct: number;
  consequence: string;
  locations: ComplianceLocation[];
  moreSiteCount: number;
  siteCount: number;
}

export interface TestingProtocolRow {
  id: string;
  frequency: string;
  category: string;
  task: string;
  standard?: string;
  status: ComplianceStatus;
  lastCompleted?: string;
  locations: ComplianceLocation[];
  moreSiteCount: number;
  siteCount: number;
}

export interface SafetyComplianceRow {
  id: string;
  area: string;
  requirement: string;
  consequence: string;
  auditScore: number;
  status: "Compliant" | "Watch" | "Non-Compliant";
  locations: ComplianceLocation[];
  moreSiteCount: number;
  siteCount: number;
}

export interface AnalyticsSnapshot {
  generatedAt: string;
  totals: {
    substations: number;
    lines: number;
    towers: number;
    avgHealth: number;
    complianceScore: number;
    plannedMaintenance: number;
    overdueOrMissed: number;
    dueSoon: number;
    fineExposureINR: number;
    wearTearINR: number;
    healthAtRiskPts: number;
  };
  saf: SafMetrics;
  pmChecklist: PmChecklistRow[];
  testingProtocols: TestingProtocolRow[];
  safetyCompliance: SafetyComplianceRow[];
  healthBands: { band: HealthBand; count: number; pct: number }[];
  complianceMix: { status: ComplianceStatus; count: number; color: string }[];
  byZone: HierarchyBucket[];
  byCircle: HierarchyBucket[];
  byDivision: HierarchyBucket[];
  maintenance: MaintenanceRecord[];
  spotlight: MaintenanceRecord[];
  decaySeries: { week: string; onTrack: number; ifMissed: number }[];
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / 86400000);
}

function healthBand(score: number): HealthBand {
  if (score >= 85) return "Healthy";
  if (score >= 60) return "Watch";
  return "Critical";
}

function fineRate(voltage?: string): { daily: number; base: number; wearDaily: number } {
  // Scoped queue exposure — kept under ₹1 Cr fleet-wide for dashboard KPI realism
  const v = (voltage ?? "").toUpperCase();
  if (v.includes("400")) return { daily: 1800, base: 12000, wearDaily: 950 };
  if (v.includes("220")) return { daily: 1200, base: 8000, wearDaily: 650 };
  if (v.includes("132")) return { daily: 850, base: 5500, wearDaily: 420 };
  return { daily: 500, base: 3500, wearDaily: 280 };
}

function classifyMaintenance(
  planned: string,
  completed: string | null,
  today: string
): { status: ComplianceStatus; daysOverdue: number } {
  if (completed) {
    const late = daysBetween(planned, completed);
    if (late > 7) return { status: "Missed", daysOverdue: late };
    return { status: "On Track", daysOverdue: 0 };
  }
  const delta = daysBetween(planned, today);
  if (delta > 14) return { status: "Missed", daysOverdue: delta };
  if (delta > 0) return { status: "Overdue", daysOverdue: delta };
  if (delta >= -7) return { status: "Due Soon", daysOverdue: 0 };
  return { status: "On Track", daysOverdue: 0 };
}

function consequenceText(
  status: ComplianceStatus,
  daysOverdue: number,
  decay: number,
  fine: number
): string {
  if (status === "On Track") {
    return "Maintenance window on schedule — residual risk within SLA.";
  }
  if (status === "Due Soon") {
    return "Window opens within 7 days. Delay may start health decay (~2 pts/week).";
  }
  if (status === "Overdue") {
    return `Overdue by ${daysOverdue}d. Projected −${decay} health pts and ≈₹${fine.toLocaleString("en-IN")} compliance / wear exposure if not closed.`;
  }
  return `Missed SLA (${daysOverdue}d). Accelerated wear & regulatory exposure ≈₹${fine.toLocaleString("en-IN")}; health at risk −${decay} pts.`;
}

interface AssetRef {
  kind: AssetKind;
  id: string;
  name: string;
  zone: string;
  circle: string;
  division: string;
  voltage?: string;
  health: number;
  towerCount?: number;
}

function buildAssetUniverse(): AssetRef[] {
  const assets: AssetRef[] = SUBSTATIONS.map((s) => ({
    kind: "substation" as const,
    id: String(s.code),
    name: s.name,
    zone: normalizeZone(s.zone),
    circle: s.circle,
    division: s.division,
    voltage: s.voltage,
    health: Math.max(35, Math.min(98, 100 - Math.round(s.loadPct * 0.35) - (s.status === "Overload Alert" ? 18 : s.status === "Maintenance" ? 12 : 0))),
  }));

  // Attach lines to nearest hierarchy via from-substation code when possible
  const byCode = new Map(SUBSTATIONS.map((s) => [s.code, s]));
  for (const line of transmissionLines) {
    const from = byCode.get(line.from_substation.code);
    assets.push({
      kind: "line",
      id: line.line_id,
      name: line.line_name,
      zone: from ? normalizeZone(from.zone) : "Other",
      circle: from?.circle ?? "Unassigned",
      division: from?.division ?? "Unassigned",
      voltage: line.voltage,
      health: line.health_score,
      towerCount: line.tower_count,
    });
  }

  // Synthetic tower roll-ups per line (not individual GIS towers)
  for (const line of transmissionLines) {
    const from = byCode.get(line.from_substation.code);
    const seed = hashSeed(line.line_id);
    const towerHealth = Math.max(40, Math.min(97, line.health_score - (seed % 8)));
    assets.push({
      kind: "tower",
      id: `TW-${line.line_id}`,
      name: `${line.line_name} · Tower fleet (${line.tower_count})`,
      zone: from ? normalizeZone(from.zone) : "Other",
      circle: from?.circle ?? "Unassigned",
      division: from?.division ?? "Unassigned",
      voltage: line.voltage,
      health: towerHealth,
      towerCount: line.tower_count,
    });
  }

  return assets;
}

function fineSourceFor(domain: ComplianceDomain): string {
  switch (domain) {
    case "saf":
      return "HERC (T&C) · ARR true-up on SAF < 98%";
    case "pm":
      return "HERC/CAG true-up · O&M cost disallowance (PM logs)";
    case "testing":
      return "CEA Regulations · HVPNL O&M SOP test SLA breach";
    case "safety":
      return "Indian Electricity Rules · NGT/labor court penalty";
  }
}

function assignComplianceGap(
  asset: AssetRef,
  seed: number
): {
  complianceDomain: ComplianceDomain;
  complianceLabel: string;
  complianceName: string;
  complianceTarget: string;
} {
  type GapPick = {
    complianceDomain: ComplianceDomain;
    complianceLabel: string;
    complianceName: string;
    complianceTarget: string;
  };

  const pool: GapPick[] = [];

  for (const pm of PM_CHECKLIST_220_400) {
    pool.push({
      complianceDomain: "pm",
      complianceLabel: "PMC",
      complianceName: pm.category,
      complianceTarget: `Close ${PM_FREQUENCY_LABEL[pm.frequency]} PM checklist`,
    });
  }
  for (const t of TESTING_PROTOCOLS) {
    pool.push({
      complianceDomain: "testing",
      complianceLabel: "Testing",
      complianceName: t.category,
      complianceTarget: t.task.length > 72 ? `${t.task.slice(0, 69)}…` : t.task,
    });
  }
  for (const s of SAFETY_REQUIREMENTS) {
    pool.push({
      complianceDomain: "safety",
      complianceLabel: "Safety",
      complianceName: s.area,
      complianceTarget: s.requirement.length > 72 ? `${s.requirement.slice(0, 69)}…` : s.requirement,
    });
  }
  if (asset.kind === "substation") {
    pool.push({
      complianceDomain: "saf",
      complianceLabel: "SAF",
      complianceName: "SAF / Availability",
      complianceTarget: `Achieve ≥ ${SAF_NORMATIVE_TARGET}% system availability (HERC normative)`,
    });
  }

  return pool[seed % pool.length] ?? pool[0];
}

function fineBasisText(
  rates: { daily: number; base: number },
  daysOverdue: number,
  fineExposureINR: number
): string {
  if (daysOverdue <= 0 || fineExposureINR <= 0) return "No regulatory fine accrued yet";
  const dailyComponent = daysOverdue * rates.daily;
  return `${daysOverdue}d × ₹${rates.daily.toLocaleString("en-IN")}/day (₹${dailyComponent.toLocaleString("en-IN")}) + base ₹${rates.base.toLocaleString("en-IN")}`;
}

function buildMaintenance(assets: AssetRef[], today: string): MaintenanceRecord[] {
  const records: MaintenanceRecord[] = [];

  for (const asset of assets) {
    // Sample ~28% of assets into the compliance register
    const seed = hashSeed(`${asset.kind}:${asset.id}`);
    if (seed % 100 > 28) continue;

    const offset = (seed % 60) - 35; // -35..+24 days from today
    const planned = addDays(today, offset);
    const completedRoll = seed % 10;
    let completed: string | null = null;
    if (completedRoll < 3 && offset < -3) {
      completed = addDays(planned, seed % 5); // completed near plan
    } else if (completedRoll === 3 && offset < -10) {
      completed = addDays(planned, 10 + (seed % 12)); // late completion → Missed
    }

    const { status, daysOverdue } = classifyMaintenance(planned, completed, today);
    const rates = fineRate(asset.voltage);
    const decayPerWeek = asset.kind === "line" ? 3.2 : asset.kind === "tower" ? 2.4 : 2.8;
    const weeks = Math.max(0, daysOverdue / 7);
    const healthDecayPts = Math.round(Math.min(28, weeks * decayPerWeek) * 10) / 10;
    const projectedHealthIfMissed = Math.max(
      25,
      Math.round((asset.health - healthDecayPts) * 10) / 10
    );

    const billableDays = status === "On Track" || status === "Due Soon" ? 0 : daysOverdue;
    const fineExposureINR =
      billableDays === 0 ? 0 : rates.base + billableDays * rates.daily;
    const wearTearINR =
      billableDays === 0 ? 0 : Math.round(billableDays * rates.wearDaily * (1 + (100 - asset.health) / 200));

    const gap = assignComplianceGap(asset, seed);
    const fineSource = fineSourceFor(gap.complianceDomain);
    const fineBasis = fineBasisText(rates, daysOverdue, fineExposureINR);

    records.push({
      id: `mx-${asset.kind}-${asset.id}`,
      assetKind: asset.kind,
      assetId: asset.id,
      assetName: asset.name,
      zone: asset.zone,
      circle: asset.circle,
      division: asset.division,
      voltage: asset.voltage,
      plannedDate: planned,
      completedDate: completed,
      status,
      daysOverdue,
      currentHealth: asset.health,
      projectedHealthIfMissed,
      healthDecayPts,
      fineExposureINR,
      wearTearINR,
      consequence: consequenceText(status, daysOverdue, healthDecayPts, fineExposureINR + wearTearINR),
      ...gap,
      fineSource,
      fineBasis,
    });
  }

  return records.sort((a, b) => {
    const rank = { Missed: 0, Overdue: 1, "Due Soon": 2, "On Track": 3 };
    return rank[a.status] - rank[b.status] || b.fineExposureINR - a.fineExposureINR;
  });
}

function matchesFilters(row: { zone: string; circle: string; division: string; assetKind?: AssetKind }, f: AnalyticsFilters): boolean {
  if (f.zone !== "All" && row.zone !== f.zone) return false;
  if (f.circle !== "All" && row.circle !== f.circle) return false;
  if (f.division !== "All" && row.division !== f.division) return false;
  if (f.assetKind !== "all" && row.assetKind && row.assetKind !== f.assetKind) return false;
  return true;
}

function bucketize(
  assets: AssetRef[],
  maintenance: MaintenanceRecord[],
  level: "zone" | "circle" | "division"
): HierarchyBucket[] {
  const map = new Map<string, HierarchyBucket>();

  for (const a of assets) {
    const key =
      level === "zone"
        ? a.zone
        : level === "circle"
          ? `${a.zone} › ${a.circle}`
          : `${a.zone} › ${a.circle} › ${a.division}`;

    let b = map.get(key);
    if (!b) {
      b = {
        key,
        zone: a.zone,
        circle: level !== "zone" ? a.circle : undefined,
        division: level === "division" ? a.division : undefined,
        substations: 0,
        lines: 0,
        towers: 0,
        avgHealth: 0,
        overdueCount: 0,
        compliancePct: 100,
        fineExposureINR: 0,
      };
      map.set(key, b);
    }
    if (a.kind === "substation") b.substations++;
    if (a.kind === "line") b.lines++;
    if (a.kind === "tower") b.towers += a.towerCount ?? 1;
  }

  for (const b of map.values()) {
    const related = assets.filter((a) => {
      if (level === "zone") return a.zone === b.zone;
      if (level === "circle") return a.zone === b.zone && a.circle === b.circle;
      return a.zone === b.zone && a.circle === b.circle && a.division === b.division;
    });
    b.avgHealth = related.length
      ? Math.round((related.reduce((s, a) => s + a.health, 0) / related.length) * 10) / 10
      : 0;

    const mx = maintenance.filter((m) => {
      if (level === "zone") return m.zone === b.zone;
      if (level === "circle") return m.zone === b.zone && m.circle === b.circle;
      return m.zone === b.zone && m.circle === b.circle && m.division === b.division;
    });
    const overdue = mx.filter((m) => m.status === "Overdue" || m.status === "Missed");
    b.overdueCount = overdue.length;
    b.fineExposureINR = overdue.reduce((s, m) => s + m.fineExposureINR + m.wearTearINR, 0);
    b.compliancePct = mx.length
      ? Math.round(((mx.length - overdue.length) / mx.length) * 1000) / 10
      : 100;
  }

  return [...map.values()].sort((a, b) => b.fineExposureINR - a.fineExposureINR || a.key.localeCompare(b.key));
}

function scopeKey(filters: AnalyticsFilters): string {
  return `${filters.zone}|${filters.circle}|${filters.division}|${filters.assetKind}`;
}

function getGssSubstations(filters: AnalyticsFilters): Substation[] {
  return SUBSTATIONS.filter((s) => {
    if (s.voltage !== "220kV" && s.voltage !== "400kV") return false;
    const zone = normalizeZone(s.zone);
    if (filters.zone !== "All" && zone !== filters.zone) return false;
    if (filters.circle !== "All" && s.circle !== filters.circle) return false;
    if (filters.division !== "All" && s.division !== filters.division) return false;
    return true;
  });
}

function applicableSiteCount(itemKey: string, filters: AnalyticsFilters, pool: Substation[]): number {
  if (pool.length === 0) return 0;
  const seed = hashSeed(`${scopeKey(filters)}:${itemKey}:sites`);
  const ratio = 0.68 + (seed % 32) / 100;
  return Math.max(1, Math.round(pool.length * ratio));
}

function assignComplianceLocations(
  itemKey: string,
  filters: AnalyticsFilters,
  pool: Substation[],
  showCount = 4
): { locations: ComplianceLocation[]; siteCount: number; moreSiteCount: number } {
  if (pool.length === 0) {
    return { locations: [], siteCount: 0, moreSiteCount: 0 };
  }

  const siteCount = applicableSiteCount(itemKey, filters, pool);
  const seed = hashSeed(`${scopeKey(filters)}:${itemKey}:loc`);
  const stride = 5 + (seed % 11);
  const picked = new Map<number, Substation>();
  const sampleSize = Math.min(showCount, siteCount, pool.length);

  for (let i = 0; picked.size < sampleSize && i < pool.length * 2; i++) {
    const ss = pool[(seed + i * stride) % pool.length];
    picked.set(ss.code, ss);
  }

  const locations = [...picked.values()].map((s) => ({
    substation: s.name,
    code: s.code,
    zone: normalizeZone(s.zone),
    circle: s.circle,
    division: s.division,
    voltage: s.voltage,
  }));

  return {
    locations,
    siteCount,
    moreSiteCount: Math.max(0, siteCount - locations.length),
  };
}

function deriveChecklistStatus(
  itemId: string,
  filters: AnalyticsFilters,
  maintenance: MaintenanceRecord[]
): ComplianceStatus {
  const overdueRate =
    maintenance.length > 0
      ? maintenance.filter((m) => m.status === "Overdue" || m.status === "Missed").length /
        maintenance.length
      : 0;
  const roll = hashSeed(`${scopeKey(filters)}:${itemId}`) % 100;
  const adjusted = roll + overdueRate * 45;
  if (adjusted > 82) return "Missed";
  if (adjusted > 68) return "Overdue";
  if (adjusted > 52) return "Due Soon";
  return "On Track";
}

function statusToPct(status: ComplianceStatus): number {
  if (status === "On Track") return 100;
  if (status === "Due Soon") return 75;
  if (status === "Overdue") return 40;
  return 0;
}

function checklistConsequence(status: ComplianceStatus, category: string): string {
  if (status === "On Track") return `${category} PM within HVPNL SOP window.`;
  if (status === "Due Soon") return `${category} window opens soon — delay risks SAF decay & hot-spot faults.`;
  if (status === "Overdue") {
    return `${category} overdue — elevated trip risk, HERC availability penalty exposure.`;
  }
  return `${category} SLA missed — ARR disallowance, accelerated wear, possible insurance void.`;
}

function localSafForSubstation(ss: Substation, maintenance: MaintenanceRecord[]): number {
  const related = maintenance.filter(
    (m) => m.assetKind === "substation" && m.assetId === String(ss.code)
  );
  const overdue = related.filter((m) => m.status === "Overdue" || m.status === "Missed").length;
  const dueSoon = related.filter((m) => m.status === "Due Soon").length;
  const statusPenalty =
    ss.status === "Overload Alert" ? 2.4 : ss.status === "Maintenance" ? 1.6 : ss.status === "Standby" ? 0.8 : 0;
  const health = Math.max(
    35,
    Math.min(98, 100 - Math.round(ss.loadPct * 0.35) - Math.round(statusPenalty * 4))
  );
  const mxPenalty = overdue * 0.65 + dueSoon * 0.15;
  const seed = hashSeed(`saf-local:${ss.code}`) % 8;
  return (
    Math.round(
      Math.max(94, Math.min(99.9, 99.7 - mxPenalty - (100 - health) * 0.07 - seed * 0.04)) * 100
    ) / 100
  );
}

function buildSafLocationBreakdown(
  gssPool: Substation[],
  maintenance: MaintenanceRecord[]
): SafLocationBreakdown {
  let achieved = 0;
  let incentive = 0;
  for (const ss of gssPool) {
    const local = localSafForSubstation(ss, maintenance);
    if (local >= SAF_NORMATIVE_TARGET) achieved++;
    if (local >= SAF_INCENTIVE_TARGET) incentive++;
  }
  return {
    totalGss: gssPool.length,
    achievedCount: achieved,
    pendingCount: Math.max(0, gssPool.length - achieved),
    incentiveCount: incentive,
  };
}

function buildSafMetrics(
  avgHealth: number,
  overdueOrMissed: number,
  plannedMaintenance: number,
  substationCount: number,
  filters: AnalyticsFilters,
  gssPool: Substation[],
  maintenance: MaintenanceRecord[]
): SafMetrics {
  const outagePenalty =
    plannedMaintenance > 0 ? (overdueOrMissed / plannedMaintenance) * 2.8 : 0;
  const healthPenalty = Math.max(0, (88 - avgHealth) * 0.06);
  const seed = hashSeed(scopeKey(filters)) % 15;
  const currentPct =
    Math.round(Math.max(94.2, Math.min(99.85, 99.35 - outagePenalty - healthPenalty - seed * 0.05)) * 100) /
    100;
  const gapToNormative = Math.round((currentPct - SAF_NORMATIVE_TARGET) * 100) / 100;
  const gapToIncentive = Math.round((currentPct - SAF_INCENTIVE_TARGET) * 100) / 100;

  let status: SafMetrics["status"] = "compliant";
  if (currentPct >= SAF_INCENTIVE_TARGET) status = "incentive";
  else if (currentPct >= SAF_NORMATIVE_TARGET) status = "compliant";
  else if (currentPct >= SAF_NORMATIVE_TARGET - 0.5) status = "at_risk";
  else status = "breach";

  const afcScale = Math.max(1, gssPool.length);
  const arrAtRiskINR =
    gapToNormative < 0
      ? Math.min(
          99_50_000,
          Math.round(Math.abs(gapToNormative) * afcScale * 8_500)
        )
      : 0;
  const incentiveEligibleINR =
    gapToIncentive >= 0
      ? Math.min(99_50_000, Math.round(gapToIncentive * afcScale * 4_200))
      : 0;

  const projectedSafIfMissed = Math.max(
    93.5,
    Math.round((currentPct - outagePenalty * 0.6 - 0.4) * 100) / 100
  );

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const safTrend = months.map((month, i) => ({
    month,
    actual: Math.round((currentPct - (5 - i) * 0.08 + seed * 0.01) * 100) / 100,
    target: SAF_NORMATIVE_TARGET,
  }));

  return {
    currentPct,
    normativeTarget: SAF_NORMATIVE_TARGET,
    incentiveTarget: SAF_INCENTIVE_TARGET,
    gapToNormative,
    gapToIncentive,
    status,
    arrAtRiskINR,
    incentiveEligibleINR,
    projectedSafIfMissed,
    safTrend,
    locations: buildSafLocationBreakdown(gssPool, maintenance),
  };
}

function buildPmChecklist(
  filters: AnalyticsFilters,
  maintenance: MaintenanceRecord[],
  gssPool: Substation[]
): PmChecklistRow[] {
  return PM_CHECKLIST_220_400.map((item) => {
    const status = deriveChecklistStatus(item.id, filters, maintenance);
    const { locations, moreSiteCount, siteCount } = assignComplianceLocations(item.id, filters, gssPool);
    return {
      id: item.id,
      frequency: item.frequency,
      frequencyLabel: PM_FREQUENCY_LABEL[item.frequency],
      category: item.category,
      tasks: item.tasks,
      voltages: item.voltages,
      status,
      compliancePct: statusToPct(status),
      consequence: checklistConsequence(status, item.category),
      locations,
      moreSiteCount,
      siteCount,
    };
  });
}

function buildTestingProtocols(
  filters: AnalyticsFilters,
  maintenance: MaintenanceRecord[],
  today: string,
  gssPool: Substation[]
): TestingProtocolRow[] {
  return TESTING_PROTOCOLS.map((p) => {
    const status = deriveChecklistStatus(p.id, filters, maintenance);
    const daysAgo = hashSeed(`${scopeKey(filters)}:${p.id}:done`) % 90;
    const lastCompleted =
      status === "On Track" || status === "Due Soon" ? addDays(today, -daysAgo) : undefined;
    const { locations, moreSiteCount, siteCount } = assignComplianceLocations(p.id, filters, gssPool);
    return {
      id: p.id,
      frequency:
        p.frequency === "continuous"
          ? "Continuous"
          : PM_FREQUENCY_LABEL[p.frequency as PmFrequency],
      category: p.category,
      task: p.task,
      standard: p.standard,
      status,
      lastCompleted,
      locations,
      moreSiteCount,
      siteCount,
    };
  });
}

function buildSafetyCompliance(filters: AnalyticsFilters, gssPool: Substation[]): SafetyComplianceRow[] {
  return SAFETY_REQUIREMENTS.map((req) => {
    const roll = hashSeed(`${scopeKey(filters)}:safety:${req.id}`) % 100;
    const auditScore = Math.max(55, Math.min(100, 92 - (roll % 28)));
    const status: SafetyComplianceRow["status"] =
      auditScore >= 85 ? "Compliant" : auditScore >= 70 ? "Watch" : "Non-Compliant";
    const { locations, moreSiteCount, siteCount } = assignComplianceLocations(
      `safety-${req.id}`,
      filters,
      gssPool
    );
    return {
      id: req.id,
      area: req.area,
      requirement: req.requirement,
      consequence: req.consequence,
      auditScore,
      status,
      locations,
      moreSiteCount,
      siteCount,
    };
  });
}

export function buildAnalyticsSnapshot(filters: AnalyticsFilters = DEFAULT_ANALYTICS_FILTERS): AnalyticsSnapshot {
  const today = todayISO();
  const allAssets = buildAssetUniverse();
  const assets = allAssets.filter((a) => matchesFilters(a, filters));
  const allMx = buildMaintenance(allAssets, today);
  const maintenance = allMx.filter((m) => matchesFilters(m, filters));

  const substations = assets.filter((a) => a.kind === "substation").length;
  const lines = assets.filter((a) => a.kind === "line").length;
  const towers = assets
    .filter((a) => a.kind === "tower")
    .reduce((s, a) => s + (a.towerCount ?? 0), 0);

  const avgHealth = assets.length
    ? Math.round((assets.reduce((s, a) => s + a.health, 0) / assets.length) * 10) / 10
    : 0;

  const overdueOrMissed = maintenance.filter((m) => m.status === "Overdue" || m.status === "Missed");
  const dueSoon = maintenance.filter((m) => m.status === "Due Soon").length;
  const onTrack = maintenance.filter((m) => m.status === "On Track").length;
  const complianceScore = maintenance.length
    ? Math.round((onTrack / maintenance.length) * 1000) / 10
    : 100;

  const fineExposureINR = overdueOrMissed.reduce((s, m) => s + m.fineExposureINR, 0);
  const wearTearINR = overdueOrMissed.reduce((s, m) => s + m.wearTearINR, 0);
  const healthAtRiskPts = Math.round(
    overdueOrMissed.reduce((s, m) => s + m.healthDecayPts, 0) * 10
  ) / 10;

  const bandCounts: Record<HealthBand, number> = { Healthy: 0, Watch: 0, Critical: 0 };
  for (const a of assets) bandCounts[healthBand(a.health)]++;
  const healthBands = (["Healthy", "Watch", "Critical"] as HealthBand[]).map((band) => ({
    band,
    count: bandCounts[band],
    pct: assets.length ? Math.round((bandCounts[band] / assets.length) * 1000) / 10 : 0,
  }));

  const complianceMix: AnalyticsSnapshot["complianceMix"] = [
    { status: "On Track", count: onTrack, color: "#10b981" },
    { status: "Due Soon", count: dueSoon, color: "#f59e0b" },
    {
      status: "Overdue",
      count: maintenance.filter((m) => m.status === "Overdue").length,
      color: "#f97316",
    },
    {
      status: "Missed",
      count: maintenance.filter((m) => m.status === "Missed").length,
      color: "#ef4444",
    },
  ];

  const decaySeries = Array.from({ length: 8 }).map((_, i) => {
    const week = `W${i + 1}`;
    const decay = i * 2.6;
    return {
      week,
      onTrack: Math.round((avgHealth - i * 0.15) * 10) / 10,
      ifMissed: Math.max(30, Math.round((avgHealth - decay) * 10) / 10),
    };
  });

  const gssPool = getGssSubstations(filters);

  const saf = buildSafMetrics(
    avgHealth,
    overdueOrMissed.length,
    maintenance.length,
    substations,
    filters,
    gssPool,
    maintenance
  );

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      substations,
      lines,
      towers,
      avgHealth,
      complianceScore,
      plannedMaintenance: maintenance.length,
      overdueOrMissed: overdueOrMissed.length,
      dueSoon,
      fineExposureINR,
      wearTearINR,
      healthAtRiskPts,
    },
    saf,
    pmChecklist: buildPmChecklist(filters, maintenance, gssPool),
    testingProtocols: buildTestingProtocols(filters, maintenance, today, gssPool),
    safetyCompliance: buildSafetyCompliance(filters, gssPool),
    healthBands,
    complianceMix,
    byZone: bucketize(assets, maintenance, "zone"),
    byCircle: bucketize(assets, maintenance, "circle").slice(0, 12),
    byDivision: bucketize(assets, maintenance, "division").slice(0, 14),
    maintenance,
    spotlight: [...overdueOrMissed]
      .sort((a, b) => b.fineExposureINR + b.wearTearINR - (a.fineExposureINR + a.wearTearINR))
      .slice(0, 10),
    decaySeries,
  };
}

export { SAF_CONSEQUENCES };

export function analyticsFilterOptions(filters: AnalyticsFilters) {
  const assets = buildAssetUniverse();
  const zones = [...new Set(assets.map((a) => a.zone))].sort();
  const circles = [
    ...new Set(
      assets
        .filter((a) => filters.zone === "All" || a.zone === filters.zone)
        .map((a) => a.circle)
    ),
  ].sort();
  const divisions = [
    ...new Set(
      assets
        .filter(
          (a) =>
            (filters.zone === "All" || a.zone === filters.zone) &&
            (filters.circle === "All" || a.circle === filters.circle)
        )
        .map((a) => a.division)
    ),
  ].sort();
  return { zones, circles, divisions };
}

export function formatINR(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Express amounts in lakhs (L) for KPI tiles — intended for totals under ₹1 Cr. */
export function formatINRLakhs(value: number): string {
  const lakhs = value / 1_00_000;
  if (lakhs >= 100) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  return `₹${lakhs.toFixed(2)} L`;
}
