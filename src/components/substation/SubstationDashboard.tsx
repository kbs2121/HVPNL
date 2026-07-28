"use client";

import { Substation3DMap } from "@/components/substation/Substation3DMap";
import { SubstationHierarchyFilterBar } from "@/components/substation/SubstationHierarchyFilterBar";
import { SubstationKpiBand } from "@/components/substation/SubstationKpiBand";
import { AssetActionModal } from "@/components/substation/AssetActionModal";
import { CrewDispatchDrawer } from "@/components/substation/CrewDispatchDrawer";

export function SubstationDashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <SubstationKpiBand />
      <SubstationHierarchyFilterBar />
      <Substation3DMap />
      <AssetActionModal />
      <CrewDispatchDrawer />
    </div>
  );
}
