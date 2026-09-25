import type { Substation } from "@/lib/types/substation";
import { mockSubstations } from "@/lib/data/mockSubstations";

export function usePortfolioStats() {
  const critical = mockSubstations.filter((s) => s.healthScore < 60).length;
  const warning = mockSubstations.filter((s) => s.healthScore >= 60 && s.healthScore < 85).length;
  const healthy = mockSubstations.filter((s) => s.healthScore >= 85).length;
  return { total: mockSubstations.length, critical, warning, healthy };
}

export type { Substation };
