import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const catalog = readJson("catalog/games.json");
const overrides = readJson("catalog/overrides.json");
const overrideMap = new Map(overrides.map((entry) => [entry.id, entry]));
const playable = catalog
  .map((entry) => overrideMap.get(entry.id) ?? entry)
  .filter((entry) => entry.status === "playable");
const errors = [];

const requireText = (manifest, key, minimum) => {
  if (typeof manifest[key] !== "string" || manifest[key].trim().length < minimum) {
    errors.push(`${manifest.slug}: ${key} must be at least ${minimum} characters`);
  }
};

const requireList = (manifest, key, minimum) => {
  const value = manifest[key];
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${manifest.slug}: ${key} needs at least ${minimum} entries`);
    return;
  }
  if (new Set(value.map(String)).size !== value.length) {
    errors.push(`${manifest.slug}: ${key} contains duplicates`);
  }
};

for (const game of playable) {
  const path = `games/${game.slug}/game.manifest.json`;
  if (!existsSync(resolve(root, path))) {
    errors.push(`${game.slug}: missing ${path}`);
    continue;
  }

  const manifest = readJson(path);
  if (manifest.id !== game.id) errors.push(`${game.slug}: id mismatch`);
  if (manifest.slug !== game.slug) errors.push(`${game.slug}: slug mismatch`);
  if (manifest.title !== game.title) errors.push(`${game.slug}: title mismatch`);
  if (manifest.status !== "playable") errors.push(`${game.slug}: status mismatch`);

  requireText(manifest, "themePromise", 40);
  requireText(manifest, "mechanicsToTheme", 40);
  requireList(manifest, "coreVerbs", 3);
  requireList(manifest, "signatureObjects", 8);
  requireList(manifest, "environments", 3);
  requireList(manifest, "feedback", 6);
  requireList(manifest, "input", 2);

  if (!manifest.input?.includes("mouse") || !manifest.input?.includes("touch")) {
    errors.push(`${game.slug}: mouse and touch support are required`);
  }

  const loop = manifest.funLoop;
  if (!loop || typeof loop !== "object") {
    errors.push(`${game.slug}: funLoop is required`);
    continue;
  }
  if (!Number.isFinite(loop.onboardingSeconds) || loop.onboardingSeconds > 15) {
    errors.push(`${game.slug}: onboarding must be 15 seconds or less`);
  }
  if (!Number.isFinite(loop.firstSuccessSeconds) || loop.firstSuccessSeconds > 120) {
    errors.push(`${game.slug}: first success must be within 120 seconds`);
  }
  if (!Number.isFinite(loop.restartSeconds) || loop.restartSeconds > 3) {
    errors.push(`${game.slug}: restart must take 3 seconds or less`);
  }
  if (!Array.isArray(loop.replayMotivators) || loop.replayMotivators.length < 3) {
    errors.push(`${game.slug}: at least three replay motivators are required`);
  }
}

if (errors.length) {
  console.error("Game experience validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Experience validation passed for ${playable.length} playable games.`);
}
