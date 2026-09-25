/**
 * Exports Haryana network data to JSON for the Express backend.
 * Run: npx tsx scripts/export-network-data.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { haryanaNetwork } from "../src/lib/data/haryana/index.ts";

const outDir = join(process.cwd(), "backend", "src", "data");
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "network.json"), JSON.stringify(haryanaNetwork, null, 2));
writeFileSync(
  join(outDir, "networkData.ts"),
  `// Auto-generated — run scripts/export-network-data.ts to refresh
import networkJson from "./network.json" with { type: "json" };
export const network = networkJson;
`
);

console.log("Exported network data:", {
  zones: haryanaNetwork.zones.length,
  substations: haryanaNetwork.substations.length,
  towers: haryanaNetwork.towers.length,
  lines: haryanaNetwork.lines.length,
});
