import { DigitalTwinLayout } from "@/components/digital-twin/DigitalTwinLayout";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Network Digital Twin — Grid SMS",
  description:
    "Enterprise-grade electricity transmission network digital twin for Haryana State Electricity Transmission Corporation",
};

export default function DigitalTwinPage() {
  return (
    <DashboardShell>
      <DigitalTwinLayout />
    </DashboardShell>
  );
}
