import { existsSync, readFileSync } from "node:fs";

const baseCatalog = JSON.parse(readFileSync("catalog/games.json", "utf8"));
const overrides = JSON.parse(readFileSync("catalog/overrides.json", "utf8"));

if (!Array.isArray(baseCatalog) || baseCatalog.length !== 100) {
  throw new Error(`Expected exactly 100 base games, received ${baseCatalog.length}`);
}
if (!Array.isArray(overrides)) {
  throw new Error("Catalog overrides must be an array.");
}

const overrideById = new Map(overrides.map((entry) => [entry.id, entry]));
const catalog = baseCatalog.map((entry) => overrideById.get(entry.id) ?? entry);
const ids = new Set();
const slugs = new Set();

for (const override of overrides) {
  if (!baseCatalog.some((entry) => entry.id === override.id)) {
    throw new Error(`Override targets missing game id: ${override.id}`);
  }
}

for (const game of catalog) {
  if (!Number.isInteger(game.id) || game.id < 1 || game.id > 100) {
    throw new Error(`Invalid game id: ${game.id}`);
  }
  if (ids.has(game.id)) {
    throw new Error(`Duplicate game id: ${game.id}`);
  }
  if (!/^\d{3}-[a-z0-9-]+$/.test(game.slug)) {
    throw new Error(`Invalid slug: ${game.slug}`);
  }
  if (slugs.has(game.slug)) {
    throw new Error(`Duplicate slug: ${game.slug}`);
  }
  if (!game.title || !game.category || !game.description) {
    throw new Error(`Incomplete catalog entry: ${game.id}`);
  }
  ids.add(game.id);
  slugs.add(game.slug);
}

for (let id = 1; id <= 100; id += 1) {
  if (!ids.has(id)) {
    throw new Error(`Missing GAME-${String(id).padStart(3, "0")}`);
  }
}

const playable = catalog.filter((game) => game.status === "playable");
const playableIds = playable.map((game) => game.id).sort((a, b) => a - b);
const expectedPlayableIds = Array.from({ length: 10 }, (_, index) => index + 1);
if (playableIds.join(",") !== expectedPlayableIds.join(",")) {
  throw new Error(
    `Expected GAME-001 through GAME-010 playable, received ${playableIds.join(",")}`
  );
}

for (const game of playable) {
  if (!game.path) {
    throw new Error(`Playable game is missing path: ${game.id}`);
  }
  if (!existsSync(`games/${game.slug}/package.json`)) {
    throw new Error(`Playable workspace is missing: games/${game.slug}`);
  }
  if (game.id >= 6 && !existsSync(`games/${game.slug}/index.html`)) {
    throw new Error(`Static loader is missing: games/${game.slug}/index.html`);
  }
  if (game.id >= 6 && !existsSync(`games/packs/${game.slug}.js`)) {
    throw new Error(`Packed runtime is missing: games/packs/${game.slug}.js`);
  }
}

console.log(`catalog ok: ${catalog.length} unique games, ${playable.length} playable`);
