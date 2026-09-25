import { PowerGridDashboard } from "@/components/power-grid/PowerGridDashboard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Transmission Network GIS — Grid SMS",
  description:
    "Interactive Leaflet GIS dashboard visualizing Haryana electrical transmission network with animated flow, generation sources, and jurisdiction layers",
};

export default function PowerGridPage() {
  return (
    <DashboardShell>
      <PowerGridDashboard />
    </DashboardShell>
  );
}
