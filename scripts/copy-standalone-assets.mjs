import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
  console.warn("No standalone output found; skipping asset copy.");
  process.exit(0);
}

mkdirSync(staticDest, { recursive: true });
cpSync(staticSrc, staticDest, { recursive: true });
console.log("Copied .next/static -> .next/standalone/.next/static");

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
  console.log("Copied public -> .next/standalone/public");
}
