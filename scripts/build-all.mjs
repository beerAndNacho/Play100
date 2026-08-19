import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

const jobs = [
  ["@play100/portal", "build"],
  ["@play100/game-001-arrow-harbor", "build"],
  ["@play100/game-002-harbor-lost-found", "build"]
];

rmSync("dist", { recursive: true, force: true });

for (const [workspace, script] of jobs) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", script, "--workspace", workspace],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
