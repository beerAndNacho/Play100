import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const root = process.cwd();
const run = spawnSync("python3", ["scripts/generate-factory-config.py"], {
  cwd: root,
  stdio: "inherit"
});
if (run.status !== 0) process.exit(run.status ?? 1);

const factoryDir = resolve(root, "games/factory");
const distFactory = resolve(root, "dist/games/factory");
mkdirSync(distFactory, { recursive: true });

const engineBase64 = readdirSync(resolve(factoryDir, "engine-parts"))
  .filter((name) => /^part-\d+$/.test(name))
  .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
  .map((name) => readFileSync(resolve(factoryDir, "engine-parts", name), "utf8").trim())
  .join("");
const engine = gunzipSync(Buffer.from(engineBase64, "base64")).toString("utf8");
const style = gunzipSync(
  Buffer.from(readFileSync(resolve(factoryDir, "style.css.gz.b64"), "utf8").trim(), "base64")
).toString("utf8");

new vm.Script(engine, { filename: "factory-engine.js" });
if (style.length < 1000) throw new Error("Factory style archive is incomplete.");

writeFileSync(resolve(distFactory, "engine.js"), engine, "utf8");
writeFileSync(resolve(distFactory, "style.css"), style, "utf8");
copyFileSync(resolve(factoryDir, "games.json"), resolve(distFactory, "games.json"));

const games = JSON.parse(readFileSync(resolve(factoryDir, "games.json"), "utf8"));
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

for (const game of games) {
  const dir = resolve(root, "dist/games", game.slug);
  mkdirSync(dir, { recursive: true });
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="${escapeHtml(game.background)}" />
  <meta name="description" content="${escapeHtml(game.description)}" />
  <meta property="og:title" content="${escapeHtml(game.title)} — PLAY100" />
  <meta property="og:description" content="${escapeHtml(game.description)}" />
  <link rel="canonical" href="https://beerandnacho.github.io/Play100/games/${escapeHtml(game.slug)}/" />
  <link rel="stylesheet" href="../factory/style.css?v=100" />
  <title>${escapeHtml(game.title)} — PLAY100 GAME-${String(game.id).padStart(3, "0")}</title>
</head>
<body>
  <div id="app"></div>
  <script>window.PLAY100_SLUG=${JSON.stringify(game.slug)};<\/script>
  <script src="../factory/engine.js?v=100"></script>
</body>
</html>`;
  writeFileSync(resolve(dir, "index.html"), html, "utf8");
}

console.log(`factory pages ok: ${games.length} games, GAME-011 through GAME-100`);
