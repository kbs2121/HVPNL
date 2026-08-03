import { PowerGridDashboard } from "@/components/power-grid/PowerGridDashboard";

export const metadata = {
  title: "Haryana Power Grid — Transmission Network GIS",
  description:
    "Interactive Leaflet GIS dashboard visualizing Haryana electrical transmission network with animated flow, theme switcher, and jurisdiction layers",
};

export default function PowerGridPage() {
  return <PowerGridDashboard />;
}
