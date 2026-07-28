import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "3000";

function killPort(targetPort) {
  if (process.platform === "win32") {
    try {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, {
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of output.split("\n")) {
        if (line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0") pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`Stopped process ${pid} on port ${targetPort}`);
        } catch {
          /* already stopped */
        }
      }
    } catch {
      /* nothing listening */
    }
    return;
  }

  try {
    execSync(`lsof -ti:${targetPort} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    /* nothing listening */
  }
}

console.log("→ Stopping any stale server on port", port);
killPort(port);

console.log("→ Building application...");
execSync("npm run build", { stdio: "inherit", cwd: root });

if (!existsSync(join(root, ".next", "BUILD_ID"))) {
  console.error("Build failed: .next/BUILD_ID not found");
  process.exit(1);
}

// Verify CSS assets were generated (prevents stale-server / missing-stylesheet issues)
const cssDir = join(root, ".next", "static", "css");
if (!existsSync(cssDir)) {
  console.error("Build failed: no CSS output in .next/static/css");
  process.exit(1);
}

console.log("→ Starting production server on port", port);
const child = spawn("npm", ["start"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
