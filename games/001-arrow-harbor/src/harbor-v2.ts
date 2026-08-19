import "./harbor-v2.css";
import levelsData from "./levels.json";
import { HarborGameV2, getHarborBriefing } from "./harbor-game-v2";
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
  gold: "GOLD DOCKING",
  silver: "SILVER DOCKING",
  bronze: "BRONZE DOCKING"
};

app.innerHTML = `
  <div class="harbor-page">
    <header class="topbar">
      <a class="play100" href="${import.meta.env.BASE_URL}../../">
        <i></i>
        <span>PLAY100</span>
      </a>
      <div class="game-id">${formatGameId(1)} · HARBOR CONTROL PUZZLE</div>
      <a class="exit-link" href="${import.meta.env.BASE_URL}../../">오락실로</a>
    </header>

    <main class="harbor-layout">
      <aside class="harbor-log">
        <div class="log-heading">
          <span class="eyebrow">HARBOR MASTER LOG</span>
          <span class="shift-badge">SHIFT 01</span>
        </div>
        <h1>Arrow<br /><em>Harbor</em></h1>
        <p class="game-pitch">
          배를 직접 움직이지 않습니다. 항구에 떠 있는 화살표 부표를 돌려
          암초 사이에 안전한 항로를 만들고 화물선을 등대 부두까지 입항시키세요.
        </p>

        <section class="mission-card">
          <div class="mission-top">
            <span>ACTIVE MISSION</span>
            <strong id="call-sign">AH-01</strong>
          </div>
          <p id="mission-text"></p>
          <div class="cargo-line">
            <span>CARGO</span>
            <b id="cargo-text">—</b>
          </div>
        </section>

        <section class="weather-board" aria-label="현재 항만 환경">
          <div><span>WEATHER</span><b id="weather-text">—</b></div>
          <div><span>TIDE</span><b id="tide-text">—</b></div>
          <div><span>VISIBILITY</span><b id="visibility-text">—</b></div>
        </section>

        <section class="legend">
          <span class="eyebrow">NAVIGATION LEGEND</span>
          <div><i class="legend-buoy"></i><b>신호 부표</b><small>눌러서 화살표 방향 회전</small></div>
          <div><i class="legend-reef"></i><b>암초·방파제</b><small>닿으면 좌초, 항로 재설정</small></div>
          <div><i class="legend-lighthouse"></i><b>등대 부두</b><small>최종 입항 지점</small></div>
        </section>

        <div class="level-heading">
          <span>HARBOR CHARTS</span>
          <b id="progress-count">0 / ${levels.length}</b>
        </div>
        <div id="level-list" class="level-list"></div>
      </aside>

      <section class="control-room">
        <div class="status-line">
          <div class="chart-cell"><span>CHART</span><strong id="level-name">—</strong></div>
          <div><span>BUOY TURNS</span><strong id="rotation-count">0</strong></div>
          <div><span>PAR</span><strong id="par-count">0</strong></div>
          <div><span>VESSEL</span><strong id="phase-label">STANDBY</strong></div>
        </div>

        <section class="harbor-stage" aria-label="항구 퍼즐 환경">
          <div class="stage-sky" aria-hidden="true">
            <span class="cloud cloud-one"></span>
            <span class="cloud cloud-two"></span>
            <span class="gull gull-one">⌁</span>
            <span class="gull gull-two">⌁</span>
          </div>
          <div class="breakwater" aria-hidden="true"></div>
          <div class="stage-lighthouse" aria-hidden="true">
            <i></i><b></b><span></span>
          </div>
          <div class="canvas-frame">
            <canvas
              id="game-canvas"
              tabindex="0"
              aria-label="Arrow Harbor 항구 해도. 부표를 누르면 화살표가 회전합니다. 방향키로 부표를 선택하고 Space로 회전할 수 있습니다."
            ></canvas>
          </div>
          <div class="dock-edge" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </section>

        <section class="radio-console">
          <div class="radio-light"><i></i><span>HARBOR RADIO</span></div>
          <p id="message-line" aria-live="polite"></p>
        </section>

        <div class="game-controls">
          <button type="button" class="primary launch" id="launch-button">
            <span>출항 승인</span><b>→</b>
          </button>
          <button type="button" id="retry-button">예인선 회항</button>
          <button type="button" id="reset-button">부표 원위치</button>
          <button type="button" id="hint-button">등대 신호 +2</button>
        </div>

        <div class="level-nav">
          <button type="button" id="previous-level">← 이전 해도</button>
          <div class="keyboard-tip">방향키 선택 · Space 회전 · L 출항</div>
          <button type="button" id="next-level">다음 해도 →</button>
        </div>
      </section>
    </main>

    <div class="result-overlay" id="result-overlay" hidden>
      <section class="result-sheet" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div class="result-beacon" aria-hidden="true"><i></i><span></span></div>
        <span class="eyebrow">DOCKING REPORT</span>
        <div class="medal" id="result-medal">GOLD DOCKING</div>
        <h2 id="result-title">입항 완료</h2>
        <p id="result-summary"></p>
        <div class="result-stats">
          <div><span>BUOY TURNS</span><strong id="result-rotations">0</strong></div>
          <div><span>HARBOR SCORE</span><strong id="result-score">0</strong></div>
        </div>
        <div class="result-actions">
          <button type="button" class="primary" id="result-next">다음 항구</button>
          <button type="button" id="result-share">항해 기록 공유</button>
          <button type="button" id="result-close">관제실로</button>
        </div>
      </section>
    </div>
  </div>
`;

const canvas = required(
  document.querySelector<HTMLCanvasElement>("#game-canvas"),
  "game-canvas"
);

const elements = {
  levelName: required(document.querySelector<HTMLElement>("#level-name"), "level-name"),
  rotationCount: required(document.querySelector<HTMLElement>("#rotation-count"), "rotation-count"),
  parCount: required(document.querySelector<HTMLElement>("#par-count"), "par-count"),
  phaseLabel: required(document.querySelector<HTMLElement>("#phase-label"), "phase-label"),
  messageLine: required(document.querySelector<HTMLElement>("#message-line"), "message-line"),
  launchButton: required(document.querySelector<HTMLButtonElement>("#launch-button"), "launch-button"),
  retryButton: required(document.querySelector<HTMLButtonElement>("#retry-button"), "retry-button"),
  resetButton: required(document.querySelector<HTMLButtonElement>("#reset-button"), "reset-button"),
  hintButton: required(document.querySelector<HTMLButtonElement>("#hint-button"), "hint-button"),
  previousLevel: required(document.querySelector<HTMLButtonElement>("#previous-level"), "previous-level"),
  nextLevel: required(document.querySelector<HTMLButtonElement>("#next-level"), "next-level"),
  levelList: required(document.querySelector<HTMLDivElement>("#level-list"), "level-list"),
  progressCount: required(document.querySelector<HTMLElement>("#progress-count"), "progress-count"),
  callSign: required(document.querySelector<HTMLElement>("#call-sign"), "call-sign"),
  missionText: required(document.querySelector<HTMLElement>("#mission-text"), "mission-text"),
  cargoText: required(document.querySelector<HTMLElement>("#cargo-text"), "cargo-text"),
  weatherText: required(document.querySelector<HTMLElement>("#weather-text"), "weather-text"),
  tideText: required(document.querySelector<HTMLElement>("#tide-text"), "tide-text"),
  visibilityText: required(document.querySelector<HTMLElement>("#visibility-text"), "visibility-text"),
  overlay: required(document.querySelector<HTMLDivElement>("#result-overlay"), "result-overlay"),
  resultMedal: required(document.querySelector<HTMLElement>("#result-medal"), "result-medal"),
  resultSummary: required(document.querySelector<HTMLElement>("#result-summary"), "result-summary"),
  resultRotations: required(document.querySelector<HTMLElement>("#result-rotations"), "result-rotations"),
  resultScore: required(document.querySelector<HTMLElement>("#result-score"), "result-score"),
  resultNext: required(document.querySelector<HTMLButtonElement>("#result-next"), "result-next"),
  resultShare: required(document.querySelector<HTMLButtonElement>("#result-share"), "result-share"),
  resultClose: required(document.querySelector<HTMLButtonElement>("#result-close"), "result-close")
};

let currentSnapshot: GameSnapshot | null = null;
let latestResult: CompletionResult | null = null;

function required<T>(value: T | null, name: string): T {
  if (!value) throw new Error(`Missing element: ${name}`);
  return value;
}

recordGameStart(GAME_ID);

const game = new HarborGameV2(canvas, levels, {
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
  if (snapshot.phase === "won") return "MOORED";
  if (snapshot.phase === "failed") return "MAYDAY";
  return "STANDBY";
}

function updateInterface(snapshot: GameSnapshot): void {
  const briefing = getHarborBriefing(snapshot.level);
  document.documentElement.dataset.harborTheme = briefing.theme;

  elements.levelName.textContent =
    `${String(snapshot.level.id).padStart(2, "0")} · ${snapshot.level.name}`;
  elements.rotationCount.textContent = String(snapshot.rotations);
  elements.parCount.textContent = String(snapshot.level.parRotations);
  elements.phaseLabel.textContent = phaseText(snapshot);
  elements.phaseLabel.dataset.phase = snapshot.phase;
  elements.messageLine.textContent = snapshot.message;

  elements.callSign.textContent = briefing.callSign;
  elements.missionText.textContent = briefing.mission;
  elements.cargoText.textContent = briefing.cargo;
  elements.weatherText.textContent = briefing.weather;
  elements.tideText.textContent = briefing.tide;
  elements.visibilityText.textContent = briefing.visibility;

  elements.launchButton.disabled = snapshot.phase === "running";
  elements.launchButton.innerHTML =
    snapshot.phase === "won"
      ? "<span>다음 항구</span><b>→</b>"
      : snapshot.phase === "running"
        ? "<span>항해 중…</span><b>···</b>"
        : "<span>출항 승인</span><b>→</b>";

  elements.retryButton.hidden = snapshot.phase !== "failed";
  renderLevelList();
}

function renderLevelList(): void {
  const progress = getGameProgress(GAME_ID);
  const completed = Object.keys(progress?.completedLevels ?? {}).length;
  elements.progressCount.textContent = `${completed} / ${levels.length}`;

  elements.levelList.innerHTML = levels
    .map((level, index) => {
      const result = progress?.completedLevels[String(level.id)];
      const active = currentSnapshot?.levelIndex === index;
      const briefing = getHarborBriefing(level);
      return `
        <button
          type="button"
          class="level-item ${active ? "is-active" : ""}"
          data-level-index="${index}"
        >
          <span>${String(level.id).padStart(2, "0")}</span>
          <span class="level-copy"><b>${level.name}</b><small>${briefing.weather}</small></span>
          <em>${result ? result.medal.toUpperCase() : "OPEN"}</em>
        </button>
      `;
    })
    .join("");

  elements.levelList
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
  const briefing = getHarborBriefing(result.level);
  elements.resultMedal.textContent = medalLabel[result.medal];
  elements.resultMedal.dataset.medal = result.medal;
  elements.resultSummary.textContent = result.hintUsed
    ? `${briefing.callSign} 입항 완료. 등대 신호를 사용해 Bronze 기록으로 저장됐습니다.`
    : `${briefing.callSign} 입항 완료. 기준 ${result.level.parRotations}회, 실제 ${result.rotations}회로 부표를 정렬했습니다.`;
  elements.resultRotations.textContent = String(result.rotations);
  elements.resultScore.textContent = result.score.toLocaleString("ko-KR");
  elements.overlay.hidden = false;
  elements.resultNext.focus();
}

function closeResult(): void {
  elements.overlay.hidden = true;
  canvas.focus();
}

elements.launchButton.addEventListener("click", () => game.launch());
elements.retryButton.addEventListener("click", () => game.retry());
elements.resetButton.addEventListener("click", () => game.reset());
elements.hintButton.addEventListener("click", () => game.hint());
elements.previousLevel.addEventListener("click", () => game.previousLevel());
elements.nextLevel.addEventListener("click", () => game.nextLevel());
elements.resultNext.addEventListener("click", () => {
  closeResult();
  game.nextLevel();
});
elements.resultClose.addEventListener("click", closeResult);
elements.overlay.addEventListener("click", (event) => {
  if (event.target === elements.overlay) closeResult();
});

elements.resultShare.addEventListener("click", async () => {
  if (!latestResult) return;
  const briefing = getHarborBriefing(latestResult.level);
  const text =
    `Arrow Harbor · ${briefing.callSign}\n` +
    `${medalLabel[latestResult.medal]} · ${latestResult.rotations} buoy turns · ${latestResult.score} pts`;

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
      elements.resultShare.textContent = "기록 복사됨";
      track("game_share", { game_id: GAME_ID, method: "clipboard" });
    }
  } catch {
    // Native share sheets may be cancelled by the player.
  }
});

const query = new URLSearchParams(window.location.search);
if (query.get("daily") === "1") {
  game.loadLevel(getDailyIndex(levels.length));
}

renderLevelList();
track("game_page_view", { game_id: GAME_ID, visual_version: "harbor-world-v2" });
