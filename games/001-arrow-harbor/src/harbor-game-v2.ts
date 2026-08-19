import { playTone } from "@play100/game-sdk";
import type {
  BuoyDefinition,
  CompletionResult,
  Direction,
  GamePhase,
  GameSnapshot,
  LevelDefinition,
  Medal,
  Point
} from "./types";

const DIRECTION_VECTORS: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

const DIRECTION_ANGLES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI] as const;

interface BoatState extends Point {
  direction: Direction;
}

interface Motion {
  from: Point;
  to: Point;
  startedAt: number;
  duration: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bornAt: number;
  life: number;
  color: string;
  gravity: number;
}

export interface HarborBriefing {
  theme: "dawn" | "day" | "mist" | "night";
  weather: string;
  tide: string;
  visibility: string;
  callSign: string;
  mission: string;
  cargo: string;
}

interface HarborTheme {
  skyTop: string;
  skyBottom: string;
  waterTop: string;
  waterBottom: string;
  foam: string;
  chart: string;
  reef: string;
  reefLight: string;
  sand: string;
  fog: number;
  rain: boolean;
  night: boolean;
}

const THEMES: Record<HarborBriefing["theme"], HarborTheme> = {
  dawn: {
    skyTop: "#f2b66f",
    skyBottom: "#dce3d6",
    waterTop: "#2b7180",
    waterBottom: "#174856",
    foam: "#d9eee8",
    chart: "#b8d5d1",
    reef: "#273b3d",
    reefLight: "#526760",
    sand: "#c9b783",
    fog: 0.08,
    rain: false,
    night: false
  },
  day: {
    skyTop: "#8db6c0",
    skyBottom: "#dbe3d8",
    waterTop: "#1d687b",
    waterBottom: "#123f50",
    foam: "#d9f0eb",
    chart: "#b3d5d3",
    reef: "#253b3c",
    reefLight: "#4f655d",
    sand: "#c6ad73",
    fog: 0.03,
    rain: false,
    night: false
  },
  mist: {
    skyTop: "#91a8a8",
    skyBottom: "#cbd5cf",
    waterTop: "#4e7880",
    waterBottom: "#254f5a",
    foam: "#d7e6e2",
    chart: "#c5d8d5",
    reef: "#334747",
    reefLight: "#64736b",
    sand: "#b7aa82",
    fog: 0.3,
    rain: false,
    night: false
  },
  night: {
    skyTop: "#071b2b",
    skyBottom: "#183a49",
    waterTop: "#123e52",
    waterBottom: "#071e2b",
    foam: "#9bc2c5",
    chart: "#7faeb2",
    reef: "#101c22",
    reefLight: "#31434a",
    sand: "#7f7355",
    fog: 0.16,
    rain: true,
    night: true
  }
};

const BRIEFINGS: ReadonlyArray<Omit<HarborBriefing, "callSign">> = [
  {
    theme: "dawn",
    weather: "새벽 잔물결",
    tide: "들물 +0.4m",
    visibility: "8 NM",
    mission: "첫 신호 부표를 정렬해 화물선을 동쪽 등대 부두로 유도하세요.",
    cargo: "우편 자루 18"
  },
  {
    theme: "dawn",
    weather: "옅은 해무",
    tide: "들물 +0.7m",
    visibility: "5 NM",
    mission: "폭이 좁은 수로를 통과해 북쪽 선착장에 안전하게 입항시키세요.",
    cargo: "의약품 상자 12"
  },
  {
    theme: "dawn",
    weather: "북풍 3",
    tide: "정조",
    visibility: "7 NM",
    mission: "북풍이 부는 외항에서 부표 신호를 따라 방파제 안쪽으로 들어오세요.",
    cargo: "어망 24"
  },
  {
    theme: "day",
    weather: "맑음",
    tide: "썰물 -0.3m",
    visibility: "10 NM",
    mission: "갈라진 두 부두 사이에서 올바른 항로만 골라 서쪽 계류장으로 이동하세요.",
    cargo: "목재 묶음 9"
  },
  {
    theme: "day",
    weather: "붉은 조류",
    tide: "강한 썰물",
    visibility: "6 NM",
    mission: "붉은 조류 구간을 피해 신호선을 따라 내항의 붉은 창고까지 도착하세요.",
    cargo: "향신료 통 16"
  },
  {
    theme: "day",
    weather: "남서풍 4",
    tide: "들물 +0.2m",
    visibility: "9 NM",
    mission: "긴 부두 외곽을 돌아 마지막 녹색 등대 앞 계류장에 정박하세요.",
    cargo: "기계 부품 10"
  },
  {
    theme: "mist",
    weather: "짙은 해무",
    tide: "정조",
    visibility: "2 NM",
    mission: "거짓 회항 신호에 속지 말고 안개 속 등대 호출부호를 따라가세요.",
    cargo: "등유 드럼 8"
  },
  {
    theme: "mist",
    weather: "저층 안개",
    tide: "들물 +0.9m",
    visibility: "1.5 NM",
    mission: "복잡한 항만 미로를 통과해 가장 안쪽의 수리 도크로 들어가세요.",
    cargo: "예비 닻 4"
  },
  {
    theme: "mist",
    weather: "회전 조류",
    tide: "변침 주의",
    visibility: "4 NM",
    mission: "같은 수로를 반복하지 않도록 조류 고리를 끊고 북쪽 항구를 찾으세요.",
    cargo: "냉동 어획 14"
  },
  {
    theme: "night",
    weather: "야간 맑음",
    tide: "들물 +0.5m",
    visibility: "등화 의존",
    mission: "항만 등화만 보고 암초 사이 야간 항로를 완성하세요.",
    cargo: "야간 우편 21"
  },
  {
    theme: "night",
    weather: "소나기",
    tide: "거친 너울",
    visibility: "1 NM",
    mission: "비바람 속에서 등대 불빛을 놓치지 말고 구조 부두로 접근하세요.",
    cargo: "구조 장비 6"
  },
  {
    theme: "night",
    weather: "폭풍 전야",
    tide: "고조 +1.2m",
    visibility: "0.8 NM",
    mission: "마지막 교대 근무입니다. 모든 신호를 정렬해 중앙 도크에 입항시키세요.",
    cargo: "항만 기록물 100"
  }
];

export function getHarborBriefing(level: LevelDefinition): HarborBriefing {
  const source = BRIEFINGS[(level.id - 1) % BRIEFINGS.length] ?? BRIEFINGS[0];
  if (!source) {
    throw new Error("Harbor briefing is unavailable.");
  }
  return {
    ...source,
    callSign: `AH-${String(level.id).padStart(2, "0")}`
  };
}

interface HarborGameOptions {
  onChange?: (snapshot: GameSnapshot) => void;
  onComplete?: (result: CompletionResult) => void;
}

export class HarborGameV2 {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly levels: LevelDefinition[];
  private readonly options: HarborGameOptions;
  private readonly resizeObserver: ResizeObserver;

  private levelIndex = 0;
  private phase: GamePhase = "planning";
  private buoyDirections: Direction[] = [];
  private rotations = 0;
  private failures = 0;
  private hintUsed = false;
  private selectedBuoy = 0;
  private message = "항만 관제실 대기 중. 부표를 정렬하고 출항하세요.";
  private boat: BoatState = { x: 0, y: 0, direction: 1 };
  private motion: Motion | null = null;
  private nextMoveAt = 0;
  private trail: Point[] = [];
  private visited = new Set<string>();
  private animationFrame = 0;
  private logicalSize = 720;
  private destroyed = false;
  private particles: Particle[] = [];
  private shakeUntil = 0;
  private collisionPoint: Point | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    levels: LevelDefinition[],
    options: HarborGameOptions = {}
  ) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    this.canvas = canvas;
    this.context = context;
    this.levels = levels;
    this.options = options;
    this.resizeObserver = new ResizeObserver(() => this.resize());

    this.canvas.addEventListener("pointerdown", this.handlePointer);
    this.canvas.addEventListener("keydown", this.handleKeyboard);
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    this.loadLevel(0);
    this.animationFrame = requestAnimationFrame(this.tick);
  }

  get currentLevel(): LevelDefinition {
    const level = this.levels[this.levelIndex];
    if (!level) {
      throw new Error(`Missing level ${this.levelIndex}`);
    }
    return level;
  }

  loadLevel(index: number): void {
    const bounded = Math.min(Math.max(index, 0), this.levels.length - 1);
    this.levelIndex = bounded;
    const level = this.currentLevel;
    this.buoyDirections = level.buoys.map((buoy) => buoy.direction);
    this.phase = "planning";
    this.rotations = 0;
    this.failures = 0;
    this.hintUsed = false;
    this.selectedBuoy = 0;
    this.message = `${getHarborBriefing(level).callSign} 해도 로드 완료. 신호 부표를 정렬하세요.`;
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.visited.clear();
    this.particles = [];
    this.collisionPoint = null;
    this.resize();
    this.emitChange();
  }

  launch(): void {
    if (this.phase === "running") return;
    if (this.phase === "won") {
      this.nextLevel();
      return;
    }

    const level = this.currentLevel;
    this.phase = "running";
    this.message = `${getHarborBriefing(level).callSign}, 출항 승인. 등대 부두까지 항로를 확인합니다.`;
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.visited = new Set([
      this.stateKey(level.start.x, level.start.y, level.start.direction)
    ]);
    this.nextMoveAt = performance.now() + 320;
    this.collisionPoint = null;
    playTone(112, 0.22, 0.035);
    window.setTimeout(() => playTone(440, 0.06, 0.018), 120);
    this.emitChange();
  }

  reset(): void {
    const level = this.currentLevel;
    this.buoyDirections = level.buoys.map((buoy) => buoy.direction);
    this.phase = "planning";
    this.rotations = 0;
    this.hintUsed = false;
    this.message = "모든 부표를 초기 신호로 되돌렸습니다.";
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.particles = [];
    this.collisionPoint = null;
    this.emitChange();
  }

  retry(): void {
    if (this.phase !== "failed") return;
    this.phase = "planning";
    this.message = "예인선이 배를 출발 지점으로 옮겼습니다. 부표를 다시 조정하세요.";
    this.boat = { ...this.currentLevel.start };
    this.motion = null;
    this.trail = [{ x: this.currentLevel.start.x, y: this.currentLevel.start.y }];
    this.collisionPoint = null;
    this.emitChange();
  }

  hint(): void {
    if (this.phase === "running") return;

    const level = this.currentLevel;
    const index = level.buoys.findIndex(
      (buoy, buoyIndex) => this.buoyDirections[buoyIndex] !== buoy.solution
    );

    if (index < 0) {
      this.message = "등대 관제실: 모든 부표 신호가 맞습니다. 출항을 승인합니다.";
      this.emitChange();
      return;
    }

    const buoy = level.buoys[index];
    if (!buoy) return;

    const current = this.buoyDirections[index] ?? buoy.direction;
    const clockwiseTurns = (buoy.solution - current + 4) % 4;
    this.buoyDirections[index] = buoy.solution;
    this.rotations += clockwiseTurns + 2;
    this.hintUsed = true;
    this.selectedBuoy = index;
    this.spawnSplash(buoy, "#f8d568", 18);
    this.message = `등대 섬광이 ${index + 1}번 부표의 올바른 방향을 표시했습니다. 페널티 +2`;
    playTone(740, 0.08, 0.025);
    window.setTimeout(() => playTone(980, 0.1, 0.02), 80);
    this.emitChange();
  }

  nextLevel(): void {
    this.loadLevel((this.levelIndex + 1) % this.levels.length);
  }

  previousLevel(): void {
    this.loadLevel(
      (this.levelIndex - 1 + this.levels.length) % this.levels.length
    );
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointerdown", this.handlePointer);
    this.canvas.removeEventListener("keydown", this.handleKeyboard);
  }

  private readonly handlePointer = (event: PointerEvent): void => {
    if (this.phase === "running") return;

    this.canvas.focus();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.logicalSize / rect.width;
    const scaleY = this.logicalSize / rect.height;
    const point = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };

    const board = this.boardGeometry();
    const gridX = Math.floor((point.x - board.x) / board.cell);
    const gridY = Math.floor((point.y - board.y) / board.cell);
    const index = this.currentLevel.buoys.findIndex(
      (buoy) => buoy.x === gridX && buoy.y === gridY
    );

    if (index >= 0) this.rotateBuoy(index);
  };

  private readonly handleKeyboard = (event: KeyboardEvent): void => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      this.selectedBuoy =
        (this.selectedBuoy + 1) % this.currentLevel.buoys.length;
      this.message = `${this.selectedBuoy + 1}번 신호 부표 선택`;
      this.emitChange();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      this.selectedBuoy =
        (this.selectedBuoy - 1 + this.currentLevel.buoys.length) %
        this.currentLevel.buoys.length;
      this.message = `${this.selectedBuoy + 1}번 신호 부표 선택`;
      this.emitChange();
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (this.phase === "planning" || this.phase === "failed") {
        this.rotateBuoy(this.selectedBuoy);
      }
      return;
    }

    if (event.key.toLowerCase() === "l") {
      event.preventDefault();
      this.launch();
    }
  };

  private rotateBuoy(index: number): void {
    if (this.phase === "running") return;
    if (this.phase === "failed") this.retry();

    const buoy = this.currentLevel.buoys[index];
    if (!buoy?.rotatable) return;

    const current = this.buoyDirections[index] ?? buoy.direction;
    this.buoyDirections[index] = ((current + 1) % 4) as Direction;
    this.selectedBuoy = index;
    this.rotations += 1;
    this.spawnSplash(buoy, "#dff4ee", 12);
    this.message = `${index + 1}번 부표를 시계 방향으로 회전했습니다. 총 ${this.rotations}회`;
    playTone(500 + index * 18, 0.05, 0.02);
    this.emitChange();
  }

  private readonly tick = (time: number): void => {
    if (this.destroyed) return;
    if (this.phase === "running") this.updateSimulation(time);
    this.updateParticles(time);
    this.draw(time);
    this.animationFrame = requestAnimationFrame(this.tick);
  };

  private updateSimulation(time: number): void {
    if (this.motion) {
      const progress = (time - this.motion.startedAt) / this.motion.duration;
      if (progress >= 1) {
        this.boat.x = this.motion.to.x;
        this.boat.y = this.motion.to.y;
        this.trail.push({ x: this.boat.x, y: this.boat.y });
        this.motion = null;
        this.resolveArrival(time);
      }
      return;
    }

    if (time < this.nextMoveAt) return;

    const vector = DIRECTION_VECTORS[this.boat.direction];
    if (!vector) {
      this.fail("신호를 읽지 못했습니다.", this.boat);
      return;
    }

    const next = {
      x: this.boat.x + vector[0],
      y: this.boat.y + vector[1]
    };

    if (!this.isInside(next)) {
      this.fail("배가 방파제 밖 외해로 이탈했습니다.", this.boat);
      return;
    }

    if (this.isRock(next)) {
      this.fail("암초에 선체가 닿았습니다.", next);
      return;
    }

    this.motion = {
      from: { x: this.boat.x, y: this.boat.y },
      to: next,
      startedAt: time,
      duration: 340
    };
  }

  private resolveArrival(time: number): void {
    const level = this.currentLevel;

    if (this.boat.x === level.harbor.x && this.boat.y === level.harbor.y) {
      this.win();
      return;
    }

    const buoyIndex = level.buoys.findIndex(
      (buoy) => buoy.x === this.boat.x && buoy.y === this.boat.y
    );

    if (buoyIndex >= 0) {
      const direction = this.buoyDirections[buoyIndex];
      if (direction !== undefined) {
        this.boat.direction = direction;
        const buoy = level.buoys[buoyIndex];
        if (buoy) this.spawnSplash(buoy, "#f5cf57", 8);
        playTone(760, 0.04, 0.016);
      }
    }

    const state = this.stateKey(
      this.boat.x,
      this.boat.y,
      this.boat.direction
    );

    if (this.visited.has(state)) {
      this.fail("같은 수로를 반복하며 표류하고 있습니다.", this.boat);
      return;
    }

    this.visited.add(state);
    this.nextMoveAt = time + 110;
  }

  private win(): void {
    this.phase = "won";
    this.message = `${getHarborBriefing(this.currentLevel).callSign}, 입항 완료. 계류 작업을 시작합니다.`;
    this.motion = null;
    this.spawnCelebration(this.currentLevel.harbor);
    playTone(660, 0.12, 0.03);
    window.setTimeout(() => playTone(880, 0.13, 0.03), 110);
    window.setTimeout(() => playTone(1180, 0.18, 0.025), 220);

    const medal = this.calculateMedal();
    const score = Math.max(
      100,
      1800 +
        this.currentLevel.id * 120 -
        this.rotations * 38 -
        this.failures * 90 -
        (this.hintUsed ? 170 : 0)
    );

    this.emitChange();
    this.options.onComplete?.({
      level: this.currentLevel,
      medal,
      rotations: this.rotations,
      score,
      hintUsed: this.hintUsed
    });
  }

  private fail(reason: string, point: Point): void {
    this.phase = "failed";
    this.failures += 1;
    this.message = `${reason} 예인선 호출 후 부표를 다시 조정하세요.`;
    this.motion = null;
    this.collisionPoint = { ...point };
    this.shakeUntil = performance.now() + 520;
    this.spawnImpact(point);
    playTone(155, 0.2, 0.04);
    window.setTimeout(() => playTone(118, 0.24, 0.025), 120);
    this.emitChange();
  }

  private calculateMedal(): Medal {
    if (this.hintUsed) return "bronze";
    if (this.rotations <= this.currentLevel.medal.gold) return "gold";
    if (this.rotations <= this.currentLevel.medal.silver) return "silver";
    return "bronze";
  }

  private emitChange(): void {
    this.options.onChange?.({
      levelIndex: this.levelIndex,
      level: this.currentLevel,
      phase: this.phase,
      rotations: this.rotations,
      failures: this.failures,
      hintUsed: this.hintUsed,
      selectedBuoy: this.selectedBuoy,
      message: this.message
    });
  }

  private resize(): void {
    const parent = this.canvas.parentElement;
    const available = parent?.clientWidth ?? 720;
    this.logicalSize = Math.max(320, Math.min(760, available));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.logicalSize * pixelRatio);
    this.canvas.height = Math.round(this.logicalSize * pixelRatio);
    this.canvas.style.height = `${this.logicalSize}px`;
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.draw(performance.now());
  }

  private boardGeometry(): {
    x: number;
    y: number;
    cell: number;
    width: number;
    height: number;
  } {
    const level = this.currentLevel;
    const margin = this.logicalSize < 460 ? 24 : 54;
    const cell = Math.min(
      (this.logicalSize - margin * 2) / level.size.columns,
      (this.logicalSize - margin * 2) / level.size.rows
    );

    return {
      x: (this.logicalSize - cell * level.size.columns) / 2,
      y: (this.logicalSize - cell * level.size.rows) / 2,
      cell,
      width: cell * level.size.columns,
      height: cell * level.size.rows
    };
  }

  private draw(time: number): void {
    const ctx = this.context;
    const level = this.currentLevel;
    const board = this.boardGeometry();
    const briefing = getHarborBriefing(level);
    const theme = THEMES[briefing.theme];

    ctx.clearRect(0, 0, this.logicalSize, this.logicalSize);

    const shaking = time < this.shakeUntil;
    const shakeX = shaking ? Math.sin(time * 0.09) * 5 : 0;
    const shakeY = shaking ? Math.cos(time * 0.12) * 4 : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    this.drawBackdrop(ctx, board, theme, briefing, time);

    ctx.save();
    ctx.translate(board.x, board.y);
    this.drawWaterChart(ctx, board, theme, time);
    this.drawTrail(ctx, board.cell);
    this.drawRouteGuide(ctx, board.cell, time);

    for (const rock of level.rocks) {
      this.drawRock(ctx, rock, board.cell, theme, time);
    }

    this.drawStart(ctx, level.start, board.cell, time);
    this.drawHarbor(ctx, level.harbor, board.cell, theme, time);

    level.buoys.forEach((buoy, index) => {
      this.drawBuoy(
        ctx,
        buoy,
        this.buoyDirections[index] ?? buoy.direction,
        board.cell,
        index,
        index === this.selectedBuoy,
        time
      );
    });

    this.drawBoat(ctx, board.cell, time);
    this.drawParticles(ctx, board.cell, time);
    ctx.restore();

    this.drawAtmosphere(ctx, theme, time);
    ctx.restore();
  }

  private drawBackdrop(
    ctx: CanvasRenderingContext2D,
    board: ReturnType<HarborGameV2["boardGeometry"]>,
    theme: HarborTheme,
    briefing: HarborBriefing,
    time: number
  ): void {
    const sky = ctx.createLinearGradient(0, 0, 0, this.logicalSize * 0.5);
    sky.addColorStop(0, theme.skyTop);
    sky.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);

    const sea = ctx.createLinearGradient(0, board.y * 0.7, 0, this.logicalSize);
    sea.addColorStop(0, theme.waterTop);
    sea.addColorStop(1, theme.waterBottom);
    ctx.fillStyle = sea;
    ctx.fillRect(0, board.y * 0.55, this.logicalSize, this.logicalSize);

    const horizonY = board.y * 0.76;
    ctx.fillStyle = theme.night ? "rgba(6,15,23,.62)" : "rgba(39,55,55,.32)";
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 16);
    for (let x = 0; x <= this.logicalSize; x += 42) {
      const height = 8 + this.seededNoise(x * 0.17 + this.currentLevel.id) * 22;
      ctx.lineTo(x, horizonY - height);
    }
    ctx.lineTo(this.logicalSize, horizonY + 30);
    ctx.lineTo(0, horizonY + 30);
    ctx.closePath();
    ctx.fill();

    this.drawDistantLighthouse(ctx, this.logicalSize * 0.82, horizonY - 15, theme, time);
    this.drawGulls(ctx, theme, time);

    ctx.fillStyle = theme.night ? "rgba(221,237,235,.64)" : "rgba(20,47,52,.56)";
    ctx.font = `800 ${Math.max(9, this.logicalSize * 0.014)}px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.fillText(
      `${briefing.callSign} · ${briefing.weather} · ${briefing.tide}`,
      board.x,
      Math.max(18, board.y - 18)
    );

    if (theme.night) {
      ctx.fillStyle = "rgba(247,233,171,.8)";
      for (let i = 0; i < 28; i += 1) {
        const x = (this.seededNoise(i * 3.1 + 5) * this.logicalSize) % this.logicalSize;
        const y = this.seededNoise(i * 7.7 + 2) * horizonY * 0.8;
        const twinkle = 0.4 + Math.sin(time / 500 + i) * 0.3;
        ctx.globalAlpha = twinkle;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawWaterChart(
    ctx: CanvasRenderingContext2D,
    board: ReturnType<HarborGameV2["boardGeometry"]>,
    theme: HarborTheme,
    time: number
  ): void {
    const water = ctx.createLinearGradient(0, 0, 0, board.height);
    water.addColorStop(0, theme.waterTop);
    water.addColorStop(1, theme.waterBottom);
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, board.width, board.height);

    ctx.save();
    ctx.strokeStyle = theme.night
      ? "rgba(142,190,197,.15)"
      : "rgba(220,242,236,.18)";
    ctx.lineWidth = 1;
    for (let row = 0; row <= this.currentLevel.size.rows; row += 1) {
      const y = row * board.cell;
      ctx.setLineDash([2, Math.max(5, board.cell * 0.16)]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(board.width, y);
      ctx.stroke();
    }
    for (let column = 0; column <= this.currentLevel.size.columns; column += 1) {
      const x = column * board.cell;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, board.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (let band = 0; band < 9; band += 1) {
      const y = (band + 0.7) * (board.height / 9);
      ctx.strokeStyle = `rgba(214,239,233,${0.06 + (band % 3) * 0.018})`;
      ctx.lineWidth = Math.max(1, board.cell * 0.015);
      ctx.beginPath();
      for (let x = -20; x <= board.width + 20; x += 8) {
        const wave = Math.sin(x * 0.045 + time * 0.0014 + band * 1.7) * 3.4;
        if (x === -20) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(245,213,111,.11)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(
        board.width * (0.22 + i * 0.2),
        board.height * (0.18 + (i % 2) * 0.44),
        board.cell * (1.15 + i * 0.18),
        board.cell * (0.62 + i * 0.12),
        -0.25,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawRouteGuide(
    ctx: CanvasRenderingContext2D,
    cell: number,
    time: number
  ): void {
    if (this.phase === "running" || this.phase === "won") return;
    const buoy = this.currentLevel.buoys[this.selectedBuoy];
    if (!buoy) return;
    const direction = this.buoyDirections[this.selectedBuoy] ?? buoy.direction;
    const vector = DIRECTION_VECTORS[direction];
    if (!vector) return;

    const center = this.cellCenter(buoy, cell);
    const length = cell * 1.35;
    const end = {
      x: center.x + vector[0] * length,
      y: center.y + vector[1] * length
    };
    const pulse = 0.35 + Math.sin(time / 220) * 0.14;
    ctx.save();
    ctx.strokeStyle = `rgba(250,220,112,${pulse})`;
    ctx.lineWidth = Math.max(2, cell * 0.035);
    ctx.setLineDash([cell * 0.09, cell * 0.09]);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(250,220,112,${Math.min(1, pulse + 0.3)})`;
    ctx.beginPath();
    ctx.arc(end.x, end.y, Math.max(2, cell * 0.055), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawTrail(ctx: CanvasRenderingContext2D, cell: number): void {
    if (this.trail.length < 2) return;

    ctx.save();
    ctx.strokeStyle = "rgba(228,247,241,.34)";
    ctx.lineWidth = Math.max(4, cell * 0.09);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    this.trail.forEach((point, index) => {
      const x = (point.x + 0.5) * cell;
      const y = (point.y + 0.5) * cell;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "rgba(245,211,87,.65)";
    ctx.lineWidth = Math.max(1.5, cell * 0.025);
    ctx.setLineDash([cell * 0.11, cell * 0.11]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  private drawRock(
    ctx: CanvasRenderingContext2D,
    rock: Point,
    cell: number,
    theme: HarborTheme,
    time: number
  ): void {
    const x = rock.x * cell;
    const y = rock.y * cell;
    const north = this.isRock({ x: rock.x, y: rock.y - 1 });
    const east = this.isRock({ x: rock.x + 1, y: rock.y });
    const south = this.isRock({ x: rock.x, y: rock.y + 1 });
    const west = this.isRock({ x: rock.x - 1, y: rock.y });
    const pad = cell * 0.055;

    ctx.save();
    ctx.fillStyle = theme.reef;
    ctx.beginPath();
    ctx.roundRect(
      x + (west ? 0 : pad),
      y + (north ? 0 : pad),
      cell - (west ? 0 : pad) - (east ? 0 : pad),
      cell - (north ? 0 : pad) - (south ? 0 : pad),
      cell * 0.13
    );
    ctx.fill();

    const seed = rock.x * 37 + rock.y * 71 + this.currentLevel.id * 13;
    for (let i = 0; i < 4; i += 1) {
      const rx = x + cell * (0.18 + this.seededNoise(seed + i * 3.1) * 0.64);
      const ry = y + cell * (0.2 + this.seededNoise(seed + i * 5.7) * 0.58);
      const radius = cell * (0.07 + this.seededNoise(seed + i * 2.4) * 0.09);
      ctx.fillStyle = i % 2 === 0 ? theme.reefLight : theme.sand;
      ctx.globalAlpha = i % 2 === 0 ? 0.75 : 0.34;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = theme.foam;
    ctx.lineWidth = Math.max(1.3, cell * 0.025);
    ctx.globalAlpha = 0.45 + Math.sin(time / 350 + seed) * 0.08;
    if (!north) this.drawFoamEdge(ctx, x, y + pad, x + cell, y + pad, false, time + seed);
    if (!south) this.drawFoamEdge(ctx, x, y + cell - pad, x + cell, y + cell - pad, false, time + seed + 30);
    if (!west) this.drawFoamEdge(ctx, x + pad, y, x + pad, y + cell, true, time + seed + 60);
    if (!east) this.drawFoamEdge(ctx, x + cell - pad, y, x + cell - pad, y + cell, true, time + seed + 90);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawFoamEdge(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    vertical: boolean,
    time: number
  ): void {
    ctx.beginPath();
    const steps = 6;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const wobble = Math.sin(time * 0.003 + i * 1.7) * 2.2;
      const x = x1 + (x2 - x1) * t + (vertical ? wobble : 0);
      const y = y1 + (y2 - y1) * t + (vertical ? 0 : wobble);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  private drawStart(
    ctx: CanvasRenderingContext2D,
    start: Point & { direction: Direction },
    cell: number,
    time: number
  ): void {
    const center = this.cellCenter(start, cell);
    const bob = Math.sin(time / 340) * cell * 0.018;
    ctx.save();
    ctx.translate(center.x, center.y + bob);
    ctx.rotate(DIRECTION_ANGLES[start.direction] ?? 0);

    ctx.strokeStyle = "rgba(224,244,239,.75)";
    ctx.lineWidth = Math.max(2, cell * 0.035);
    ctx.setLineDash([cell * 0.09, cell * 0.07]);
    ctx.beginPath();
    ctx.moveTo(-cell * 0.45, 0);
    ctx.lineTo(cell * 0.34, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    this.drawChannelMarker(ctx, -cell * 0.22, -cell * 0.24, "#d64a38", cell);
    this.drawChannelMarker(ctx, -cell * 0.22, cell * 0.24, "#3d9b78", cell);

    ctx.fillStyle = "#f7d767";
    ctx.beginPath();
    ctx.moveTo(cell * 0.36, 0);
    ctx.lineTo(cell * 0.19, -cell * 0.1);
    ctx.lineTo(cell * 0.19, cell * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawChannelMarker(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    cell: number
  ): void {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#f1eee2";
    ctx.lineWidth = Math.max(1, cell * 0.018);
    ctx.beginPath();
    ctx.arc(x, y, cell * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private drawHarbor(
    ctx: CanvasRenderingContext2D,
    harbor: Point,
    cell: number,
    theme: HarborTheme,
    time: number
  ): void {
    const x = harbor.x * cell;
    const y = harbor.y * cell;
    const pulse = 0.58 + Math.sin(time / 260) * 0.18;

    ctx.save();
    ctx.fillStyle = "rgba(7,21,26,.24)";
    ctx.beginPath();
    ctx.roundRect(x + cell * 0.08, y + cell * 0.12, cell * 0.84, cell * 0.76, cell * 0.12);
    ctx.fill();

    ctx.fillStyle = "#76533d";
    ctx.fillRect(x + cell * 0.08, y + cell * 0.15, cell * 0.15, cell * 0.7);
    ctx.fillRect(x + cell * 0.77, y + cell * 0.15, cell * 0.15, cell * 0.7);
    ctx.fillRect(x + cell * 0.08, y + cell * 0.72, cell * 0.84, cell * 0.13);

    ctx.strokeStyle = "rgba(239,222,181,.4)";
    ctx.lineWidth = Math.max(1, cell * 0.018);
    for (let i = 0; i < 4; i += 1) {
      const py = y + cell * (0.25 + i * 0.14);
      ctx.beginPath();
      ctx.moveTo(x + cell * 0.1, py);
      ctx.lineTo(x + cell * 0.22, py);
      ctx.moveTo(x + cell * 0.78, py);
      ctx.lineTo(x + cell * 0.9, py);
      ctx.stroke();
    }

    const lighthouseX = x + cell * 0.74;
    const lighthouseY = y + cell * 0.28;
    ctx.fillStyle = "#f1eee2";
    ctx.beginPath();
    ctx.moveTo(lighthouseX - cell * 0.075, lighthouseY + cell * 0.28);
    ctx.lineTo(lighthouseX + cell * 0.075, lighthouseY + cell * 0.28);
    ctx.lineTo(lighthouseX + cell * 0.055, lighthouseY - cell * 0.08);
    ctx.lineTo(lighthouseX - cell * 0.055, lighthouseY - cell * 0.08);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#d84d37";
    ctx.fillRect(lighthouseX - cell * 0.065, lighthouseY + cell * 0.04, cell * 0.13, cell * 0.07);
    ctx.fillRect(lighthouseX - cell * 0.07, lighthouseY + cell * 0.18, cell * 0.14, cell * 0.07);

    ctx.fillStyle = "#17252a";
    ctx.fillRect(lighthouseX - cell * 0.09, lighthouseY - cell * 0.12, cell * 0.18, cell * 0.08);
    ctx.fillStyle = `rgba(249,220,101,${pulse})`;
    ctx.beginPath();
    ctx.arc(lighthouseX, lighthouseY - cell * 0.08, cell * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(lighthouseX, lighthouseY - cell * 0.08);
    ctx.rotate(time * 0.0006 + this.currentLevel.id * 0.6);
    const beam = ctx.createLinearGradient(0, 0, cell * 1.7, 0);
    beam.addColorStop(0, `rgba(250,227,126,${theme.night ? 0.36 : 0.18})`);
    beam.addColorStop(1, "rgba(250,227,126,0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(0, -cell * 0.07);
    ctx.lineTo(cell * 1.7, -cell * 0.32);
    ctx.lineTo(cell * 1.7, cell * 0.32);
    ctx.lineTo(0, cell * 0.07);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#f1eee2";
    ctx.font = `900 ${Math.max(8, cell * 0.11)}px ui-monospace, monospace`;
    ctx.textAlign = "left";
    ctx.fillText("DOCK", x + cell * 0.14, y + cell * 0.67);
    ctx.restore();
  }

  private drawBuoy(
    ctx: CanvasRenderingContext2D,
    buoy: BuoyDefinition,
    direction: Direction,
    cell: number,
    index: number,
    selected: boolean,
    time: number
  ): void {
    const center = this.cellCenter(buoy, cell);
    const bob = Math.sin(time / 250 + index * 1.9) * cell * 0.03;
    const radius = cell * 0.19;

    ctx.save();
    ctx.translate(center.x, center.y + bob);

    ctx.fillStyle = "rgba(8,28,35,.28)";
    ctx.beginPath();
    ctx.ellipse(0, cell * 0.17, radius * 1.2, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    if (selected && this.phase !== "running") {
      const ring = radius * (1.55 + Math.sin(time / 180) * 0.12);
      ctx.strokeStyle = "rgba(250,215,96,.92)";
      ctx.lineWidth = Math.max(2, cell * 0.035);
      ctx.beginPath();
      ctx.arc(0, 0, ring, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f8d568";
      ctx.font = `900 ${Math.max(9, cell * 0.13)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1).padStart(2, "0"), 0, -radius * 1.9);
    }

    ctx.fillStyle = buoy.rotatable ? "#d94c37" : "#6d7f7b";
    ctx.strokeStyle = "#f1eee2";
    ctx.lineWidth = Math.max(1.5, cell * 0.027);
    ctx.beginPath();
    ctx.ellipse(0, cell * 0.05, radius, radius * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f1eee2";
    ctx.fillRect(-radius * 0.88, cell * 0.015, radius * 1.76, radius * 0.22);
    ctx.fillStyle = buoy.rotatable ? "#d94c37" : "#6d7f7b";
    ctx.fillRect(-radius * 0.72, -radius * 0.13, radius * 1.44, radius * 0.2);

    ctx.strokeStyle = "#17252a";
    ctx.lineWidth = Math.max(2, cell * 0.032);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.85);
    ctx.lineTo(0, radius * 0.02);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -radius * 0.88);
    ctx.rotate(DIRECTION_ANGLES[direction] ?? 0);
    ctx.fillStyle = buoy.rotatable ? "#f6d665" : "#aeb9b3";
    ctx.strokeStyle = "#17252a";
    ctx.lineWidth = Math.max(1.5, cell * 0.025);
    ctx.beginPath();
    ctx.roundRect(-radius * 0.88, -radius * 0.35, radius * 1.76, radius * 0.7, radius * 0.12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#17252a";
    ctx.lineWidth = Math.max(2, cell * 0.037);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-radius * 0.45, 0);
    ctx.lineTo(radius * 0.4, 0);
    ctx.moveTo(radius * 0.4, 0);
    ctx.lineTo(radius * 0.1, -radius * 0.24);
    ctx.moveTo(radius * 0.4, 0);
    ctx.lineTo(radius * 0.1, radius * 0.24);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawBoat(
    ctx: CanvasRenderingContext2D,
    cell: number,
    time: number
  ): void {
    let x = this.boat.x;
    let y = this.boat.y;

    if (this.motion) {
      const progress = Math.min(
        1,
        Math.max(0, (time - this.motion.startedAt) / this.motion.duration)
      );
      const eased = progress * progress * (3 - 2 * progress);
      x = this.motion.from.x + (this.motion.to.x - this.motion.from.x) * eased;
      y = this.motion.from.y + (this.motion.to.y - this.motion.from.y) * eased;
    }

    const center = {
      x: (x + 0.5) * cell,
      y: (y + 0.5) * cell
    };
    const bob = Math.sin(time / 190 + x + y) * cell * 0.016;

    ctx.save();
    ctx.translate(center.x, center.y + bob);
    ctx.rotate(DIRECTION_ANGLES[this.boat.direction] ?? 0);

    if (this.phase === "running") {
      const wake = ctx.createLinearGradient(-cell * 0.75, 0, -cell * 0.12, 0);
      wake.addColorStop(0, "rgba(225,245,240,0)");
      wake.addColorStop(1, "rgba(225,245,240,.7)");
      ctx.strokeStyle = wake;
      ctx.lineWidth = Math.max(2, cell * 0.035);
      ctx.beginPath();
      ctx.moveTo(-cell * 0.72, -cell * 0.16);
      ctx.quadraticCurveTo(-cell * 0.42, -cell * 0.07, -cell * 0.2, -cell * 0.08);
      ctx.moveTo(-cell * 0.72, cell * 0.16);
      ctx.quadraticCurveTo(-cell * 0.42, cell * 0.07, -cell * 0.2, cell * 0.08);
      ctx.stroke();
    }

    ctx.fillStyle = "#17252a";
    ctx.strokeStyle = "#f2eee0";
    ctx.lineWidth = Math.max(1.5, cell * 0.025);
    ctx.beginPath();
    ctx.moveTo(cell * 0.34, 0);
    ctx.quadraticCurveTo(cell * 0.08, -cell * 0.22, -cell * 0.29, -cell * 0.18);
    ctx.lineTo(-cell * 0.38, 0);
    ctx.lineTo(-cell * 0.29, cell * 0.18);
    ctx.quadraticCurveTo(cell * 0.08, cell * 0.22, cell * 0.34, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d84d37";
    ctx.fillRect(-cell * 0.23, -cell * 0.14, cell * 0.38, cell * 0.28);
    ctx.fillStyle = "#f1eee2";
    ctx.fillRect(-cell * 0.03, -cell * 0.12, cell * 0.16, cell * 0.24);
    ctx.fillStyle = "#83b7bf";
    ctx.fillRect(cell * 0.02, -cell * 0.085, cell * 0.08, cell * 0.07);
    ctx.fillRect(cell * 0.02, cell * 0.015, cell * 0.08, cell * 0.07);

    ctx.fillStyle = "#c6a65b";
    ctx.fillRect(-cell * 0.2, -cell * 0.095, cell * 0.1, cell * 0.075);
    ctx.fillRect(-cell * 0.2, cell * 0.02, cell * 0.1, cell * 0.075);

    ctx.strokeStyle = "#f1eee2";
    ctx.lineWidth = Math.max(1.2, cell * 0.018);
    ctx.beginPath();
    ctx.moveTo(cell * 0.09, -cell * 0.13);
    ctx.lineTo(cell * 0.09, -cell * 0.28);
    ctx.stroke();
    ctx.fillStyle = "#f6d665";
    ctx.beginPath();
    ctx.arc(cell * 0.09, -cell * 0.29, cell * 0.025, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    cell: number,
    time: number
  ): void {
    for (const particle of this.particles) {
      const age = time - particle.bornAt;
      if (age < 0 || age > particle.life) continue;
      const t = age / particle.life;
      const x = (particle.x + 0.5) * cell + particle.vx * age;
      const y = (particle.y + 0.5) * cell + particle.vy * age + particle.gravity * age * age;
      ctx.globalAlpha = Math.max(0, 1 - t);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(x, y, particle.size * (1 - t * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.collisionPoint && this.phase === "failed") {
      const center = this.cellCenter(this.collisionPoint, cell);
      ctx.strokeStyle = "rgba(238,83,53,.75)";
      ctx.lineWidth = Math.max(2, cell * 0.04);
      ctx.beginPath();
      ctx.moveTo(center.x - cell * 0.18, center.y - cell * 0.18);
      ctx.lineTo(center.x + cell * 0.18, center.y + cell * 0.18);
      ctx.moveTo(center.x + cell * 0.18, center.y - cell * 0.18);
      ctx.lineTo(center.x - cell * 0.18, center.y + cell * 0.18);
      ctx.stroke();
    }
  }

  private drawAtmosphere(
    ctx: CanvasRenderingContext2D,
    theme: HarborTheme,
    time: number
  ): void {
    if (theme.fog > 0) {
      for (let i = 0; i < 5; i += 1) {
        const x = ((time * (0.008 + i * 0.002) + i * 180) % (this.logicalSize + 280)) - 140;
        const y = this.logicalSize * (0.16 + i * 0.16);
        const fog = ctx.createRadialGradient(x, y, 10, x, y, 150 + i * 20);
        fog.addColorStop(0, `rgba(229,236,231,${theme.fog * 0.32})`);
        fog.addColorStop(1, "rgba(229,236,231,0)");
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);
      }
    }

    if (theme.rain) {
      ctx.save();
      ctx.strokeStyle = "rgba(199,224,226,.28)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 58; i += 1) {
        const x = (this.seededNoise(i * 9.3) * this.logicalSize + time * 0.12) % this.logicalSize;
        const y = (this.seededNoise(i * 4.9 + 3) * this.logicalSize + time * 0.34) % this.logicalSize;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7, y + 18);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawDistantLighthouse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    theme: HarborTheme,
    time: number
  ): void {
    ctx.save();
    ctx.fillStyle = theme.night ? "rgba(4,12,18,.9)" : "rgba(26,48,51,.62)";
    ctx.fillRect(x - 7, y - 38, 14, 38);
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 38);
    ctx.lineTo(x + 10, y - 38);
    ctx.lineTo(x, y - 49);
    ctx.closePath();
    ctx.fill();
    const pulse = 0.4 + Math.sin(time / 310) * 0.25;
    ctx.fillStyle = `rgba(250,226,126,${pulse})`;
    ctx.beginPath();
    ctx.arc(x, y - 39, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawGulls(
    ctx: CanvasRenderingContext2D,
    theme: HarborTheme,
    time: number
  ): void {
    if (theme.night) return;
    ctx.save();
    ctx.strokeStyle = "rgba(37,55,56,.48)";
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i += 1) {
      const baseX = (this.logicalSize * (0.16 + i * 0.19) + time * (0.004 + i * 0.001)) % this.logicalSize;
      const baseY = 30 + i * 13 + Math.sin(time / 500 + i) * 6;
      const flap = Math.sin(time / 180 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(baseX - 7, baseY + flap);
      ctx.quadraticCurveTo(baseX - 3, baseY - 3, baseX, baseY);
      ctx.quadraticCurveTo(baseX + 3, baseY - 3, baseX + 7, baseY + flap);
      ctx.stroke();
    }
    ctx.restore();
  }

  private updateParticles(time: number): void {
    this.particles = this.particles.filter((particle) => time - particle.bornAt <= particle.life);
  }

  private spawnSplash(point: Point, color: string, count: number): void {
    const now = performance.now();
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + this.seededNoise(i + now) * 0.6;
      const speed = 0.035 + this.seededNoise(i * 7 + now) * 0.055;
      this.particles.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.055,
        size: 2 + this.seededNoise(i * 3 + now) * 3,
        bornAt: now,
        life: 420 + this.seededNoise(i * 5 + now) * 260,
        color,
        gravity: 0.00015
      });
    }
  }

  private spawnImpact(point: Point): void {
    this.spawnSplash(point, "#f2d26b", 16);
    this.spawnSplash(point, "#e45138", 12);
  }

  private spawnCelebration(point: Point): void {
    const colors = ["#f5d365", "#f1eee2", "#df5339", "#6fc0b2"];
    const now = performance.now();
    for (let i = 0; i < 48; i += 1) {
      const angle = (Math.PI * 2 * i) / 48;
      const speed = 0.045 + this.seededNoise(i * 11) * 0.085;
      this.particles.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.08,
        size: 2 + this.seededNoise(i * 2.4) * 4,
        bornAt: now,
        life: 760 + this.seededNoise(i * 4.4) * 440,
        color: colors[i % colors.length] ?? "#f5d365",
        gravity: 0.00012
      });
    }
  }

  private cellCenter(point: Point, cell: number): Point {
    return {
      x: (point.x + 0.5) * cell,
      y: (point.y + 0.5) * cell
    };
  }

  private isInside(point: Point): boolean {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x < this.currentLevel.size.columns &&
      point.y < this.currentLevel.size.rows
    );
  }

  private isRock(point: Point): boolean {
    return this.currentLevel.rocks.some(
      (rock) => rock.x === point.x && rock.y === point.y
    );
  }

  private stateKey(x: number, y: number, direction: Direction): string {
    return `${x},${y},${direction}`;
  }

  private seededNoise(seed: number): number {
    const value = Math.sin(seed * 12.9898 + this.currentLevel.id * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }
}
