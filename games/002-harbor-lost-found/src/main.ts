import "./style.css";
import { formatGameId, getDailyIndex, getGameProgress, playTone, recordGameStart, saveLevelResult, track } from "@play100/game-sdk";
import { objectLabel, renderSceneSvg } from "./art";
import { scenes } from "./scenes";
import type { GamePhase, Medal, RoundResult, SceneDefinition } from "./types";

const GAME_ID = "002-harbor-lost-found";
const TARGET_COUNT = 8;
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Game root is missing.");
}

const medalText: Record<Medal, string> = {
  gold: "GOLD",
  silver: "SILVER",
  bronze: "BRONZE"
};

app.innerHTML = `
  <div class="game-page">
    <header class="topbar">
      <a class="play100" href="${import.meta.env.BASE_URL}../../">
        <i></i><span>PLAY100</span>
      </a>
      <div class="game-id">${formatGameId(2)} · HIDDEN OBJECT</div>
      <a class="exit-link" href="${import.meta.env.BASE_URL}../../">게임 목록</a>
    </header>

    <main class="game-layout">
      <aside class="case-file">
        <span class="section-label">HARBOR LOST & FOUND OFFICE</span>
        <h1>Harbor<br />Lost & Found</h1>
        <p class="intro-copy">
          항구 곳곳에 섞여 있는 분실물을 찾아주세요.
          클릭과 탭 하나로 즐기는 숨은그림찾기입니다.
        </p>

        <div class="rules">
          <div><span>01</span><b>목록 속 물건 찾기</b><small>장면을 눌러 8개의 분실물을 회수합니다.</small></div>
          <div><span>02</span><b>연속 발견</b><small>3.5초 안에 이어 찾으면 콤보 점수가 붙습니다.</small></div>
          <div><span>03</span><b>오답 주의</b><small>잘못 누르면 3초와 75점이 줄어듭니다.</small></div>
        </div>

        <div class="scene-heading">
          <span>CASE FILES</span>
          <b id="progress-count">0 / ${scenes.length}</b>
        </div>
        <div id="scene-list" class="scene-list"></div>

        <div class="target-heading">
          <span>SEARCH LIST</span>
          <b id="target-count">0 / ${TARGET_COUNT}</b>
        </div>
        <ol id="target-list" class="target-list"></ol>
      </aside>

      <section class="search-deck">
        <div class="mission-card">
          <div>
            <span>CASE</span>
            <strong id="scene-title">—</strong>
          </div>
          <div>
            <span>WEATHER</span>
            <strong id="scene-weather">—</strong>
          </div>
          <div>
            <span>TIME</span>
            <strong id="time-left">01:18</strong>
          </div>
          <div>
            <span>SCORE</span>
            <strong id="score">0</strong>
          </div>
          <div>
            <span>COMBO</span>
            <strong id="combo">×1</strong>
          </div>
        </div>

        <div class="briefing-strip">
          <div>
            <span id="scene-call-sign">CASE 01</span>
            <strong id="scene-subtitle">—</strong>
          </div>
          <p id="scene-briefing">—</p>
        </div>

        <div class="scene-shell">
          <div class="scene-scroll" id="scene-scroll">
            <div id="scene-root" class="scene-root"></div>
          </div>
          <div id="scene-overlay" class="scene-overlay">
            <span class="section-label">READY TO SEARCH</span>
            <h2 id="overlay-title">분실물 수색 준비</h2>
            <p id="overlay-copy">장면을 살펴본 뒤 시작하세요. 시작 버튼을 누르면 시간이 흐릅니다.</p>
            <button type="button" class="primary" id="start-button">수색 시작 <b>→</b></button>
          </div>
        </div>

        <div id="message-line" class="message-line" aria-live="polite">
          장면을 살펴보고 수색을 시작하세요.
        </div>

        <div class="controls">
          <button type="button" class="primary" id="hint-button">등대 힌트 <span id="hint-count">2</span></button>
          <button type="button" id="zoom-out">− 축소</button>
          <button type="button" id="zoom-in">+ 확대</button>
          <button type="button" id="restart-button">장면 다시</button>
        </div>

        <div class="scene-nav">
          <button type="button" id="previous-scene">← 이전 장면</button>
          <button type="button" id="next-scene">다음 장면 →</button>
        </div>
      </section>
    </main>

    <div class="result-overlay" id="result-overlay" hidden>
      <section class="result-sheet" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <span class="section-label">LOST PROPERTY REPORT</span>
        <div class="medal" id="result-medal">GOLD</div>
        <h2 id="result-title">분실물 회수 완료</h2>
        <p id="result-summary"></p>
        <div class="result-stats">
          <div><span>SCORE</span><strong id="result-score">0</strong></div>
          <div><span>TIME</span><strong id="result-time">00:00</strong></div>
          <div><span>MISTAKES</span><strong id="result-mistakes">0</strong></div>
          <div><span>HINTS</span><strong id="result-hints">0</strong></div>
        </div>
        <div class="result-actions">
          <button type="button" class="primary" id="result-next">다음 장면</button>
          <button type="button" id="result-share">결과 공유</button>
          <button type="button" id="result-close">닫기</button>
        </div>
      </section>
    </div>
  </div>
`;

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

const ui = {
  sceneList: required<HTMLDivElement>("#scene-list"),
  progressCount: required<HTMLElement>("#progress-count"),
  targetList: required<HTMLOListElement>("#target-list"),
  targetCount: required<HTMLElement>("#target-count"),
  sceneTitle: required<HTMLElement>("#scene-title"),
  sceneWeather: required<HTMLElement>("#scene-weather"),
  timeLeft: required<HTMLElement>("#time-left"),
  score: required<HTMLElement>("#score"),
  combo: required<HTMLElement>("#combo"),
  sceneCallSign: required<HTMLElement>("#scene-call-sign"),
  sceneSubtitle: required<HTMLElement>("#scene-subtitle"),
  sceneBriefing: required<HTMLElement>("#scene-briefing"),
  sceneRoot: required<HTMLDivElement>("#scene-root"),
  sceneScroll: required<HTMLDivElement>("#scene-scroll"),
  sceneOverlay: required<HTMLDivElement>("#scene-overlay"),
  overlayTitle: required<HTMLElement>("#overlay-title"),
  overlayCopy: required<HTMLElement>("#overlay-copy"),
  startButton: required<HTMLButtonElement>("#start-button"),
  messageLine: required<HTMLElement>("#message-line"),
  hintButton: required<HTMLButtonElement>("#hint-button"),
  hintCount: required<HTMLElement>("#hint-count"),
  zoomOut: required<HTMLButtonElement>("#zoom-out"),
  zoomIn: required<HTMLButtonElement>("#zoom-in"),
  restartButton: required<HTMLButtonElement>("#restart-button"),
  previousScene: required<HTMLButtonElement>("#previous-scene"),
  nextScene: required<HTMLButtonElement>("#next-scene"),
  resultOverlay: required<HTMLDivElement>("#result-overlay"),
  resultMedal: required<HTMLElement>("#result-medal"),
  resultSummary: required<HTMLElement>("#result-summary"),
  resultScore: required<HTMLElement>("#result-score"),
  resultTime: required<HTMLElement>("#result-time"),
  resultMistakes: required<HTMLElement>("#result-mistakes"),
  resultHints: required<HTMLElement>("#result-hints"),
  resultNext: required<HTMLButtonElement>("#result-next"),
  resultShare: required<HTMLButtonElement>("#result-share"),
  resultClose: required<HTMLButtonElement>("#result-close")
};

let sceneIndex = 0;
let phase: GamePhase = "ready";
let targets = new Set<string>();
let found = new Set<string>();
let score = 0;
let mistakes = 0;
let hintsLeft = 2;
let hintsUsed = 0;
let combo = 1;
let lastFoundAt = 0;
let timeLeft = 0;
let timerHandle: number | null = null;
let zoom = 1;
let latestResult: RoundResult | null = null;
let shuffleSeed = Date.now() >>> 0;

recordGameStart(GAME_ID);

function currentScene(): SceneDefinition {
  const scene = scenes[sceneIndex];
  if (!scene) {
    throw new Error(`Missing scene ${sceneIndex}`);
  }
  return scene;
}

function seededRandom(): number {
  shuffleSeed = (shuffleSeed * 1664525 + 1013904223) >>> 0;
  return shuffleSeed / 4294967296;
}

function chooseTargets(scene: SceneDefinition): Set<string> {
  const ids = scene.objects.map((object) => object.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(seededRandom() * (index + 1));
    const value = ids[index];
    ids[index] = ids[swapIndex] ?? ids[index] ?? "";
    ids[swapIndex] = value ?? "";
  }
  return new Set(ids.filter(Boolean).slice(0, TARGET_COUNT));
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function stopTimer(): void {
  if (timerHandle !== null) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
}

function setOverlay(title: string, copy: string, button: string): void {
  ui.overlayTitle.textContent = title;
  ui.overlayCopy.textContent = copy;
  ui.startButton.innerHTML = `${button} <b>→</b>`;
  ui.sceneOverlay.hidden = false;
}

function hideOverlay(): void {
  ui.sceneOverlay.hidden = true;
}

function loadScene(index: number): void {
  stopTimer();
  sceneIndex = (index + scenes.length) % scenes.length;
  const scene = currentScene();
  shuffleSeed = (Date.now() + scene.id * 7919) >>> 0;
  targets = chooseTargets(scene);
  found = new Set();
  score = 0;
  mistakes = 0;
  hintsLeft = 2;
  hintsUsed = 0;
  combo = 1;
  lastFoundAt = 0;
  timeLeft = scene.timeLimit;
  zoom = 1;
  phase = "ready";
  latestResult = null;
  document.body.dataset.scene = scene.layout;
  ui.sceneScroll.scrollTo({ left: 0, top: 0 });
  setOverlay(
    `${scene.name} 수색 준비`,
    "장면을 먼저 살펴본 뒤 시작하세요. 목록 속 물건 8개를 찾으면 완료됩니다.",
    "수색 시작"
  );
  renderAll();
  track("hidden_scene_select", { game_id: GAME_ID, scene_id: scene.id });
}

function beginRound(): void {
  if (phase !== "ready") return;
  phase = "playing";
  hideOverlay();
  ui.messageLine.textContent = "수색을 시작했습니다. 목록 속 분실물을 찾아주세요.";
  timerHandle = window.setInterval(() => {
    if (phase !== "playing") return;
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      loseRound();
    }
  }, 1000);
  playTone(520, 0.08, 0.025);
  track("hidden_round_start", {
    game_id: GAME_ID,
    scene_id: currentScene().id,
    target_count: targets.size
  });
}

function renderScene(): void {
  const scene = currentScene();
  ui.sceneRoot.innerHTML = renderSceneSvg(scene, targets, found);
  const svg = required<SVGSVGElement>("#hidden-scene");
  svg.style.width = `${zoom * 100}%`;

  svg.querySelectorAll<SVGGElement>(".scene-object").forEach((objectElement) => {
    objectElement.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = objectElement.dataset.objectId;
      if (id) handleObject(id, objectElement);
    });
    objectElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const id = objectElement.dataset.objectId;
      if (id) handleObject(id, objectElement);
    });
  });

  svg.addEventListener("pointerdown", (event) => {
    if (phase !== "playing") return;
    const point = svgPoint(svg, event);
    wrongSelection(point.x, point.y, "목록에 없는 곳입니다.");
  });
}

function renderSceneList(): void {
  const progress = getGameProgress(GAME_ID);
  const completed = Object.keys(progress?.completedLevels ?? {}).length;
  ui.progressCount.textContent = `${completed} / ${scenes.length}`;
  ui.sceneList.innerHTML = scenes
    .map((scene, index) => {
      const result = progress?.completedLevels[String(scene.id)];
      return `
        <button
          type="button"
          class="scene-item ${index === sceneIndex ? "is-active" : ""}"
          data-scene-index="${index}"
        >
          <span>${String(scene.id).padStart(2, "0")}</span>
          <b>${scene.name}</b>
          <small>${result ? result.medal.toUpperCase() : "—"}</small>
        </button>
      `;
    })
    .join("");

  ui.sceneList
    .querySelectorAll<HTMLButtonElement>("[data-scene-index]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        loadScene(Number(button.dataset.sceneIndex));
      });
    });
}

function renderTargetList(): void {
  const scene = currentScene();
  const targetArray = [...targets];
  ui.targetCount.textContent = `${found.size} / ${targets.size}`;
  ui.targetList.innerHTML = targetArray
    .map((id, index) => {
      const done = found.has(id);
      return `
        <li class="${done ? "is-found" : ""}" data-target-id="${id}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <b>${objectLabel(scene, id)}</b>
          <i>${done ? "찾음" : "·"}</i>
        </li>
      `;
    })
    .join("");
}

function updateHud(): void {
  const scene = currentScene();
  ui.sceneTitle.textContent = `${String(scene.id).padStart(2, "0")} · ${scene.name}`;
  ui.sceneWeather.textContent = scene.weather;
  ui.timeLeft.textContent = formatTime(timeLeft);
  ui.timeLeft.classList.toggle("is-low", timeLeft <= 15);
  ui.score.textContent = score.toLocaleString("ko-KR");
  ui.combo.textContent = `×${combo}`;
  ui.sceneCallSign.textContent = scene.callSign;
  ui.sceneSubtitle.textContent = scene.subtitle;
  ui.sceneBriefing.textContent = scene.briefing;
  ui.hintCount.textContent = String(hintsLeft);
  ui.hintButton.disabled = phase !== "playing" || hintsLeft <= 0 || found.size >= targets.size;
  ui.zoomOut.disabled = zoom <= 1;
  ui.zoomIn.disabled = zoom >= 1.75;
}

function renderAll(): void {
  renderSceneList();
  renderTargetList();
  renderScene();
  updateHud();
}

function handleObject(id: string, element: SVGGElement): void {
  if (phase !== "playing" || found.has(id)) return;
  const object = currentScene().objects.find((candidate) => candidate.id === id);
  if (!object) return;

  if (!targets.has(id)) {
    wrongSelection(object.x, object.y, `${object.label}은(는) 현재 목록에 없습니다.`);
    return;
  }

  const now = performance.now();
  combo = now - lastFoundAt <= 3500 ? Math.min(combo + 1, 6) : 1;
  lastFoundAt = now;
  found.add(id);
  const gained = 180 + combo * 45 + Math.floor(timeLeft * 1.5);
  score += gained;
  element.classList.add("is-found");
  renderTargetList();
  updateHud();
  ui.messageLine.textContent = `${object.label} 발견! +${gained.toLocaleString("ko-KR")} · 콤보 ×${combo}`;
  playTone(620 + combo * 70, 0.08, 0.025);
  flashFeedback(object.x, object.y, "correct", `+${gained}`);

  track("hidden_object_found", {
    game_id: GAME_ID,
    scene_id: currentScene().id,
    object_id: id,
    combo
  });

  if (found.size >= targets.size) {
    completeRound();
  }
}

function svgPoint(svg: SVGSVGElement, event: PointerEvent): { x: number; y: number } {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 600, y: 360 };
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

function wrongSelection(x: number, y: number, message: string): void {
  if (phase !== "playing") return;
  mistakes += 1;
  combo = 1;
  timeLeft = Math.max(0, timeLeft - 3);
  score = Math.max(0, score - 75);
  ui.messageLine.textContent = `${message} · 시간 -3초`;
  playTone(165, 0.12, 0.03);
  flashFeedback(x, y, "wrong", "×");
  updateHud();
  if (timeLeft <= 0) loseRound();
}

function flashFeedback(
  x: number,
  y: number,
  type: "correct" | "wrong",
  text: string
): void {
  const layer = document.querySelector<SVGGElement>("#feedback-layer");
  if (!layer) return;
  const id = `feedback-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  layer.insertAdjacentHTML(
    "beforeend",
    `<g id="${id}" class="tap-feedback ${type}" transform="translate(${x} ${y})">
      <circle r="29"/>
      <text y="6" text-anchor="middle">${text}</text>
    </g>`
  );
  window.setTimeout(() => document.getElementById(id)?.remove(), 760);
}

function useHint(): void {
  if (phase !== "playing" || hintsLeft <= 0) return;
  const remaining = [...targets].filter((id) => !found.has(id));
  const id = remaining[Math.floor(seededRandom() * remaining.length)];
  if (!id) return;
  const element = document.querySelector<SVGGElement>(`[data-object-id="${id}"]`);
  if (!element) return;
  hintsLeft -= 1;
  hintsUsed += 1;
  combo = 1;
  score = Math.max(0, score - 220);
  element.classList.add("is-hinted");
  ui.messageLine.textContent = `${objectLabel(currentScene(), id)} 주변에 등대 신호를 비췄습니다.`;
  playTone(860, 0.14, 0.02);
  updateHud();
  window.setTimeout(() => element.classList.remove("is-hinted"), 1800);
  track("hidden_hint_use", {
    game_id: GAME_ID,
    scene_id: currentScene().id,
    hints_used: hintsUsed
  });
}

function calculateMedal(): Medal {
  if (hintsUsed === 0 && mistakes <= 1 && timeLeft >= 20) return "gold";
  if (mistakes <= 5 && timeLeft > 0) return "silver";
  return "bronze";
}

function completeRound(): void {
  if (phase !== "playing") return;
  stopTimer();
  phase = "won";
  const scene = currentScene();
  score += timeLeft * 20;
  const medal = calculateMedal();
  latestResult = {
    scene,
    medal,
    score,
    mistakes,
    hintsUsed,
    timeLeft
  };
  saveLevelResult(GAME_ID, scene.id, {
    medal,
    score,
    rotations: mistakes + hintsUsed * 2
  });
  renderSceneList();
  updateHud();
  showResult(latestResult);
  playTone(660, 0.11, 0.025);
  window.setTimeout(() => playTone(880, 0.13, 0.025), 100);
  window.setTimeout(() => playTone(1180, 0.16, 0.02), 210);
  track("hidden_round_complete", {
    game_id: GAME_ID,
    scene_id: scene.id,
    medal,
    score,
    mistakes,
    hints_used: hintsUsed,
    time_left: timeLeft
  });
}

function loseRound(): void {
  if (phase !== "playing") return;
  stopTimer();
  phase = "lost";
  setOverlay(
    "수색 시간이 끝났습니다",
    `${targets.size - found.size}개의 분실물이 남았습니다. 같은 장면에서 목록을 새로 섞어 다시 도전할 수 있습니다.`,
    "다시 수색"
  );
  ui.messageLine.textContent = "시간 종료. 장면을 다시 살펴보고 재도전하세요.";
  playTone(150, 0.2, 0.035);
  track("hidden_round_fail", {
    game_id: GAME_ID,
    scene_id: currentScene().id,
    found_count: found.size
  });
}

function showResult(result: RoundResult): void {
  ui.resultMedal.textContent = medalText[result.medal];
  ui.resultMedal.dataset.medal = result.medal;
  ui.resultSummary.textContent =
    `${result.scene.name}에서 분실물 ${targets.size}개를 모두 회수했습니다. ` +
    `남은 시간 ${formatTime(result.timeLeft)}, 오답 ${result.mistakes}회입니다.`;
  ui.resultScore.textContent = result.score.toLocaleString("ko-KR");
  ui.resultTime.textContent = formatTime(result.timeLeft);
  ui.resultMistakes.textContent = String(result.mistakes);
  ui.resultHints.textContent = String(result.hintsUsed);
  ui.resultOverlay.hidden = false;
  ui.resultNext.focus();
}

function closeResult(): void {
  ui.resultOverlay.hidden = true;
}

function changeZoom(delta: number): void {
  zoom = Math.min(1.75, Math.max(1, Math.round((zoom + delta) * 4) / 4));
  const svg = document.querySelector<SVGSVGElement>("#hidden-scene");
  if (svg) svg.style.width = `${zoom * 100}%`;
  updateHud();
  ui.messageLine.textContent = `장면 확대 ${Math.round(zoom * 100)}%`;
}

ui.startButton.addEventListener("click", () => {
  if (phase === "lost") {
    loadScene(sceneIndex);
  }
  beginRound();
});
ui.hintButton.addEventListener("click", useHint);
ui.zoomOut.addEventListener("click", () => changeZoom(-0.25));
ui.zoomIn.addEventListener("click", () => changeZoom(0.25));
ui.restartButton.addEventListener("click", () => loadScene(sceneIndex));
ui.previousScene.addEventListener("click", () => loadScene(sceneIndex - 1));
ui.nextScene.addEventListener("click", () => loadScene(sceneIndex + 1));
ui.resultNext.addEventListener("click", () => {
  closeResult();
  loadScene(sceneIndex + 1);
});
ui.resultClose.addEventListener("click", closeResult);
ui.resultOverlay.addEventListener("click", (event) => {
  if (event.target === ui.resultOverlay) closeResult();
});
ui.resultShare.addEventListener("click", async () => {
  if (!latestResult) return;
  const text =
    `Harbor Lost & Found · ${latestResult.scene.name}\n` +
    `${medalText[latestResult.medal]} · ${latestResult.score.toLocaleString("ko-KR")}점 · ` +
    `오답 ${latestResult.mistakes}회`;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Harbor Lost & Found — PLAY100",
        text,
        url: window.location.href
      });
      track("game_share", { game_id: GAME_ID, method: "web_share" });
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      ui.resultShare.textContent = "복사됨";
      track("game_share", { game_id: GAME_ID, method: "clipboard" });
    }
  } catch {
    // Native share can be cancelled by the player.
  }
});

const query = new URLSearchParams(window.location.search);
if (query.get("daily") === "1") {
  sceneIndex = getDailyIndex(scenes.length);
}

loadScene(sceneIndex);
track("game_page_view", { game_id: GAME_ID });
