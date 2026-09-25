"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Gauge,
  MapPin,
  Thermometer,
  Zap,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import type {
  Substation,
  Tower,
  Zone,
  Circle,
  Division,
  TransmissionLine,
  HoverType,
} from "@/lib/types/digitalTwin";
import { HEALTH_HEX, VOLTAGE_HEX } from "@/lib/digitalTwin/constants";
import { jurisdictionStats } from "@/lib/digitalTwin/dataService";
import { cn } from "@/lib/utils";

interface AssetPopupProps {
  type: HoverType;
  data: Substation | Tower | Zone | Circle | Division | TransmissionLine;
  x: number;
  y: number;
}

export function AssetPopup({ type, data, x, y }: AssetPopupProps) {
  const maxX = typeof window !== "undefined" ? window.innerWidth - 340 : x;
  const maxY = typeof window !== "undefined" ? window.innerHeight - 420 : y;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="dt-glass pointer-events-none absolute z-50 w-80 rounded-2xl p-4 shadow-2xl"
      style={{ left: Math.min(x + 16, maxX), top: Math.min(y + 16, maxY) }}
    >
      {type === "substation" && <SubstationCard data={data as Substation} />}
      {type === "tower" && <TowerCard data={data as Tower} />}
      {type === "line" && <LineCard data={data as TransmissionLine} />}
      {(type === "zone" || type === "circle" || type === "division") && (
        <JurisdictionCard type={type} data={data as Zone | Circle | Division} />
      )}
    </motion.div>
  );
}

function SubstationCard({ data: d }: { data: Substation }) {
  const loadPct = Math.round((d.load_MW / d.capacity_MVA) * 100);
  return (
    <>
      <Header
        title={`${d.name} Substation`}
        subtitle={`${d.id} · ${d.voltage_level}`}
        health={d.health}
        status={d.status}
      />
      <Grid2>
        <Row icon={MapPin} label="Zone" value={d.zone} />
        <Row icon={MapPin} label="Circle" value={d.circle} />
        <Row icon={MapPin} label="Division" value={d.division} />
        <Row icon={Zap} label="Capacity" value={`${d.capacity_MVA} MVA`} />
      </Grid2>
      <MetricBlock>
        <Metric label="Incoming" value={`${d.incoming_voltage} kV`} />
        <Metric label="Outgoing" value={`${d.outgoing_voltage} kV`} />
        <Metric label="Load" value={`${d.load_MW} MW`} color="text-cyan-400" />
        <Metric label="Load %" value={`${loadPct}%`} color={loadPct > 85 ? "text-red-400" : "text-emerald-400"} />
        <Metric icon={ArrowDownToLine} label="Received" value={`${d.power_received_MW} MW`} />
        <Metric icon={ArrowUpFromLine} label="Exported" value={`${d.power_sent_MW} MW`} />
        <Metric label="Feeders" value={`${d.feeders_in}↓ ${d.feeders_out}↑`} />
        <Metric label="Transformers" value={String(d.transformers ?? 2)} />
      </MetricBlock>
      <Grid2>
        <Row icon={Thermometer} label="Temperature" value={`${d.temperature_C}°C`} />
        <Row icon={Gauge} label="Oil Level" value={`${d.oil_level_pct}%`} />
        <Row icon={Calendar} label="Last Maint." value={d.last_maintenance} />
        <Row icon={Calendar} label="Next Maint." value={d.maintenance_due} />
      </Grid2>
      <Gps lat={d.latitude} lng={d.longitude} />
    </>
  );
}

function TowerCard({ data: d }: { data: Tower }) {
  return (
    <>
      <Header title={`Tower ${d.tower_number}`} subtitle={`${d.id} · ${d.voltage_level}`} health={d.health} status={d.status} />
      <div className="space-y-1.5 text-[10px]">
        <Row icon={Activity} label="Height" value={`${d.height_m} m`} />
        <Row icon={Zap} label="Type" value={d.tower_type} />
        <Row icon={Zap} label="Line" value={d.line_name} />
        <Row icon={Calendar} label="Maint. Due" value={d.maintenance_due} />
      </div>
      <Gps lat={d.latitude} lng={d.longitude} />
    </>
  );
}

function LineCard({ data: d }: { data: TransmissionLine }) {
  const color = VOLTAGE_HEX[d.voltage_level];
  return (
    <>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{d.name}</h3>
        <p className="text-[10px] text-text-muted">{d.from_substation} → {d.to_substation}</p>
      </div>
      <MetricBlock>
        <Metric label="Voltage" value={d.voltage_level} color="" style={{ color }} />
        <Metric label="Length" value={`${d.length_km} km`} />
        <Metric label="Flow" value={`${d.flow_MW} MW`} color="text-cyan-400" />
        <Metric label="Loading" value={`${d.load_pct}%`} color={d.load_pct > 80 ? "text-amber-400" : "text-emerald-400"} />
        <Metric label="Towers" value={String(d.tower_ids.length)} />
        <Metric label="Health" value={d.health} />
      </MetricBlock>
    </>
  );
}

function JurisdictionCard({
  type,
  data,
}: {
  type: "zone" | "circle" | "division";
  data: Zone | Circle | Division;
}) {
  const stats = jurisdictionStats(type, data.id);
  if (!stats) return null;
  return (
    <>
      <h3 className="mb-2 text-sm font-semibold text-white">{stats.label}</h3>
      <MetricBlock>
        <Metric label="Substations" value={String(stats.substationCount)} />
        <Metric label="Towers" value={String(stats.towerCount)} />
        <Metric label="Line Length" value={`${stats.totalLineKm} km`} />
        <Metric label="Total Load" value={`${stats.totalMW} MW`} color="text-cyan-400" />
      </MetricBlock>
    </>
  );
}

function Header({
  title,
  subtitle,
  health,
  status,
}: {
  title: string;
  subtitle: string;
  health: string;
  status: string;
}) {
  const hex = HEALTH_HEX[health as keyof typeof HEALTH_HEX] ?? "#94a3b8";
  return (
    <div className="mb-3 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-[10px] text-text-muted">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${hex}20`, color: hex }}>
          {health}
        </span>
        <span className="text-[9px] text-text-muted">{status}</span>
      </div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 grid grid-cols-2 gap-1.5 text-[10px]">{children}</div>;
}

function MetricBlock({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 rounded-xl bg-white/[0.03] p-2.5"><div className="grid grid-cols-2 gap-2 text-[10px]">{children}</div></div>;
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 shrink-0 text-text-muted" />
      <span className="text-text-muted">{label}:</span>
      <span className="truncate font-medium text-text-secondary">{value}</span>
    </div>
  );
}

function Metric({ label, value, color, icon: Icon, style }: { label: string; value: string; color?: string; icon?: React.ComponentType<{ className?: string }>; style?: React.CSSProperties }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-text-muted">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </p>
      <p className={cn("font-semibold", color)} style={style}>{value}</p>
    </div>
  );
}

function Gps({ lat, lng }: { lat: number; lng: number }) {
  return (
    <p className="text-[9px] text-text-muted">
      📍 {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
    </p>
  );
}
