"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  Wifi,
  Zap,
} from "lucide-react";
import { useDigitalTwinStore } from "@/hooks/useDigitalTwinStore";
import { search } from "@/lib/digitalTwin/dataService";
import { ThemeToggle } from "../controls/ThemeToggle";
import { cn } from "@/lib/utils";

export function DigitalTwinHeader() {
  const {
    searchQuery,
    setSearchQuery,
    setSearchResults,
    selectSearchResult,
    isConnected,
    refreshDashboard,
    toggleOutageMode,
    isOutageMode,
    basemapId,
  } = useDigitalTwinStore();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSearchResults(search(value));
  };

  return (
    <header className="dt-glass absolute left-0 right-0 top-0 z-30 flex h-14 items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 shadow-glow-cyan">
          <Zap className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white">
            HSETCL Digital Twin
          </h1>
          <p className="text-[10px] text-text-muted">
            Enterprise Transmission GIS · {basemapId.replace(/-/g, " ")}
          </p>
        </div>
      </div>

      <div className="relative mx-4 max-w-lg flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search zones, substations, towers, lines..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="dt-input w-full rounded-xl py-2 pl-10 pr-4 text-sm"
        />
        <SearchDropdown />
      </div>

      <div className="flex items-center gap-1.5">
        <StatusPill connected={isConnected} />
        <ThemeToggle />
        <IconBtn icon={Bell} label="Alerts" badge={3} />
        <IconBtn icon={RefreshCw} label="Refresh" onClick={refreshDashboard} />
        <IconBtn
          icon={AlertTriangle}
          label="Outage simulation"
          onClick={toggleOutageMode}
          active={isOutageMode}
        />
        <IconBtn icon={Settings} label="Settings" />
      </div>
    </header>
  );
}

function SearchDropdown() {
  const { searchQuery, searchResults, selectSearchResult } = useDigitalTwinStore();
  if (!searchQuery || searchResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="dt-glass absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl p-1 shadow-2xl"
    >
      {searchResults.map((r) => (
        <button
          key={`${r.type}-${r.id}`}
          onClick={() => selectSearchResult(r)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
        >
          <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{r.name}</p>
            <p className="truncate text-[10px] text-text-muted">{r.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] uppercase text-cyan-400">
            {r.type}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold",
        connected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
      <Wifi className="h-3 w-3" />
      LIVE
    </div>
  );
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
  badge,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10",
        active && "bg-amber-500/20 ring-1 ring-amber-500/40"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-amber-400" : "text-text-secondary")} />
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export function KpiRibbon() {
  const dashboard = useDigitalTwinStore((s) => s.dashboard);

  const items = [
    { label: "Demand", value: dashboard.totalDemandMW, unit: "MW", color: "text-blue-400" },
    { label: "Generation", value: dashboard.totalGenerationMW, unit: "MW", color: "text-emerald-400" },
    { label: "Losses", value: dashboard.systemLossesMW, unit: "MW", color: "text-amber-400" },
    { label: "Xfmr Load", value: dashboard.avgTransformerLoading, unit: "%", color: "text-purple-400" },
    { label: "Line Util.", value: dashboard.avgLineUtilization, unit: "%", color: "text-cyan-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-[360px] top-[4.5rem] z-20 flex h-12 items-center gap-2 xl:left-1/2 xl:-translate-x-1/2"
    >
      {items.map((k) => (
        <div key={k.label} className="dt-glass flex h-12 min-w-[70px] flex-col justify-center rounded-xl px-2.5 text-center">
          <p className="text-[8px] uppercase tracking-wider text-text-muted">{k.label}</p>
          <p className={cn("text-xs font-bold tabular-nums leading-tight", k.color)}>
            {k.value}
            <span className="ml-0.5 text-[8px] font-normal text-text-muted">{k.unit}</span>
          </p>
        </div>
      ))}
    </motion.div>
  );
}
