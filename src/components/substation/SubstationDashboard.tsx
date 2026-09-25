"use client";

import { Substation3DMap } from "@/components/substation/Substation3DMap";
import { SubstationHierarchyFilterBar } from "@/components/substation/SubstationHierarchyFilterBar";
import { SubstationKpiBand } from "@/components/substation/SubstationKpiBand";
import { AssetActionModal } from "@/components/substation/AssetActionModal";
import { CrewDispatchDrawer } from "@/components/substation/CrewDispatchDrawer";
import { useSubstationTwinStore } from "@/hooks/useSubstationTwinStore";

export function SubstationDashboard() {
  const isFullscreen = useSubstationTwinStore((s) => s.isFullscreen);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {!isFullscreen && (
        <>
          <SubstationKpiBand />
          <SubstationHierarchyFilterBar />
        </>
      )}
      <Substation3DMap />
      <AssetActionModal />
      <CrewDispatchDrawer />
    </div>
  );
}
