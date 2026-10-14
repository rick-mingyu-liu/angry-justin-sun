import { describe, expect, it } from "vitest";
import { LEVEL_CATALOG, MAX_STARS_PER_LEVEL, TOTAL_LEVELS } from "../src/game/levelCatalog";
import {
  DEFAULT_GRADUATE_NAME,
  NICKNAME_MAX_CODE_UNITS,
  NICKNAME_MAX_GRAPHEMES,
  PROGRESS_STORAGE_KEY,
  acknowledgeGraduationCelebration,
  completeLevel,
  createProgressStore,
  defaultProgress,
  displayNickname,
  enterLevel,
  formatGraduationDate,
  isExcellentGraduate,
  isGraduationEligible,
  normalizeNickname,
  parseProgress,
  recognizeGraduation,
  requiredLevelIds,
  selectCharacter,
  setGraduationNickname,
  setSfxEnabled,
  starTotals,
  type Progress,
  type StorageLike,
} from "../src/storage/progress";

const ALL_IDS = LEVEL_CATALOG.map((level) => level.id);
const LAST_ID = ALL_IDS[ALL_IDS.length - 1];
const ALL_BUT_LAST = ALL_IDS.slice(0, -1);
const EARNED_ON = new Date(2031, 2, 9, 23, 59);
const LATER = new Date(2032, 10, 20, 8, 0);

function win(ids: readonly number[], stars = 1, from: Progress = defaultProgress()): Progress {
  return ids.reduce((p, id) => completeLevel(p, id, 100 * id, stars), from);
}

function graduate(stars = 1, now = EARNED_ON): Progress {
  return recognizeGraduation(win(ALL_IDS, stars), now);
}

/** What an older build stored: plain JSON, results under string keys, no graduation key. */
function rawSave(ids: readonly number[], stars = 2): Record<string, unknown> {
  return {
    version: 1,
    highestUnlockedLevel: TOTAL_LEVELS,
    levels: Object.fromEntries(ids.map((id) => [String(id), { bestScore: 10, stars }])),
    unlockedCharacters: ["standard", "muscle"],
    selectedCharacter: "standard",
    sfxEnabled: false,
  };
}

function fakeStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("graduation eligibility", () => {
  it("requires every catalog level", () => {
    expect(requiredLevelIds()).toEqual(ALL_IDS);
    expect(isGraduationEligible(defaultProgress())).toBe(false);
    expect(isGraduationEligible(win(ALL_BUT_LAST))).toBe(false);
    expect(isGraduationEligible(win(ALL_IDS))).toBe(true);
  });

  it("is not satisfied by unlocking the last level without winning it", () => {
    const p = win(ALL_BUT_LAST);
    expect(p.highestUnlockedLevel).toBe(TOTAL_LEVELS);
    expect(isGraduationEligible(enterLevel(p, LAST_ID))).toBe(false);
  });

  it("does not depend on the order levels were won in", () => {
    expect(isGraduationEligible(win([...ALL_IDS].reverse()))).toBe(true);
  });

  it("does not count a level won repeatedly more than once", () => {
    const p = win([1, 1, 1, 1], 3, win(ALL_BUT_LAST));
    expect(isGraduationEligible(p)).toBe(false);
    expect(Object.keys(p.levels)).toHaveLength(ALL_BUT_LAST.length);
  });

  it("ignores unknown ids and malformed results in raw storage", () => {
    const raw = rawSave(ALL_BUT_LAST);
    Object.assign(raw.levels as object, {
      "0": { bestScore: 10, stars: 3 },
      [String(TOTAL_LEVELS + 1)]: { bestScore: 10, stars: 3 },
      "99": { bestScore: 10, stars: 3 },
      x: { bestScore: 10, stars: 3 },
      [String(LAST_ID)]: { bestScore: "10", stars: 9 },
    });
    const p = parseProgress(raw);
    expect(Object.keys(p.levels).map(Number)).toEqual(ALL_BUT_LAST);
    expect(isGraduationEligible(p)).toBe(false);
    expect(recognizeGraduation(p, EARNED_ON).graduation).toBeUndefined();
  });

  it.each([null, true, 3, "won", []])("ignores a last-level result of %j", (entry) => {
    const raw = rawSave(ALL_BUT_LAST);
    Object.assign(raw.levels as object, { [String(LAST_ID)]: entry });
    expect(isGraduationEligible(parseProgress(raw))).toBe(false);
  });

  it("is not fooled by a levels array or by the right number of wrong ids", () => {
    const asArray = { ...rawSave([]), levels: ALL_IDS.map(() => ({ bestScore: 10, stars: 3 })) };
    expect(isGraduationEligible(parseProgress(asArray))).toBe(false);
    expect(
      isGraduationEligible(parseProgress(ALL_IDS.map(() => ({ bestScore: 1, stars: 1 }))))
    ).toBe(false);

    const shifted = rawSave(ALL_IDS.map((id) => id + 1));
    expect(Object.keys(shifted.levels as object)).toHaveLength(TOTAL_LEVELS);
    expect(isGraduationEligible(parseProgress(shifted))).toBe(false);
  });

  it("checks results itself when handed an unvalidated object", () => {
    const forged = win(ALL_BUT_LAST);
    forged.levels[LAST_ID] = { bestScore: Number.NaN, stars: 1 };
    expect(isGraduationEligible(forged)).toBe(false);
  });
});

describe("recognizeGraduation", () => {
  it("creates the record once, with the supplied time", () => {
    const eligible = win(ALL_IDS);
    const first = recognizeGraduation(eligible, EARNED_ON);
    expect(eligible.graduation).toBeUndefined();
    expect(first.graduation).toEqual({
      earnedAt: EARNED_ON.getTime(),
      displayDate: "2031.03.09",
      nickname: "",
      celebrationSeen: false,
    });

    const second = recognizeGraduation(first, LATER);
    expect(second).toBe(first);
    expect(second.graduation?.displayDate).toBe("2031.03.09");
  });

  it("does nothing for a save that is not eligible", () => {
    const p = win(ALL_BUT_LAST);
    expect(recognizeGraduation(p, EARNED_ON)).toBe(p);
  });

  it("recognises a legacy save with the date it is first seen on", () => {
    const legacy = rawSave(ALL_IDS);
    expect("graduation" in legacy).toBe(false);
    const parsed = parseProgress(JSON.parse(JSON.stringify(legacy)));
    expect(parsed.graduation).toBeUndefined();
    const recognised = recognizeGraduation(parsed, LATER);
    expect(recognised.graduation?.earnedAt).toBe(LATER.getTime());
    expect(recognised.graduation?.displayDate).toBe("2032.11.20");
  });
});

describe("graduation record survives later play", () => {
  it("is carried unchanged through every progress update", () => {
    const graduated = setGraduationNickname(graduate(), "阿伟");
    const record = graduated.graduation;
    const steps: Array<(p: Progress) => Progress> = [
      (p) => completeLevel(p, 1, 999999, 3),
      (p) => completeLevel(p, 1, 0, 0),
      (p) => completeLevel(p, LAST_ID, 5, 2),
      (p) => enterLevel(p, 3),
      (p) => selectCharacter(p, "muscle"),
      (p) => setSfxEnabled(p, true),
      (p) => parseProgress(p),
    ];
    let p = graduated;
    for (const step of steps) {
      p = step(p);
      expect(p.graduation).toEqual(record);
      expect(recognizeGraduation(p, LATER)).toBe(p);
    }
    expect(p.selectedCharacter).toBe("muscle");
  });

  it("round trips through working storage", () => {
    const storage = fakeStorage();
    const store = createProgressStore(storage);
    store.update((p) => win(ALL_IDS, 2, p));
    store.update((p) => recognizeGraduation(p, EARNED_ON));
    store.update((p) => setGraduationNickname(p, "  阿伟\n"));
    store.update(acknowledgeGraduationCelebration);
    const expected = {
      earnedAt: EARNED_ON.getTime(),
      displayDate: "2031.03.09",
      nickname: "阿伟",
      celebrationSeen: true,
    };

    const reloaded = createProgressStore(storage);
    expect(reloaded.get().graduation).toEqual(expected);
    reloaded.update((p) => completeLevel(p, 4, 1, 1));
    reloaded.update((p) => recognizeGraduation(p, LATER));
    expect(createProgressStore(storage).get().graduation).toEqual(expected);
    expect(JSON.parse(storage.data.get(PROGRESS_STORAGE_KEY) ?? "").graduation).toEqual(expected);
  });

  it.each([
    [
      "getItem",
      {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {},
      },
    ],
    [
      "setItem",
      {
        getItem: () => null,
        setItem: () => {
          throw new Error("quota");
        },
      },
    ],
  ])("still works in memory when %s throws", (_name, storage: StorageLike) => {
    const store = createProgressStore(storage);
    store.update((p) => win(ALL_IDS, 1, p));
    store.update((p) => recognizeGraduation(p, EARNED_ON));
    store.update((p) => setGraduationNickname(p, "阿伟"));
    store.update(acknowledgeGraduationCelebration);
    expect(store.persistent).toBe(false);
    expect(store.get().graduation).toEqual({
      earnedAt: EARNED_ON.getTime(),
      displayDate: "2031.03.09",
      nickname: "阿伟",
      celebrationSeen: true,
    });
  });
});

describe("acknowledgeGraduationCelebration", () => {
  it("flips once and is then stable", () => {
    const graduated = graduate();
    expect(graduated.graduation?.celebrationSeen).toBe(false);
    const seen = acknowledgeGraduationCelebration(graduated);
    expect(seen.graduation?.celebrationSeen).toBe(true);
    expect(graduated.graduation?.celebrationSeen).toBe(false);
    expect(acknowledgeGraduationCelebration(seen)).toBe(seen);
  });

  it("does nothing without a record", () => {
    const p = win(ALL_BUT_LAST);
    expect(acknowledgeGraduationCelebration(p)).toBe(p);
  });
});

describe("nickname", () => {
  it("trims and collapses whitespace, including newlines", () => {
    expect(normalizeNickname("  阿伟  ")).toBe("阿伟");
    expect(normalizeNickname("阿\n\n伟 \t\r\n 同学")).toBe("阿 伟 同学");
    expect(normalizeNickname("")).toBe("");
    expect(normalizeNickname(" \n\t　")).toBe("");
  });

  it("keeps Chinese and emoji, and adds nothing", () => {
    expect(normalizeNickname("孙哥🔥Sun")).toBe("孙哥🔥Sun");
  });

  it("cuts to the grapheme limit", () => {
    expect(NICKNAME_MAX_GRAPHEMES).toBe(16);
    expect(normalizeNickname("一二三四五六七八九十一二三四五六七八九十")).toBe(
      "一二三四五六七八九十一二三四五六"
    );
    expect(normalizeNickname("a".repeat(20))).toBe("a".repeat(NICKNAME_MAX_GRAPHEMES));
    expect(normalizeNickname("a".repeat(15) + " bcd")).toBe("a".repeat(15));
  });

  it("counts a ZWJ family emoji as one grapheme", () => {
    const family = "👨‍👩‍👧‍👦";
    expect(family.length).toBeGreaterThan(NICKNAME_MAX_GRAPHEMES / 2);
    expect(normalizeNickname(family.repeat(20))).toBe(family.repeat(NICKNAME_MAX_GRAPHEMES));
    expect(normalizeNickname(`阿伟${family}`)).toBe(`阿伟${family}`);
  });

  it.each([undefined, null, 42, {}, ["阿伟"], true])("turns %j into an empty nickname", (raw) => {
    expect(normalizeNickname(raw)).toBe("");
  });

  it("falls back to the default name only at display time", () => {
    expect(DEFAULT_GRADUATE_NAME).toBe("薄肌同学");
    expect(displayNickname("")).toBe("薄肌同学");
    expect(displayNickname("阿伟")).toBe("阿伟");
    for (const blank of ["", "   ", "\n \t"]) {
      const p = setGraduationNickname(graduate(), blank);
      expect(p.graduation?.nickname).toBe("");
      expect(displayNickname(p.graduation?.nickname ?? "x")).toBe("薄肌同学");
    }
  });

  it("is stored normalised on an existing record only", () => {
    const named = setGraduationNickname(graduate(), "  阿\n伟  ");
    expect(named.graduation?.nickname).toBe("阿 伟");
    expect(named.graduation?.displayDate).toBe("2031.03.09");
    expect(setGraduationNickname(named, 42).graduation?.nickname).toBe("");
    const notYet = win(ALL_BUT_LAST);
    expect(setGraduationNickname(notYet, "阿伟")).toBe(notYet);
  });
});

describe("nickname size bound", () => {
  it("caps the stored length even when one grapheme is enormous", () => {
    const zalgo = "a" + "\u0301".repeat(5000);
    const name = normalizeNickname(zalgo.repeat(3));
    expect(name.length).toBeLessThanOrEqual(NICKNAME_MAX_CODE_UNITS);
  });

  it("still fits sixteen long emoji sequences", () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}";
    expect(family.length * NICKNAME_MAX_GRAPHEMES).toBeLessThanOrEqual(NICKNAME_MAX_CODE_UNITS);
  });

  it("handles a very long paste without keeping it", () => {
    const name = normalizeNickname("薄".repeat(100000));
    expect(Array.from(name)).toHaveLength(NICKNAME_MAX_GRAPHEMES);
  });
});

describe("formatGraduationDate", () => {
  it("zero-pads the local calendar fields", () => {
    expect(formatGraduationDate(new Date(2026, 0, 5, 23, 59))).toBe("2026.01.05");
    expect(formatGraduationDate(new Date(2026, 0, 5, 0, 0))).toBe("2026.01.05");
    expect(formatGraduationDate(new Date(2027, 11, 31, 23, 59, 59))).toBe("2027.12.31");
  });

  it("is frozen in the record through later parses and updates", () => {
    const storage = fakeStorage();
    const store = createProgressStore(storage);
    store.update(() => graduate(1, new Date(2026, 0, 5, 23, 59)));
    const reloaded = createProgressStore(storage);
    reloaded.update((p) => recognizeGraduation(completeLevel(p, 2, 50, 3), LATER));
    expect(parseProgress(reloaded.get()).graduation?.displayDate).toBe("2026.01.05");
    expect(reloaded.get().graduation?.earnedAt).toBe(new Date(2026, 0, 5, 23, 59).getTime());
  });
});

describe("stars", () => {
  const MAXIMUM = LEVEL_CATALOG.length * MAX_STARS_PER_LEVEL;

  it("totals stars over the required levels against a catalog-derived maximum", () => {
    expect(starTotals(defaultProgress())).toEqual({ earned: 0, maximum: MAXIMUM });
    const p = win([1, 2], 3, win(ALL_BUT_LAST, 1));
    expect(starTotals(p)).toEqual({ earned: ALL_BUT_LAST.length + 4, maximum: MAXIMUM });
  });

  it("caps a level at the maximum and skips ids outside the catalog", () => {
    const forged = win([1], 2);
    forged.levels[TOTAL_LEVELS + 1] = { bestScore: 1, stars: 3 };
    forged.levels[2] = { bestScore: 1, stars: 50 };
    expect(starTotals(forged).earned).toBe(2);
  });

  it("is excellent only when every level has full stars", () => {
    expect(isExcellentGraduate(win(ALL_IDS, 2))).toBe(false);
    expect(isExcellentGraduate(win(ALL_BUT_LAST, MAX_STARS_PER_LEVEL))).toBe(false);
    const oneShort = win([LAST_ID], 2, win(ALL_BUT_LAST, MAX_STARS_PER_LEVEL));
    expect(starTotals(oneShort).earned).toBe(MAXIMUM - 1);
    expect(isExcellentGraduate(oneShort)).toBe(false);
    expect(isExcellentGraduate(win(ALL_IDS, MAX_STARS_PER_LEVEL))).toBe(true);
  });
});
