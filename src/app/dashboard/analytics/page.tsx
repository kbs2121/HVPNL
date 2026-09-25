import { DashboardShell } from "@/components/layout/DashboardShell";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Compliance Dashboard · HVPNL 220/400 kV · Grid SMS",
  description:
    "HVPNL compliance — SAF, preventive maintenance, testing protocols, and safety requirements",
};

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <AnalyticsDashboard />
    </DashboardShell>
  );
}
