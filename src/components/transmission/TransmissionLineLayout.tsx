"use client";

import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { HierarchyFilterBar } from "@/components/transmission/HierarchyFilterBar";
import { KpiMetricBand } from "@/components/transmission/KpiMetricBand";
import { LineHealthPanel } from "@/components/transmission/LineHealthPanel";
import { LineStatusTable } from "@/components/transmission/LineStatusTable";
import { useTransmissionLineStore } from "@/hooks/useTransmissionLineStore";

const TransmissionLineMap = dynamic(
  () =>
    import("@/components/transmission/TransmissionLineMap").then(
      (m) => m.TransmissionLineMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-surface-900">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-text-muted">Loading GIS Corridor Map...</p>
        </div>
      </div>
    ),
  }
);

export function TransmissionLineLayout() {
  const isFullscreen = useTransmissionLineStore((s) => s.isFullscreen);

  if (isFullscreen) {
    return (
      <div className="dashboard-wrapper">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TransmissionLineMap />
        </div>
        <LineStatusTable />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <KpiMetricBand />
          <HierarchyFilterBar />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <LineHealthPanel />
            <TransmissionLineMap />
          </div>
        </div>
      </div>
      <LineStatusTable />
    </div>
  );
}
