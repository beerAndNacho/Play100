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

interface ArrowHarborOptions {
  onChange?: (snapshot: GameSnapshot) => void;
  onComplete?: (result: CompletionResult) => void;
}

export class ArrowHarborGame {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly levels: LevelDefinition[];
  private readonly options: ArrowHarborOptions;
  private readonly resizeObserver: ResizeObserver;

  private levelIndex = 0;
  private phase: GamePhase = "planning";
  private buoyDirections: Direction[] = [];
  private rotations = 0;
  private failures = 0;
  private hintUsed = false;
  private selectedBuoy = 0;
  private message = "부표를 눌러 방향을 맞춘 뒤 출항하세요.";
  private boat: BoatState = { x: 0, y: 0, direction: 1 };
  private motion: Motion | null = null;
  private nextMoveAt = 0;
  private trail: Point[] = [];
  private visited = new Set<string>();
  private animationFrame = 0;
  private logicalSize = 640;
  private destroyed = false;

  constructor(
    canvas: HTMLCanvasElement,
    levels: LevelDefinition[],
    options: ArrowHarborOptions = {}
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

  get levelCount(): number {
    return this.levels.length;
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
    this.message = "부표를 눌러 방향을 맞춘 뒤 출항하세요.";
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.visited.clear();
    this.resize();
    this.emitChange();
  }

  launch(): void {
    if (this.phase === "running") {
      return;
    }

    if (this.phase === "won") {
      this.nextLevel();
      return;
    }

    const level = this.currentLevel;
    this.phase = "running";
    this.message = "항로 확인 중…";
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.visited = new Set([
      this.stateKey(level.start.x, level.start.y, level.start.direction)
    ]);
    this.nextMoveAt = performance.now() + 120;
    playTone(420, 0.07);
    this.emitChange();
  }

  reset(): void {
    const level = this.currentLevel;
    this.buoyDirections = level.buoys.map((buoy) => buoy.direction);
    this.phase = "planning";
    this.rotations = 0;
    this.hintUsed = false;
    this.message = "초기 신호로 되돌렸습니다.";
    this.boat = { ...level.start };
    this.motion = null;
    this.trail = [{ x: level.start.x, y: level.start.y }];
    this.emitChange();
  }

  retry(): void {
    if (this.phase !== "failed") {
      return;
    }
    this.phase = "planning";
    this.message = "신호를 다시 조정해 보세요.";
    this.boat = { ...this.currentLevel.start };
    this.motion = null;
    this.trail = [
      { x: this.currentLevel.start.x, y: this.currentLevel.start.y }
    ];
    this.emitChange();
  }

  hint(): void {
    if (this.phase === "running") {
      return;
    }

    const level = this.currentLevel;
    const index = level.buoys.findIndex(
      (buoy, buoyIndex) => this.buoyDirections[buoyIndex] !== buoy.solution
    );

    if (index < 0) {
      this.message = "모든 부표가 올바른 방향입니다. 출항해 보세요.";
      this.emitChange();
      return;
    }

    const buoy = level.buoys[index];
    if (!buoy) {
      return;
    }

    const current = this.buoyDirections[index] ?? buoy.direction;
    const clockwiseTurns = (buoy.solution - current + 4) % 4;
    this.buoyDirections[index] = buoy.solution;
    this.rotations += clockwiseTurns + 2;
    this.hintUsed = true;
    this.selectedBuoy = index;
    this.message = `${index + 1}번 부표를 맞췄습니다. 힌트 페널티 +2`;
    playTone(620, 0.09);
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
    if (this.phase === "running") {
      return;
    }

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

    if (index >= 0) {
      this.rotateBuoy(index);
    }
  };

  private readonly handleKeyboard = (event: KeyboardEvent): void => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      this.selectedBuoy =
        (this.selectedBuoy + 1) % this.currentLevel.buoys.length;
      this.message = `${this.selectedBuoy + 1}번 부표 선택`;
      this.emitChange();
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      this.selectedBuoy =
        (this.selectedBuoy - 1 + this.currentLevel.buoys.length) %
        this.currentLevel.buoys.length;
      this.message = `${this.selectedBuoy + 1}번 부표 선택`;
      this.emitChange();
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (this.phase === "planning" || this.phase === "failed") {
        this.rotateBuoy(this.selectedBuoy);
      }
    }

    if (event.key.toLowerCase() === "l") {
      event.preventDefault();
      this.launch();
    }
  };

  private rotateBuoy(index: number): void {
    if (this.phase === "running") {
      return;
    }

    if (this.phase === "failed") {
      this.retry();
    }

    const buoy = this.currentLevel.buoys[index];
    if (!buoy?.rotatable) {
      return;
    }

    const current = this.buoyDirections[index] ?? buoy.direction;
    this.buoyDirections[index] = ((current + 1) % 4) as Direction;
    this.selectedBuoy = index;
    this.rotations += 1;
    this.message = `${index + 1}번 부표 회전 · 총 ${this.rotations}회`;
    playTone(510 + index * 22, 0.045);
    this.emitChange();
  }

  private readonly tick = (time: number): void => {
    if (this.destroyed) {
      return;
    }

    if (this.phase === "running") {
      this.updateSimulation(time);
    }

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

    if (time < this.nextMoveAt) {
      return;
    }

    const vector = DIRECTION_VECTORS[this.boat.direction];
    if (!vector) {
      this.fail("신호를 읽지 못했습니다.");
      return;
    }

    const next = {
      x: this.boat.x + vector[0],
      y: this.boat.y + vector[1]
    };

    if (!this.isInside(next)) {
      this.fail("배가 항로 밖으로 나갔습니다.");
      return;
    }

    if (this.isRock(next)) {
      this.fail("암초에 부딪혔습니다.");
      return;
    }

    this.motion = {
      from: { x: this.boat.x, y: this.boat.y },
      to: next,
      startedAt: time,
      duration: 280
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
        playTone(760, 0.035, 0.015);
      }
    }

    const state = this.stateKey(
      this.boat.x,
      this.boat.y,
      this.boat.direction
    );

    if (this.visited.has(state)) {
      this.fail("같은 항로를 반복하고 있습니다.");
      return;
    }

    this.visited.add(state);
    this.nextMoveAt = time + 90;
  }

  private win(): void {
    this.phase = "won";
    this.message = "입항 완료!";
    this.motion = null;
    playTone(880, 0.12, 0.035);
    window.setTimeout(() => playTone(1175, 0.14, 0.03), 100);

    const medal = this.calculateMedal();
    const score = Math.max(
      100,
      1600 +
        this.currentLevel.id * 100 -
        this.rotations * 35 -
        this.failures * 80 -
        (this.hintUsed ? 150 : 0)
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

  private fail(reason: string): void {
    this.phase = "failed";
    this.failures += 1;
    this.message = `${reason} 신호를 조정해 다시 출항하세요.`;
    this.motion = null;
    playTone(170, 0.16, 0.035);
    this.emitChange();
  }

  private calculateMedal(): Medal {
    if (this.hintUsed) {
      return "bronze";
    }
    if (this.rotations <= this.currentLevel.medal.gold) {
      return "gold";
    }
    if (this.rotations <= this.currentLevel.medal.silver) {
      return "silver";
    }
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
    const available = parent?.clientWidth ?? 640;
    this.logicalSize = Math.max(320, Math.min(720, available));
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
    const margin = this.logicalSize < 460 ? 20 : 34;
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

    ctx.clearRect(0, 0, this.logicalSize, this.logicalSize);
    ctx.fillStyle = "#173f4c";
    ctx.fillRect(0, 0, this.logicalSize, this.logicalSize);

    ctx.save();
    ctx.translate(board.x, board.y);

    ctx.fillStyle = "#1d5666";
    ctx.fillRect(0, 0, board.width, board.height);

    ctx.strokeStyle = "rgba(235, 232, 217, 0.18)";
    ctx.lineWidth = 1;
    for (let column = 0; column <= level.size.columns; column += 1) {
      const x = column * board.cell;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, board.height);
      ctx.stroke();
    }
    for (let row = 0; row <= level.size.rows; row += 1) {
      const y = row * board.cell;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(board.width, y);
      ctx.stroke();
    }

    this.drawTrail(ctx, board.cell);

    for (const rock of level.rocks) {
      this.drawRock(ctx, rock, board.cell);
    }

    this.drawStart(ctx, level.start, board.cell);
    this.drawHarbor(ctx, level.harbor, board.cell, time);

    level.buoys.forEach((buoy, index) => {
      this.drawBuoy(
        ctx,
        buoy,
        this.buoyDirections[index] ?? buoy.direction,
        board.cell,
        index === this.selectedBuoy
      );
    });

    this.drawBoat(ctx, board.cell, time);
    ctx.restore();
  }

  private drawTrail(
    ctx: CanvasRenderingContext2D,
    cell: number
  ): void {
    if (this.trail.length < 2) {
      return;
    }

    ctx.strokeStyle = "rgba(245, 207, 87, 0.52)";
    ctx.lineWidth = Math.max(2, cell * 0.045);
    ctx.setLineDash([cell * 0.12, cell * 0.12]);
    ctx.beginPath();
    this.trail.forEach((point, index) => {
      const x = (point.x + 0.5) * cell;
      const y = (point.y + 0.5) * cell;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawRock(
    ctx: CanvasRenderingContext2D,
    rock: Point,
    cell: number
  ): void {
    const x = rock.x * cell;
    const y = rock.y * cell;
    const inset = cell * 0.11;

    ctx.fillStyle = "#122d35";
    ctx.fillRect(x + inset, y + inset, cell - inset * 2, cell - inset * 2);

    ctx.strokeStyle = "rgba(235, 232, 217, 0.12)";
    ctx.lineWidth = 1;
    for (let offset = -cell; offset < cell * 2; offset += cell * 0.2) {
      ctx.beginPath();
      ctx.moveTo(x + offset, y + cell - inset);
      ctx.lineTo(x + offset + cell, y + inset);
      ctx.stroke();
    }
  }

  private drawStart(
    ctx: CanvasRenderingContext2D,
    start: Point & { direction: Direction },
    cell: number
  ): void {
    const center = this.cellCenter(start, cell);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(DIRECTION_ANGLES[start.direction] ?? 0);
    ctx.fillStyle = "#f5cf57";
    ctx.beginPath();
    ctx.moveTo(cell * 0.23, 0);
    ctx.lineTo(-cell * 0.18, -cell * 0.14);
    ctx.lineTo(-cell * 0.18, cell * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawHarbor(
    ctx: CanvasRenderingContext2D,
    harbor: Point,
    cell: number,
    time: number
  ): void {
    const x = harbor.x * cell;
    const y = harbor.y * cell;
    const pulse = 0.72 + Math.sin(time / 260) * 0.14;

    ctx.fillStyle = `rgba(231, 79, 45, ${pulse})`;
    ctx.fillRect(x + cell * 0.12, y + cell * 0.12, cell * 0.76, cell * 0.76);

    ctx.strokeStyle = "#f0ebdc";
    ctx.lineWidth = Math.max(2, cell * 0.045);
    ctx.strokeRect(
      x + cell * 0.22,
      y + cell * 0.22,
      cell * 0.56,
      cell * 0.56
    );

    ctx.fillStyle = "#f0ebdc";
    ctx.font = `900 ${cell * 0.26}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("H", x + cell * 0.5, y + cell * 0.51);
  }

  private drawBuoy(
    ctx: CanvasRenderingContext2D,
    buoy: BuoyDefinition,
    direction: Direction,
    cell: number,
    selected: boolean
  ): void {
    const center = this.cellCenter(buoy, cell);
    const radius = cell * 0.28;

    ctx.save();
    ctx.translate(center.x, center.y);

    if (selected && this.phase !== "running") {
      ctx.strokeStyle = "#f5cf57";
      ctx.lineWidth = Math.max(2, cell * 0.045);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.33, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = buoy.rotatable ? "#e74f2d" : "#6b7c7d";
    ctx.strokeStyle = "#efe9d9";
    ctx.lineWidth = Math.max(2, cell * 0.04);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(DIRECTION_ANGLES[direction] ?? 0);
    ctx.strokeStyle = "#fff7e8";
    ctx.lineWidth = Math.max(2.5, cell * 0.055);
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(-radius * 0.42, 0);
    ctx.lineTo(radius * 0.42, 0);
    ctx.moveTo(radius * 0.42, 0);
    ctx.lineTo(radius * 0.08, -radius * 0.34);
    ctx.moveTo(radius * 0.42, 0);
    ctx.lineTo(radius * 0.08, radius * 0.34);
    ctx.stroke();
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

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(DIRECTION_ANGLES[this.boat.direction] ?? 0);

    ctx.fillStyle = "#f5cf57";
    ctx.strokeStyle = "#151816";
    ctx.lineWidth = Math.max(1.5, cell * 0.035);
    ctx.beginPath();
    ctx.moveTo(cell * 0.28, 0);
    ctx.lineTo(-cell * 0.2, -cell * 0.17);
    ctx.lineTo(-cell * 0.12, 0);
    ctx.lineTo(-cell * 0.2, cell * 0.17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e74f2d";
    ctx.fillRect(-cell * 0.05, -cell * 0.05, cell * 0.12, cell * 0.1);
    ctx.restore();
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
}
