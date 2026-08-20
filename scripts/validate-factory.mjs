import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const root = process.cwd();
const generated = spawnSync("python3", ["scripts/generate-factory-config.py"], {
  cwd: root,
  stdio: "inherit"
});
if (generated.status !== 0) process.exit(generated.status ?? 1);

const baseCatalog = JSON.parse(readFileSync(resolve(root, "catalog/games.json"), "utf8"));
const games = JSON.parse(readFileSync(resolve(root, "games/factory/games.json"), "utf8"));
const errors = [];
const ids = new Set();
const slugs = new Set();
const families = new Map();
const descriptions = new Set();
const firstEnvironments = new Set();

if (!Array.isArray(games) || games.length !== 90) {
  errors.push(`Factory must contain exactly 90 games, received ${games?.length ?? "invalid"}`);
}

const requireText = (game, key, minimum) => {
  if (typeof game[key] !== "string" || game[key].trim().length < minimum) {
    errors.push(`${game.slug}: ${key} must be at least ${minimum} characters`);
  }
};
const requireList = (game, key, minimum) => {
  const value = game[key];
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${game.slug}: ${key} needs at least ${minimum} entries`);
    return;
  }
  if (new Set(value.map(String)).size !== value.length) {
    errors.push(`${game.slug}: ${key} contains duplicates`);
  }
};

for (const game of games) {
  const source = baseCatalog.find((entry) => entry.id === game.id);
  if (!source) errors.push(`${game.slug}: missing base catalog entry`);
  if (source && (source.slug !== game.slug || source.title !== game.title)) {
    errors.push(`${game.slug}: catalog title or slug mismatch`);
  }
  if (!Number.isInteger(game.id) || game.id < 11 || game.id > 100) {
    errors.push(`${game.slug}: invalid id ${game.id}`);
  }
  if (ids.has(game.id)) errors.push(`${game.slug}: duplicate id ${game.id}`);
  if (slugs.has(game.slug)) errors.push(`${game.slug}: duplicate slug`);
  ids.add(game.id);
  slugs.add(game.slug);

  families.set(game.family, (families.get(game.family) ?? 0) + 1);
  if (descriptions.has(game.description)) errors.push(`${game.slug}: duplicate description`);
  descriptions.add(game.description);
  const firstEnvironment = game.environments?.[0];
  if (firstEnvironments.has(firstEnvironment)) errors.push(`${game.slug}: duplicate lead environment`);
  firstEnvironments.add(firstEnvironment);

  requireText(game, "description", 18);
  requireText(game, "themePromise", 40);
  requireText(game, "mechanicsToTheme", 40);
  requireList(game, "coreVerbs", 3);
  requireList(game, "signatureObjects", 8);
  requireList(game, "environments", 3);
  requireList(game, "feedback", 6);
  requireList(game, "input", 2);

  if (!game.input?.includes("mouse") || !game.input?.includes("touch")) {
    errors.push(`${game.slug}: mouse and touch support are required`);
  }
  if (!game.funLoop || game.funLoop.onboardingSeconds > 15) {
    errors.push(`${game.slug}: onboarding must be 15 seconds or less`);
  }
  if (!game.funLoop || game.funLoop.firstSuccessSeconds > 120) {
    errors.push(`${game.slug}: first success must be within 120 seconds`);
  }
  if (!game.funLoop || game.funLoop.restartSeconds > 3) {
    errors.push(`${game.slug}: restart must take 3 seconds or less`);
  }
  if (!Array.isArray(game.funLoop?.replayMotivators) || game.funLoop.replayMotivators.length < 3) {
    errors.push(`${game.slug}: at least three replay motivators are required`);
  }
}

for (let id = 11; id <= 100; id += 1) {
  if (!ids.has(id)) errors.push(`Missing GAME-${String(id).padStart(3, "0")}`);
}
if (families.size !== 9) errors.push(`Expected 9 game families, received ${families.size}`);
for (const [family, count] of families) {
  if (count !== 10) errors.push(`${family}: expected 10 games, received ${count}`);
}

const engineBase64 = readdirSync(resolve(root, "games/factory/engine-parts"))
  .filter((name) => /^part-\d+$/.test(name))
  .sort()
  .map((name) => readFileSync(resolve(root, "games/factory/engine-parts", name), "utf8").trim())
  .join("");
try {
  const engine = gunzipSync(Buffer.from(engineBase64, "base64")).toString("utf8");
  new vm.Script(engine, { filename: "factory-engine.js" });
  if (engine.length < 30000) errors.push("Factory engine is unexpectedly small");
} catch (error) {
  errors.push(`Factory engine archive is invalid: ${error.message}`);
}
try {
  const style = gunzipSync(
    Buffer.from(readFileSync(resolve(root, "games/factory/style.css.gz.b64"), "utf8").trim(), "base64")
  ).toString("utf8");
  if (style.length < 5000) errors.push("Factory stylesheet is unexpectedly small");
} catch (error) {
  errors.push(`Factory style archive is invalid: ${error.message}`);
}

if (errors.length) {
  console.error("Factory validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`factory validation ok: ${games.length} games across ${families.size} distinct families`);
}
