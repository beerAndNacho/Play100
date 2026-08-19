export type Medal = "none" | "bronze" | "silver" | "gold";

export interface LevelResult {
  medal: Medal;
  score: number;
  rotations: number;
  completedAt: string;
}

export interface GameProgress {
  plays: number;
  bestScore: number;
  completedLevels: Record<string, LevelResult>;
  lastPlayedAt: string;
}

export interface ArcadeState {
  version: 1;
  games: Record<string, GameProgress>;
  recentGames: string[];
}

const STORAGE_KEY = "play100:arcade:v1";
const MEDAL_WEIGHT: Record<Medal, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3
};

const emptyState = (): ArcadeState => ({
  version: 1,
  games: {},
  recentGames: []
});

function safeStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const key = "__play100_test__";
    storage.setItem(key, key);
    storage.removeItem(key);
    return storage;
  } catch {
    return null;
  }
}

export function loadArcadeState(): ArcadeState {
  const storage = safeStorage();
  if (!storage) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null") as
      | ArcadeState
      | null;

    if (!parsed || parsed.version !== 1 || typeof parsed.games !== "object") {
      return emptyState();
    }

    return {
      version: 1,
      games: parsed.games ?? {},
      recentGames: Array.isArray(parsed.recentGames)
        ? parsed.recentGames.slice(0, 12)
        : []
    };
  } catch {
    return emptyState();
  }
}

function persist(state: ArcadeState): void {
  safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function track(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
): void {
  const globalWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  };

  globalWindow.gtag?.("event", eventName, params);
  globalWindow.clarity?.("event", eventName);

  if (globalWindow.clarity) {
    for (const [key, value] of Object.entries(params)) {
      globalWindow.clarity("set", key, String(value));
    }
  }

  window.dispatchEvent(
    new CustomEvent("play100:analytics", {
      detail: { eventName, params }
    })
  );
}

export function recordGameStart(gameId: string): GameProgress {
  const state = loadArcadeState();
  const current: GameProgress = state.games[gameId] ?? {
    plays: 0,
    bestScore: 0,
    completedLevels: {},
    lastPlayedAt: new Date(0).toISOString()
  };

  const progress: GameProgress = {
    ...current,
    plays: current.plays + 1,
    lastPlayedAt: new Date().toISOString()
  };

  state.games[gameId] = progress;
  state.recentGames = [
    gameId,
    ...state.recentGames.filter((id) => id !== gameId)
  ].slice(0, 12);

  persist(state);
  track("game_start", { game_id: gameId, play_count: progress.plays });

  return progress;
}

export function saveLevelResult(
  gameId: string,
  levelId: string | number,
  result: Omit<LevelResult, "completedAt">
): GameProgress {
  const state = loadArcadeState();
  const current: GameProgress = state.games[gameId] ?? {
    plays: 0,
    bestScore: 0,
    completedLevels: {},
    lastPlayedAt: new Date().toISOString()
  };

  const key = String(levelId);
  const previous = current.completedLevels[key];
  const shouldReplace =
    !previous ||
    MEDAL_WEIGHT[result.medal] > MEDAL_WEIGHT[previous.medal] ||
    (result.medal === previous.medal && result.score > previous.score);

  const completedLevels = { ...current.completedLevels };
  if (shouldReplace) {
    completedLevels[key] = {
      ...result,
      completedAt: new Date().toISOString()
    };
  }

  const progress: GameProgress = {
    ...current,
    bestScore: Math.max(current.bestScore, result.score),
    completedLevels,
    lastPlayedAt: new Date().toISOString()
  };

  state.games[gameId] = progress;
  state.recentGames = [
    gameId,
    ...state.recentGames.filter((id) => id !== gameId)
  ].slice(0, 12);

  persist(state);
  track("level_complete", {
    game_id: gameId,
    level_id: key,
    medal: result.medal,
    score: result.score,
    rotations: result.rotations
  });

  return progress;
}

export function getGameProgress(gameId: string): GameProgress | null {
  return loadArcadeState().games[gameId] ?? null;
}

export function getMedalCount(): Record<Exclude<Medal, "none">, number> {
  const count = { bronze: 0, silver: 0, gold: 0 };

  for (const game of Object.values(loadArcadeState().games)) {
    for (const level of Object.values(game.completedLevels)) {
      if (level.medal !== "none") {
        count[level.medal] += 1;
      }
    }
  }

  return count;
}

export function getCompletedGameCount(): number {
  return Object.values(loadArcadeState().games).filter(
    (game) => Object.keys(game.completedLevels).length > 0
  ).length;
}

export function getDailyIndex(total: number, date = new Date()): number {
  if (total <= 0) {
    return 0;
  }
  const stamp = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let hash = 0;
  for (const char of stamp) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % total;
}

export function playTone(
  frequency: number,
  duration = 0.08,
  volume = 0.025
): void {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.addEventListener("ended", () => {
      void context.close();
    });
  } catch {
    // Sound is optional. Browsers may block it before a user gesture.
  }
}

export function formatGameId(id: number): string {
  return `GAME-${String(id).padStart(3, "0")}`;
}
