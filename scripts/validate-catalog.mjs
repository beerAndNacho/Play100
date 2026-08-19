import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("catalog/games.json", "utf8"));

if (!Array.isArray(catalog) || catalog.length !== 100) {
  throw new Error(`Expected exactly 100 games, received ${catalog.length}`);
}

const ids = new Set();
const slugs = new Set();

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
if (playable.length !== 1 || playable[0].id !== 1 || !playable[0].path) {
  throw new Error("GAME-001 must be the only playable launch title.");
}

console.log(`catalog ok: ${catalog.length} unique games`);
