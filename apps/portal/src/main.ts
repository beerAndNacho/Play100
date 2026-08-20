import "./style.css";
import "./game-cards.css";
import catalogData from "../../../catalog/games.json";
import catalogOverrides from "../../../catalog/overrides.json";
import {
  formatGameId,
  getCompletedGameCount,
  getDailyIndex,
  getMedalCount,
  loadArcadeState,
  track
} from "@play100/game-sdk";

interface CatalogEntry {
  id: number;
  slug: string;
  title: string;
  category: string;
  status: "playable" | "next" | "planned";
  mode: string;
  duration: string;
  description: string;
  path: string | null;
}

const baseCatalog = catalogData as CatalogEntry[];
const overrideMap = new Map(
  (catalogOverrides as CatalogEntry[]).map((entry) => [entry.id, entry])
);
const catalog: CatalogEntry[] = baseCatalog.map((entry) => {
  const merged = overrideMap.get(entry.id) ?? entry;
  if (merged.id >= 11) {
    return {
      ...merged,
      status: "playable",
      path: `games/${merged.slug}/`
    };
  }
  return merged;
});

const appRootCandidate = document.querySelector<HTMLDivElement>("#app");
if (!appRootCandidate) throw new Error("Portal root is missing.");
const appRoot: HTMLDivElement = appRootCandidate;
const firstGame = catalog[0];
if (!firstGame) throw new Error("Game catalog is empty.");

const base = import.meta.env.BASE_URL;
const playable = catalog.filter((game) => game.status === "playable");
const dailyGame = playable[getDailyIndex(playable.length)] ?? firstGame;
const categories = ["All", ...new Set(catalog.map((game) => game.category))];
const state = loadArcadeState();
const medals = getMedalCount();

let selectedCategory = "All";
let searchQuery = "";

function gameHref(game: CatalogEntry): string {
  return game.path ? `${base}${game.path}` : "#catalog";
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character] ?? character
  );
}

function gameFamily(game: CatalogEntry): string {
  if (game.id <= 10) return "logic";
  if (game.id <= 20) return "spatial";
  if (game.id <= 30) return "arcade";
  if (game.id <= 40) return "word";
  if (game.id <= 50) return "cozy";
  if (game.id <= 60) return "management";
  if (game.id <= 70) return "strategy";
  if (game.id <= 80) return "deck";
  if (game.id <= 90) return "party";
  return "story";
}

function dailyArtwork(game: CatalogEntry): string {
  if (game.id === 2) {
    return `
      <div class="lost-found-map" aria-hidden="true">
        <span class="warehouse"></span><span class="ferry"></span>
        <span class="crate crate-a"></span><span class="crate crate-b"></span>
        <span class="object object-a">⌕</span><span class="object object-b">⌁</span>
        <span class="object object-c">✦</span><span class="search-ring"></span>
      </div>`;
  }
  if (game.id === 1) {
    return `
      <div class="signal-map" aria-hidden="true">
        <span class="route route-a"></span><span class="route route-b"></span>
        <span class="buoy buoy-a">→</span><span class="buoy buoy-b">↑</span>
        <span class="boat">▲</span><span class="harbor">H</span>
      </div>`;
  }

  const family = gameFamily(game);
  const symbols: Record<string, [string, string, string]> = {
    logic: ["⌕", "◇", "✓"],
    spatial: ["▦", "↻", "◇"],
    arcade: ["●", "↗", "✦"],
    word: ["가", "A", "?"],
    cozy: ["✿", "☾", "♡"],
    management: ["▤", "↔", "!"],
    strategy: ["⬡", "⚑", "+"],
    deck: ["▣", "✧", "♜"],
    party: ["1P", "VS", "2P"],
    story: ["…", "?", "→"]
  };
  const marks = symbols[family] ?? symbols.logic;
  return `
    <div class="factory-art family-${family}" aria-hidden="true">
      <span class="factory-grid"></span>
      <span class="factory-orb orb-a">${marks[0]}</span>
      <span class="factory-orb orb-b">${marks[1]}</span>
      <span class="factory-orb orb-c">${marks[2]}</span>
      <span class="factory-id">${formatGameId(game.id)}</span>
      <span class="factory-title">${escapeHtml(game.title)}</span>
    </div>`;
}

function renderCatalog(): void {
  const list = document.querySelector<HTMLDivElement>("#game-list");
  if (!list) return;
  const normalized = searchQuery.trim().toLowerCase();
  const filtered = catalog.filter((game) => {
    const categoryMatch = selectedCategory === "All" || game.category === selectedCategory;
    const queryMatch =
      !normalized ||
      `${game.title} ${game.description} ${game.category}`.toLowerCase().includes(normalized);
    return categoryMatch && queryMatch;
  });

  list.innerHTML = filtered.length
    ? filtered
        .map((game) => {
          const playableNow = game.status === "playable";
          const statusLabel = playableNow ? "PLAY" : game.status === "next" ? "NEXT" : "PLANNED";
          return `
            <a class="game-row ${playableNow ? "is-playable" : ""}"
               href="${gameHref(game)}" data-game-id="${game.id}"
               ${playableNow ? "" : 'aria-disabled="true"'}>
              <span class="game-number">${formatGameId(game.id)}</span>
              <span class="game-name"><strong>${escapeHtml(game.title)}</strong><small>${escapeHtml(game.description)}</small></span>
              <span class="game-category">${escapeHtml(game.category)}</span>
              <span class="game-mode">${escapeHtml(game.mode)}</span>
              <span class="game-status">${statusLabel}</span>
            </a>`;
        })
        .join("")
    : '<p class="empty-state">조건에 맞는 게임이 없습니다.</p>';

  list.querySelectorAll<HTMLAnchorElement>(".game-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      const game = catalog.find((entry) => String(entry.id) === row.dataset.gameId);
      if (!game || game.status !== "playable") {
        event.preventDefault();
        return;
      }
      track("portal_game_click", { game_id: game.slug, source: "catalog" });
    });
  });
}

function render(): void {
  const completed = getCompletedGameCount();
  const recentGame = state.recentGames
    .map((id) => catalog.find((game) => game.slug === id))
    .find(Boolean);

  appRoot.innerHTML = `
    <div class="portal">
      <header class="topbar">
        <a class="wordmark" href="${base}"><i></i><span>PLAY100</span></a>
        <nav><a href="#daily">TODAY</a><a href="#catalog">INDEX 001—100</a><a href="https://github.com/beerAndNacho/Play100">GITHUB</a></nav>
      </header>
      <main>
        <section class="hero" id="daily">
          <div class="hero-copy">
            <span class="eyebrow">ONE HUNDRED ORIGINAL BROWSER GAMES</span>
            <h1>하루 5분,<br />게임 <em>100개.</em></h1>
            <p>설치와 로그인 없이 바로 시작합니다. 논리 퍼즐부터 2인용·이야기 게임까지, 제목과 연결된 장면과 조작을 100개 주소에 담았습니다.</p>
          </div>
          <article class="daily-card">
            <div class="daily-head"><span>TODAY'S GAME</span><strong>${formatGameId(dailyGame.id)}</strong></div>
            ${dailyArtwork(dailyGame)}
            <div class="daily-copy">
              <p>${escapeHtml(dailyGame.category)} · ${escapeHtml(dailyGame.duration)}</p>
              <h2>${escapeHtml(dailyGame.title)}</h2>
              <span>${escapeHtml(dailyGame.description)}</span>
              <a class="play-button" href="${gameHref(dailyGame)}" data-daily-play>게임 시작 <b>→</b></a>
            </div>
          </article>
        </section>
        <section class="progress-strip">
          <div><span>PLAYABLE</span><strong>${playable.length} / 100</strong></div>
          <div><span>COMPLETED</span><strong>${completed}</strong></div>
          <div><span>MEDALS</span><strong>${medals.gold}G · ${medals.silver}S · ${medals.bronze}B</strong></div>
          <div><span>RECENT</span><strong>${recentGame ? escapeHtml(recentGame.title) : "—"}</strong></div>
        </section>
        <section class="catalog" id="catalog">
          <div class="catalog-heading">
            <div><span class="eyebrow">MASTER GAME INDEX</span><h2>001에서 100까지</h2></div>
            <label class="search"><span>SEARCH</span><input id="game-search" type="search" placeholder="게임 이름이나 장르" /></label>
          </div>
          <div class="category-tabs" id="category-tabs">
            ${categories.map((category) => `<button type="button" class="${category === selectedCategory ? "is-active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}
          </div>
          <div class="game-table-head"><span>NO.</span><span>GAME</span><span>GENRE</span><span>MODE</span><span>STATUS</span></div>
          <div id="game-list" class="game-list"></div>
        </section>
      </main>
      <footer><span>PLAY100 · ORIGINAL WEB ARCADE</span><span>PROGRESS SAVED IN THIS BROWSER</span></footer>
    </div>`;

  document.querySelector<HTMLAnchorElement>("[data-daily-play]")?.addEventListener("click", () => {
    track("portal_game_click", { game_id: dailyGame.slug, source: "daily" });
  });
  const search = document.querySelector<HTMLInputElement>("#game-search");
  if (search) {
    search.value = searchQuery;
    search.addEventListener("input", () => {
      searchQuery = search.value;
      renderCatalog();
    });
  }
  document.querySelectorAll<HTMLButtonElement>("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category ?? "All";
      document.querySelectorAll<HTMLButtonElement>("[data-category]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.category === selectedCategory);
      });
      renderCatalog();
    });
  });
  renderCatalog();
}

render();
track("portal_view", { catalog_size: catalog.length, playable_count: playable.length });
