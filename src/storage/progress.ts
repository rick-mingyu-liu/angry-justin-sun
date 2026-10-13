/**
 * Player progress: pure rules plus a never-throwing localStorage-backed store.
 * No DOM globals at module top level, no Phaser imports.
 */

import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  isCharacterId,
  type CharacterId,
} from "../game/characters";
import { TOTAL_LEVELS, isLevelId } from "../game/levelCatalog";

export const PROGRESS_STORAGE_KEY = "podcast-slingshot:progress:v1";

export interface LevelBest {
  bestScore: number;
  stars: number;
}

export interface Progress {
  version: 1;
  highestUnlockedLevel: number;
  levels: Partial<Record<number, LevelBest>>;
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  sfxEnabled: boolean;
}

export function defaultProgress(): Progress {
  return {
    version: 1,
    highestUnlockedLevel: 1,
    levels: {},
    unlockedCharacters: [DEFAULT_CHARACTER_ID],
    selectedCharacter: DEFAULT_CHARACTER_ID,
    sfxEnabled: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProgress(raw: unknown): Progress {
  if (!isRecord(raw) || raw.version !== 1) return defaultProgress();

  const highest = raw.highestUnlockedLevel;
  const highestUnlockedLevel =
    typeof highest === "number" &&
    Number.isInteger(highest) &&
    highest >= 1 &&
    highest <= TOTAL_LEVELS
      ? highest
      : 1;

  const levels: Partial<Record<number, LevelBest>> = {};
  if (isRecord(raw.levels)) {
    for (const [key, entry] of Object.entries(raw.levels)) {
      const id = Number(key);
      if (!isLevelId(id) || !isRecord(entry)) continue;
      const { bestScore, stars } = entry;
      if (
        typeof bestScore === "number" &&
        Number.isFinite(bestScore) &&
        bestScore >= 0 &&
        typeof stars === "number" &&
        Number.isInteger(stars) &&
        stars >= 0 &&
        stars <= 3
      ) {
        levels[id] = { bestScore, stars };
      }
    }
  }

  const unlocked = new Set<CharacterId>([DEFAULT_CHARACTER_ID]);
  if (Array.isArray(raw.unlockedCharacters)) {
    for (const id of raw.unlockedCharacters) {
      if (isCharacterId(id)) unlocked.add(id);
    }
  }
  const unlockedCharacters = CHARACTERS.map((c) => c.id).filter((id) => unlocked.has(id));

  const selectedCharacter =
    isCharacterId(raw.selectedCharacter) && unlocked.has(raw.selectedCharacter)
      ? raw.selectedCharacter
      : DEFAULT_CHARACTER_ID;

  return {
    version: 1,
    highestUnlockedLevel,
    levels,
    unlockedCharacters,
    selectedCharacter,
    sfxEnabled: typeof raw.sfxEnabled === "boolean" ? raw.sfxEnabled : false,
  };
}

export function canEnterLevel(progress: Progress, levelId: number): boolean {
  return isLevelId(levelId) && levelId <= progress.highestUnlockedLevel;
}

export function enterLevel(progress: Progress, levelId: number): Progress {
  if (!canEnterLevel(progress, levelId)) return progress;
  const unlocked = new Set(progress.unlockedCharacters);
  for (const character of CHARACTERS) {
    if (character.unlockLevel <= levelId) unlocked.add(character.id);
  }
  return {
    ...progress,
    unlockedCharacters: CHARACTERS.map((c) => c.id).filter((id) => unlocked.has(id)),
  };
}

export function completeLevel(
  progress: Progress,
  levelId: number,
  score: number,
  stars: number
): Progress {
  if (!isLevelId(levelId)) return progress;
  const safeScore = Number.isFinite(score) && score > 0 ? score : 0;
  const safeStars = Number.isFinite(stars) ? Math.min(3, Math.max(0, Math.floor(stars))) : 0;
  const old = progress.levels[levelId];
  return {
    ...progress,
    highestUnlockedLevel: Math.max(
      progress.highestUnlockedLevel,
      Math.min(levelId + 1, TOTAL_LEVELS)
    ),
    levels: {
      ...progress.levels,
      [levelId]: {
        bestScore: Math.max(old?.bestScore ?? 0, safeScore),
        stars: Math.max(old?.stars ?? 0, safeStars),
      },
    },
  };
}

export function isCharacterUnlocked(progress: Progress, id: CharacterId): boolean {
  return progress.unlockedCharacters.includes(id);
}

export function selectCharacter(progress: Progress, id: CharacterId): Progress {
  if (!isCharacterUnlocked(progress, id)) return progress;
  return { ...progress, selectedCharacter: id };
}

export function setSfxEnabled(progress: Progress, enabled: boolean): Progress {
  return { ...progress, sfxEnabled: enabled };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressStore {
  get(): Progress;
  update(fn: (progress: Progress) => Progress): Progress;
  readonly persistent: boolean;
}

function resolveStorage(storage: StorageLike | null | undefined): StorageLike | null {
  if (storage !== undefined) return storage;
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function createProgressStore(storage?: StorageLike | null): ProgressStore {
  const backend = resolveStorage(storage);
  let persistent = backend !== null;
  let current = defaultProgress();

  if (backend) {
    let text: string | null = null;
    try {
      text = backend.getItem(PROGRESS_STORAGE_KEY);
    } catch {
      persistent = false;
    }
    if (text !== null) {
      try {
        current = parseProgress(JSON.parse(text));
      } catch {
        // Invalid JSON text: start fresh; the next save overwrites it.
      }
    }
  }

  return {
    get: () => current,
    update(fn) {
      try {
        current = parseProgress(fn(current));
      } catch {
        return current;
      }
      if (backend && persistent) {
        try {
          backend.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));
        } catch {
          persistent = false;
        }
      }
      return current;
    },
    get persistent() {
      return persistent;
    },
  };
}
