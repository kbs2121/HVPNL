import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const transcript =
  "C:/Users/arunr/.cursor/projects/c-Users-arunr-SMS/agent-transcripts/65d7d778-c258-4180-881c-6e41cd1eae9d/65d7d778-c258-4180-881c-6e41cd1eae9d.jsonl";

const targets = new Set([
  "src/lib/data/powerGridData.ts",
  "src/components/power-grid/icons.ts",
  "src/components/power-grid/SubstationHoverCard.tsx",
  "src/components/power-grid/LayerControlPanel.tsx",
  "src/components/power-grid/PowerGridMap.tsx",
  "src/components/power-grid/PowerGridDashboard.tsx",
  "src/app/dashboard/power-grid/page.tsx",
]);

const found = {};
const rel = (p) => p.replace(/.*SMS[\\/]/, "").replace(/\\/g, "/");

for (const line of fs.readFileSync(transcript, "utf8").split("\n")) {
  if (!line.trim()) continue;
  let json;
  try {
    json = JSON.parse(line);
  } catch {
    continue;
  }
  const content = json.message?.content;
  if (!Array.isArray(content)) continue;

  for (const item of content) {
    if (item.type !== "tool_use") continue;
    const filePath = item.input?.path;
    if (!filePath) continue;
    const key = rel(filePath);
    if (!targets.has(key)) continue;

    if (item.name === "Write" && item.input.contents) {
      if (!found[key]) found[key] = item.input.contents;
    }
    if (
      item.name === "StrReplace" &&
      found[key] &&
      item.input.old_string &&
      item.input.new_string &&
      found[key].includes(item.input.old_string)
    ) {
      found[key] = found[key].replace(item.input.old_string, item.input.new_string);
    }
  }
}

for (const key of targets) {
  if (!found[key]) {
    console.error("MISSING", key);
    continue;
  }
  const dest = path.join(root, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, found[key]);
  console.log("RESTORED", key);
}
