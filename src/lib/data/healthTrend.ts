import type { HealthTrendPoint } from "@/lib/types/substation";

export const healthTrendData: HealthTrendPoint[] = [
  { period: "01-07", score: 78 }, { period: "08-14", score: 80 },
  { period: "15-21", score: 82 }, { period: "22-28", score: 85 },
  { period: "06-12", score: 86 }, { period: "13-19", score: 87 },
  { period: "20-26", score: 88 }, { period: "27-03", score: 85 },
  { period: "11-17", score: 89 }, { period: "18-24", score: 88 },
  { period: "25-01", score: 90 }, { period: "23-30", score: 90 },
];

export const currentHealthScore = 90;
export const healthScoreDelta = 5;
