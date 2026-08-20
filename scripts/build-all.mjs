import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync
} from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const candidates = [
  ["@play100/portal", "apps/portal/package.json"],
  ["@play100/game-001-arrow-harbor", "games/001-arrow-harbor/package.json"],
  ["@play100/game-002-harbor-lost-found", "games/002-harbor-lost-found/package.json"],
  ["@play100/game-003-lightkeeper", "games/003-lightkeeper/package.json"],
  ["@play100/game-004-one-stroke-courier", "games/004-one-stroke-courier/package.json"],
  ["@play100/game-005-color-customs", "games/005-color-customs/package.json"]
];

rmSync(resolve(root, "dist"), { recursive: true, force: true });

for (const [workspace, packagePath] of candidates) {
  if (!existsSync(resolve(root, packagePath))) continue;
  const metadata = JSON.parse(readFileSync(resolve(root, packagePath), "utf8"));
  if (!metadata.scripts?.build) continue;
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "build", "--workspace", workspace],
    { cwd: root, stdio: "inherit" }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const packedGames = [
  "006-tiny-detective-grid",
  "007-bridge-count",
  "008-clockwork-repair",
  "009-pipe-garden",
  "010-daily-clue-board"
];
mkdirSync(resolve(root, "dist/games/packs"), { recursive: true });
for (const slug of packedGames) {
  const target = resolve(root, "dist/games", slug);
  mkdirSync(target, { recursive: true });
  copyFileSync(resolve(root, "games", slug, "index.html"), resolve(target, "index.html"));
  copyFileSync(resolve(root, "games/packs", `${slug}.js`), resolve(root, "dist/games/packs", `${slug}.js`));
}

const prototypeBuild = spawnSync(
  process.execPath,
  ["prototype-v2/build-games.mjs", resolve(root, "dist")],
  { cwd: root, stdio: "inherit" }
);
if (prototypeBuild.status !== 0) process.exit(prototypeBuild.status ?? 1);

const enhanceCatalog = spawnSync(
  process.execPath,
  ["prototype-v2/enhance-catalog.mjs", resolve(root, "dist/v2/catalog.js")],
  { cwd: root, stdio: "inherit" }
);
if (enhanceCatalog.status !== 0) process.exit(enhanceCatalog.status ?? 1);

copyFileSync(
  resolve(root, "prototype-v2/engine-v3.js"),
  resolve(root, "dist/v2/engine.js")
);

console.log("PLAY100 build complete: title-specific GAME-001 through GAME-100");
