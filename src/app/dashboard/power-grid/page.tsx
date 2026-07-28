import { PowerGridDashboard } from "@/components/power-grid/PowerGridDashboard";

export const metadata = {
  title: "Haryana Power Grid — Transmission Network GIS",
  description:
    "Interactive Leaflet GIS dashboard visualizing Haryana electrical transmission network with live electricity flow animation",
};

export default function PowerGridPage() {
  return <PowerGridDashboard />;
}
