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
import { LEVEL_CATALOG, MAX_STARS_PER_LEVEL, TOTAL_LEVELS, isLevelId } from "../game/levelCatalog";
import { getLanguage, type Language, type Localized } from "../i18n/language";

export const PROGRESS_STORAGE_KEY = "podcast-slingshot:progress:v1";

/** Printed when no nickname was entered; follows the interface language at display time. */
export const DEFAULT_GRADUATE_NAME: Localized = { zh: "薄肌同学", en: "Lean Muscle Graduate" };
export const NICKNAME_MAX_GRAPHEMES = 16;
/** Upper bound on the stored nickname in UTF-16 code units (16 long emoji sequences still fit). */
export const NICKNAME_MAX_CODE_UNITS = 192;

export interface LevelBest {
  bestScore: number;
  stars: number;
}

export interface GraduationRecord {
  /** Epoch milliseconds when graduation was first recognised. Never changes afterwards. */
  earnedAt: number;
  /** Local date at that moment, "YYYY.MM.DD". Frozen: not recomputed on later visits or in other time zones. */
  displayDate: string;
  /** Nickname as entered, already normalised. "" means "use the default name". */
  nickname: string;
  /** True once the one-time celebration has been shown and dismissed. */
  celebrationSeen: boolean;
}

export interface Progress {
  version: 1;
  highestUnlockedLevel: number;
  levels: Partial<Record<number, LevelBest>>;
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  sfxEnabled: boolean;
  /** Absent until earned. */
  graduation?: GraduationRecord;
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

function isLevelBest(value: unknown): value is LevelBest {
  if (!isRecord(value)) return false;
  const { bestScore, stars } = value;
  return (
    typeof bestScore === "number" &&
    Number.isFinite(bestScore) &&
    bestScore >= 0 &&
    typeof stars === "number" &&
    Number.isInteger(stars) &&
    stars >= 0 &&
    stars <= MAX_STARS_PER_LEVEL
  );
}

/** Intl.Segmenter is newer than the ES2020 lib this project compiles against. */
type GraphemeSegmenter = new (
  locales: undefined,
  options: { granularity: "grapheme" }
) => { segment(text: string): Iterable<{ segment: string }> };

function splitGraphemes(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: GraphemeSegmenter }).Segmenter;
  if (typeof Segmenter !== "function") return Array.from(text);
  return Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => {
    return part.segment;
  });
}

/**
 * Trims, turns any run of whitespace (including newlines) into a single space and cuts to
 * NICKNAME_MAX_GRAPHEMES grapheme clusters. Non-strings give "". Never adds a prefix or suffix.
 */
export function normalizeNickname(raw: unknown): string {
  if (typeof raw !== "string") return "";
  // Bound the work first: a pasted wall of text is cut before it is segmented.
  const collapsed = raw
    .slice(0, NICKNAME_MAX_CODE_UNITS * 4)
    .trim()
    .replace(/\s+/g, " ");
  let name = "";
  for (const grapheme of splitGraphemes(collapsed).slice(0, NICKNAME_MAX_GRAPHEMES)) {
    // One "grapheme" can be arbitrarily long (stacked combining marks), so the
    // stored length is capped too.
    if (name.length + grapheme.length > NICKNAME_MAX_CODE_UNITS) break;
    name += grapheme;
  }
  return name.trimEnd();
}

/** The name to print. A custom name replaces the default entirely, in either language. */
export function displayNickname(nickname: string, language: Language = getLanguage()): string {
  return normalizeNickname(nickname) || DEFAULT_GRADUATE_NAME[language];
}

/** "YYYY.MM.DD" from the Date's local calendar fields, zero padded. */
export function formatGraduationDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

const DISPLAY_DATE_PATTERN = /^\d{4}\.\d{2}\.\d{2}$/;

function parseGraduation(raw: unknown): GraduationRecord | undefined {
  if (!isRecord(raw)) return undefined;
  const { earnedAt, displayDate, celebrationSeen } = raw;
  if (typeof earnedAt !== "number" || !Number.isFinite(earnedAt) || earnedAt <= 0) return undefined;
  if (typeof displayDate !== "string" || !DISPLAY_DATE_PATTERN.test(displayDate)) return undefined;
  return {
    earnedAt,
    displayDate,
    nickname: normalizeNickname(raw.nickname),
    celebrationSeen: typeof celebrationSeen === "boolean" ? celebrationSeen : false,
  };
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
      if (!isLevelId(id) || !isLevelBest(entry)) continue;
      levels[id] = { bestScore: entry.bestScore, stars: entry.stars };
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

  // Top-level keys this version does not know (written by a newer one) ride along untyped, so the
  // next save does not erase them. Known keys are overwritten by their validated values.
  const progress = {
    ...raw,
    version: 1,
    highestUnlockedLevel,
    levels,
    unlockedCharacters,
    selectedCharacter,
    sfxEnabled: typeof raw.sfxEnabled === "boolean" ? raw.sfxEnabled : false,
  } as Progress;

  // A missing or malformed record means "not recognised yet"; a historical date is never invented.
  const graduation = parseGraduation(raw.graduation);
  if (graduation) progress.graduation = graduation;
  else delete progress.graduation;
  return progress;
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

/** The level ids that must be won: every id in LEVEL_CATALOG. */
export function requiredLevelIds(): number[] {
  return LEVEL_CATALOG.map((level) => level.id);
}

/**
 * True only when every required level id has a valid won result. A result exists only after a
 * win, so this ignores highestUnlockedLevel, attempts and how many entries there are.
 */
export function isGraduationEligible(progress: Progress): boolean {
  return requiredLevelIds().every((id) => isLevelBest(progress.levels[id]));
}

export function starTotals(progress: Progress): { earned: number; maximum: number } {
  const ids = requiredLevelIds();
  let earned = 0;
  for (const id of ids) {
    const best = progress.levels[id];
    if (isLevelBest(best)) earned += Math.min(best.stars, MAX_STARS_PER_LEVEL);
  }
  return { earned, maximum: ids.length * MAX_STARS_PER_LEVEL };
}

/** Eligible and every required level is at MAX_STARS_PER_LEVEL. */
export function isExcellentGraduate(progress: Progress): boolean {
  if (!isGraduationEligible(progress)) return false;
  const { earned, maximum } = starTotals(progress);
  return earned === maximum;
}

/**
 * Stamps the graduation record the first time an eligible save is seen. In every other case the
 * same object comes back: an existing record's date is never touched.
 */
export function recognizeGraduation(progress: Progress, now: Date): Progress {
  if (progress.graduation || !isGraduationEligible(progress)) return progress;
  return {
    ...progress,
    graduation: {
      earnedAt: now.getTime(),
      displayDate: formatGraduationDate(now),
      nickname: "",
      celebrationSeen: false,
    },
  };
}

export function setGraduationNickname(progress: Progress, raw: unknown): Progress {
  if (!progress.graduation) return progress;
  return { ...progress, graduation: { ...progress.graduation, nickname: normalizeNickname(raw) } };
}

export function acknowledgeGraduationCelebration(progress: Progress): Progress {
  if (!progress.graduation || progress.graduation.celebrationSeen) return progress;
  return { ...progress, graduation: { ...progress.graduation, celebrationSeen: true } };
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
