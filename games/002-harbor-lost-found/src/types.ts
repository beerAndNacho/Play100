export type GamePhase = "ready" | "playing" | "won" | "lost";
export type Medal = "bronze" | "silver" | "gold";

export type ObjectKind =
  | "key"
  | "glove"
  | "sock"
  | "camera"
  | "compass"
  | "bottle"
  | "umbrella"
  | "starfish"
  | "hat"
  | "paperboat"
  | "apple"
  | "shell"
  | "anchor"
  | "lantern"
  | "watch"
  | "binoculars"
  | "crab"
  | "postcard"
  | "bell"
  | "seahorse";

export interface SceneObject {
  id: string;
  label: string;
  kind: ObjectKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
}

export type SceneLayout =
  | "market"
  | "warehouse"
  | "pier"
  | "night"
  | "shipyard";

export interface ScenePalette {
  skyA: string;
  skyB: string;
  waterA: string;
  waterB: string;
  ground: string;
  structure: string;
  structureLight: string;
  accent: string;
  ink: string;
}

export interface SceneDefinition {
  id: number;
  name: string;
  callSign: string;
  subtitle: string;
  briefing: string;
  weather: string;
  timeLimit: number;
  layout: SceneLayout;
  palette: ScenePalette;
  objects: SceneObject[];
}

export interface RoundResult {
  scene: SceneDefinition;
  medal: Medal;
  score: number;
  mistakes: number;
  hintsUsed: number;
  timeLeft: number;
}
