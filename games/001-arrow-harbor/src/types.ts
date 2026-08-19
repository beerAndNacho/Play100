export type Direction = 0 | 1 | 2 | 3;
export type GamePhase = "planning" | "running" | "won" | "failed";
export type Medal = "bronze" | "silver" | "gold";

export interface Point {
  x: number;
  y: number;
}

export interface BuoyDefinition extends Point {
  direction: Direction;
  solution: Direction;
  rotatable: boolean;
}

export interface LevelDefinition {
  id: number;
  name: string;
  size: {
    columns: number;
    rows: number;
  };
  start: Point & {
    direction: Direction;
  };
  harbor: Point;
  rocks: Point[];
  buoys: BuoyDefinition[];
  parRotations: number;
  medal: {
    gold: number;
    silver: number;
  };
}

export interface GameSnapshot {
  levelIndex: number;
  level: LevelDefinition;
  phase: GamePhase;
  rotations: number;
  failures: number;
  hintUsed: boolean;
  selectedBuoy: number;
  message: string;
}

export interface CompletionResult {
  level: LevelDefinition;
  medal: Medal;
  rotations: number;
  score: number;
  hintUsed: boolean;
}
