"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SubstationDashboard } from "@/components/substation/SubstationDashboard";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";
import { resolveSubstationQuery } from "@/lib/data/substationNavigation";
import { normalizeZone } from "@/lib/data/hierarchyFilters";

function SubstationGisContent() {
  const searchParams = useSearchParams();
  const isFullscreen = useSubstationTwinStore((s) => s.isFullscreen);
  const setFullscreen = useSubstationTwinStore((s) => s.setFullscreen);
  const setHierarchyFilters = useSubstationTwinStore((s) => s.setHierarchyFilters);
  const setSelectedSubstation = useSubstationTwinStore((s) => s.setSelectedSubstation);

  useEffect(() => {
    setFullscreen(false);
  }, [setFullscreen]);

  useEffect(() => {
    const raw = searchParams.get("code") ?? searchParams.get("id");
    if (!raw) return;

    const ss = resolveSubstationQuery(raw);
    if (!ss) return;

    setHierarchyFilters({
      zone: normalizeZone(ss.zone),
      circle: ss.circle,
      division: ss.division,
      substation: ss.name,
      voltage: ss.voltage,
      dateRange: "Today",
    });
    setSelectedSubstation(ss.name);
  }, [searchParams, setHierarchyFilters, setSelectedSubstation]);

  return (
    <DashboardShell hideSidebar={isFullscreen}>
      <SubstationDashboard />
    </DashboardShell>
  );
}

export default function SubstationGisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface-900 text-sm text-text-muted">
          Loading Substation GIS…
        </div>
      }
    >
      <SubstationGisContent />
    </Suspense>
  );
}
