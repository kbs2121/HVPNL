"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SubstationDashboard } from "@/components/substation/SubstationDashboard";

export default function SubstationMonitoringPage() {
  return (
    <div className="dashboard-wrapper">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar />
        <SubstationDashboard />
      </div>
    </div>
  );
}
