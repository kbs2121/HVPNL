import type { Substation } from "@/lib/types/substation";

const NAMES = ["Ballabgarh", "Faridabad", "Palwal", "Gurgaon", "Rewari", "Panipat", "Karnal", "Rohtak"];
const CIRCLES = ["North", "South", "East", "West"];
const REGIONS = ["Delhi NCR", "Haryana", "Punjab"];
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];
const VOLTAGES: Substation["voltage"][] = ["400kV", "220kV", "66kV"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generate(): Substation[] {
  const rand = seededRandom(42);
  const items: Substation[] = [];
  for (let i = 0; i < 126; i++) {
    const healthScore = rand() < 0.12 ? Math.floor(rand() * 40) + 20 : rand() < 0.35 ? Math.floor(rand() * 24) + 60 : Math.floor(rand() * 14) + 86;
    const gridCols = 14;
    items.push({
      id: `SS-${String(i + 1).padStart(4, "0")}`,
      name: `${VOLTAGES[i % 3]} ${NAMES[i % NAMES.length]} Substation`,
      circle: CIRCLES[i % CIRCLES.length],
      region: REGIONS[i % REGIONS.length],
      zone: ZONES[i % ZONES.length],
      voltage: VOLTAGES[i % 3],
      healthScore,
      activeAlarms: healthScore < 85 ? Math.floor(rand() * 3) + 1 : 0,
      lastMaintenance: `2026-01-${10 + (i % 18)}`,
      gridX: (i % gridCols) * 2.2 - 15,
      gridZ: Math.floor(i / gridCols) * 2.2 - 9,
    });
  }
  return items;
}

export const mockSubstations = generate();
