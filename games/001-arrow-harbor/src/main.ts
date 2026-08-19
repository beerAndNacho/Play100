import "./style.css";
import levelsData from "./levels.json";
import { ArrowHarborGame } from "./game";
import type {
  CompletionResult,
  GameSnapshot,
  LevelDefinition,
  Medal
} from "./types";
import {
  formatGameId,
  getDailyIndex,
  getGameProgress,
  recordGameStart,
  saveLevelResult,
  track
} from "@play100/game-sdk";

const GAME_ID = "001-arrow-harbor";
const levels = levelsData as LevelDefinition[];
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Game root is missing.");
}

const medalLabel: Record<Medal, string> = {
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE"
};

app.innerHTML = `
  <div class="game-page">
    <header class="topbar">
      <a class="play100" href="${import.meta.env.BASE_URL}../../">
        <i></i>
        <span>PLAY100</span>
      </a>
      <div class="game-id">${formatGameId(1)} · LOGIC PUZZLE</div>
      <a class="exit-link" href="${import.meta.env.BASE_URL}../../">게임 목록</a>
    </header>

    <main class="game-layout">
      <aside class="briefing">
        <span class="section-label">HARBOR SIGNAL MANUAL</span>
        <h1>Arrow<br />Harbor</h1>
        <p>
          주황색 부표를 눌러 화살표 방향을 바꾸세요.
          배는 신호를 따라 직진하며 암초에 닿거나 항로 밖으로 나가면 실패합니다.
        </p>

        <div class="rule-sheet">
          <div><span>01</span><b>부표 회전</b><small>클릭·탭 또는 방향키 + Space</small></div>
          <div><span>02</span><b>출항</b><small>모든 신호를 확인한 뒤 L 또는 버튼</small></div>
          <div><span>03</span><b>메달</b><small>최소 회전 수에 가까울수록 높은 등급</small></div>
        </div>

        <div class="level-heading">
          <span>CHARTS</span>
          <b id="progress-count">0 / ${levels.length}</b>
        </div>
        <div id="level-list" class="level-list"></div>
      </aside>

      <section class="play-area">
        <div class="status-line">
          <div><span>CHART</span><strong id="level-name">—</strong></div>
          <div><span>ROTATIONS</span><strong id="rotation-count">0</strong></div>
          <div><span>PAR</span><strong id="par-count">0</strong></div>
          <div><span>STATUS</span><strong id="phase-label">READY</strong></div>
        </div>

        <div class="canvas-frame">
          <canvas
            id="game-canvas"
            tabindex="0"
            aria-label="Arrow Harbor 퍼즐 보드. 방향키로 부표를 고르고 Space로 회전할 수 있습니다."
          ></canvas>
        </div>

        <div class="message-line" id="message-line" aria-live="polite"></div>

        <div class="game-controls">
          <button type="button" class="primary" id="launch-button">
            출항 <span>→</span>
          </button>
          <button type="button" id="retry-button">다시 시도</button>
          <button type="button" id="reset-button">신호 초기화</button>
          <button type="button" id="hint-button">힌트 +2</button>
        </div>

        <div class="level-nav">
          <button type="button" id="previous-level">← 이전 해도</button>
          <button type="button" id="next-level">다음 해도 →</button>
        </div>
      </section>
    </main>

    <div class="result-overlay" id="result-overlay" hidden>
      <section class="result-sheet" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <span class="section-label">ARRIVAL REPORT</span>
        <div class="medal" id="result-medal">GOLD</div>
        <h2 id="result-title">입항 완료</h2>
        <p id="result-summary"></p>
        <div class="result-stats">
          <div><span>ROTATIONS</span><strong id="result-rotations">0</strong></div>
          <div><span>SCORE</span><strong id="result-score">0</strong></div>
        </div>
        <div class="result-actions">
          <button type="button" class="primary" id="result-next">다음 해도</button>
          <button type="button" id="result-share">결과 공유</button>
          <button type="button" id="result-close">닫기</button>
        </div>
      </section>
    </div>
  </div>
`;

const canvasCandidate = document.querySelector<HTMLCanvasElement>("#game-canvas");
if (!canvasCandidate) {
  throw new Error("Game canvas is missing.");
}
const canvas: HTMLCanvasElement = canvasCandidate;

const elements = {
  levelName: document.querySelector<HTMLElement>("#level-name"),
  rotationCount: document.querySelector<HTMLElement>("#rotation-count"),
  parCount: document.querySelector<HTMLElement>("#par-count"),
  phaseLabel: document.querySelector<HTMLElement>("#phase-label"),
  messageLine: document.querySelector<HTMLElement>("#message-line"),
  launchButton: document.querySelector<HTMLButtonElement>("#launch-button"),
  retryButton: document.querySelector<HTMLButtonElement>("#retry-button"),
  resetButton: document.querySelector<HTMLButtonElement>("#reset-button"),
  hintButton: document.querySelector<HTMLButtonElement>("#hint-button"),
  previousLevel: document.querySelector<HTMLButtonElement>("#previous-level"),
  nextLevel: document.querySelector<HTMLButtonElement>("#next-level"),
  levelList: document.querySelector<HTMLDivElement>("#level-list"),
  progressCount: document.querySelector<HTMLElement>("#progress-count"),
  overlay: document.querySelector<HTMLDivElement>("#result-overlay"),
  resultMedal: document.querySelector<HTMLElement>("#result-medal"),
  resultSummary: document.querySelector<HTMLElement>("#result-summary"),
  resultRotations: document.querySelector<HTMLElement>("#result-rotations"),
  resultScore: document.querySelector<HTMLElement>("#result-score"),
  resultNext: document.querySelector<HTMLButtonElement>("#result-next"),
  resultShare: document.querySelector<HTMLButtonElement>("#result-share"),
  resultClose: document.querySelector<HTMLButtonElement>("#result-close")
};

let currentSnapshot: GameSnapshot | null = null;
let latestResult: CompletionResult | null = null;

function assertElement<T>(element: T | null, name: string): T {
  if (!element) {
    throw new Error(`Missing element: ${name}`);
  }
  return element;
}

Object.entries(elements).forEach(([name, element]) => {
  assertElement(element, name);
});

recordGameStart(GAME_ID);

const game = new ArrowHarborGame(canvas, levels, {
  onChange(snapshot) {
    currentSnapshot = snapshot;
    updateInterface(snapshot);
  },
  onComplete(result) {
    latestResult = result;
    saveLevelResult(GAME_ID, result.level.id, {
      medal: result.medal,
      score: result.score,
      rotations: result.rotations
    });
    renderLevelList();
    showResult(result);
  }
});

function phaseText(snapshot: GameSnapshot): string {
  if (snapshot.phase === "running") return "SAILING";
  if (snapshot.phase === "won") return "ARRIVED";
  if (snapshot.phase === "failed") return "OFF COURSE";
  return "READY";
}

function updateInterface(snapshot: GameSnapshot): void {
  assertElement(elements.levelName, "levelName").textContent =
    `${String(snapshot.level.id).padStart(2, "0")} · ${snapshot.level.name}`;
  assertElement(elements.rotationCount, "rotationCount").textContent =
    String(snapshot.rotations);
  assertElement(elements.parCount, "parCount").textContent =
    String(snapshot.level.parRotations);
  assertElement(elements.phaseLabel, "phaseLabel").textContent =
    phaseText(snapshot);
  assertElement(elements.messageLine, "messageLine").textContent =
    snapshot.message;

  const launch = assertElement(elements.launchButton, "launchButton");
  const retry = assertElement(elements.retryButton, "retryButton");

  launch.disabled = snapshot.phase === "running";
  launch.innerHTML =
    snapshot.phase === "won"
      ? "다음 해도 <span>→</span>"
      : snapshot.phase === "running"
        ? "항해 중…"
        : "출항 <span>→</span>";

  retry.hidden = snapshot.phase !== "failed";
  renderLevelList();
}

function renderLevelList(): void {
  const progress = getGameProgress(GAME_ID);
  const completed = Object.keys(progress?.completedLevels ?? {}).length;
  assertElement(elements.progressCount, "progressCount").textContent =
    `${completed} / ${levels.length}`;

  assertElement(elements.levelList, "levelList").innerHTML = levels
    .map((level, index) => {
      const result = progress?.completedLevels[String(level.id)];
      const active = currentSnapshot?.levelIndex === index;
      return `
        <button
          type="button"
          class="level-item ${active ? "is-active" : ""}"
          data-level-index="${index}"
        >
          <span>${String(level.id).padStart(2, "0")}</span>
          <b>${level.name}</b>
          <small>${result ? result.medal.toUpperCase() : "—"}</small>
        </button>
      `;
    })
    .join("");

  assertElement(elements.levelList, "levelList")
    .querySelectorAll<HTMLButtonElement>("[data-level-index]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.levelIndex);
        game.loadLevel(index);
        track("level_select", {
          game_id: GAME_ID,
          level_id: index + 1
        });
      });
    });
}

function showResult(result: CompletionResult): void {
  const overlay = assertElement(elements.overlay, "overlay");
  const medal = assertElement(elements.resultMedal, "resultMedal");

  medal.textContent = medalLabel[result.medal];
  medal.dataset.medal = result.medal;
  assertElement(elements.resultSummary, "resultSummary").textContent =
    result.hintUsed
      ? `${result.level.name} 입항 완료. 힌트를 사용해 Bronze가 기록됐습니다.`
      : `${result.level.name} 입항 완료. 기준 ${result.level.parRotations}회, 실제 ${result.rotations}회입니다.`;
  assertElement(elements.resultRotations, "resultRotations").textContent =
    String(result.rotations);
  assertElement(elements.resultScore, "resultScore").textContent =
    result.score.toLocaleString("ko-KR");

  overlay.hidden = false;
  assertElement(elements.resultNext, "resultNext").focus();
}

function closeResult(): void {
  assertElement(elements.overlay, "overlay").hidden = true;
  canvas.focus();
}

assertElement(elements.launchButton, "launchButton").addEventListener(
  "click",
  () => game.launch()
);
assertElement(elements.retryButton, "retryButton").addEventListener(
  "click",
  () => game.retry()
);
assertElement(elements.resetButton, "resetButton").addEventListener(
  "click",
  () => game.reset()
);
assertElement(elements.hintButton, "hintButton").addEventListener(
  "click",
  () => game.hint()
);
assertElement(elements.previousLevel, "previousLevel").addEventListener(
  "click",
  () => game.previousLevel()
);
assertElement(elements.nextLevel, "nextLevel").addEventListener(
  "click",
  () => game.nextLevel()
);
assertElement(elements.resultNext, "resultNext").addEventListener(
  "click",
  () => {
    closeResult();
    game.nextLevel();
  }
);
assertElement(elements.resultClose, "resultClose").addEventListener(
  "click",
  closeResult
);
assertElement(elements.overlay, "overlay").addEventListener("click", (event) => {
  if (event.target === elements.overlay) {
    closeResult();
  }
});
assertElement(elements.resultShare, "resultShare").addEventListener(
  "click",
  async () => {
    if (!latestResult) return;

    const text =
      `Arrow Harbor · ${latestResult.level.name}\n` +
      `${medalLabel[latestResult.medal]} · ${latestResult.rotations} rotations · ${latestResult.score} pts`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Arrow Harbor — PLAY100",
          text,
          url: window.location.href
        });
        track("game_share", { game_id: GAME_ID, method: "web_share" });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        assertElement(elements.resultShare, "resultShare").textContent =
          "복사됨";
        track("game_share", { game_id: GAME_ID, method: "clipboard" });
      }
    } catch {
      // The user can cancel the native share sheet.
    }
  }
);

const query = new URLSearchParams(window.location.search);
if (query.get("daily") === "1") {
  game.loadLevel(getDailyIndex(levels.length));
}

renderLevelList();
track("game_page_view", { game_id: GAME_ID });
