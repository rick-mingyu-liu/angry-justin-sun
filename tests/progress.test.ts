import { describe, expect, it } from "vitest";
import {
  PROGRESS_STORAGE_KEY,
  canEnterLevel,
  completeLevel,
  createProgressStore,
  defaultProgress,
  enterLevel,
  isCharacterUnlocked,
  parseProgress,
  selectCharacter,
  setSfxEnabled,
  type StorageLike,
} from "../src/storage/progress";

function fakeStorage(initial?: string): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(PROGRESS_STORAGE_KEY, initial);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("unlock rules", () => {
  it("locks level 2 until level 1 is completed", () => {
    const p = defaultProgress();
    expect(canEnterLevel(p, 1)).toBe(true);
    expect(canEnterLevel(p, 2)).toBe(false);
    expect(enterLevel(p, 2)).toBe(p);
    const done = completeLevel(p, 1, 100, 2);
    expect(canEnterLevel(done, 2)).toBe(true);
    expect(canEnterLevel(done, 3)).toBe(false);
  });

  it("rejects invalid level ids", () => {
    const p = defaultProgress();
    expect(canEnterLevel(p, 0)).toBe(false);
    expect(canEnterLevel(p, 99)).toBe(false);
    expect(canEnterLevel(p, 1.5)).toBe(false);
    expect(completeLevel(p, 99, 10, 1)).toBe(p);
  });

  it("keeps highestUnlockedLevel at the cap after completing the last level", () => {
    let p = completeLevel(defaultProgress(), 1, 1, 1);
    p = completeLevel(p, 2, 1, 1);
    p = completeLevel(p, 3, 1, 1);
    expect(p.highestUnlockedLevel).toBe(3);
  });

  it("never lowers highestUnlockedLevel when replaying", () => {
    let p = completeLevel(defaultProgress(), 1, 1, 1);
    p = completeLevel(p, 2, 1, 1);
    p = completeLevel(p, 1, 1, 1);
    expect(p.highestUnlockedLevel).toBe(3);
  });

  it("unlocks the muscle character on entering level 3, not on completing level 2", () => {
    let p = completeLevel(defaultProgress(), 1, 1, 1);
    p = enterLevel(p, 2);
    p = completeLevel(p, 2, 1, 1);
    expect(isCharacterUnlocked(p, "muscle")).toBe(false);
    p = enterLevel(p, 3);
    expect(isCharacterUnlocked(p, "muscle")).toBe(true);
  });

  it("does not mutate its input", () => {
    const p = defaultProgress();
    const snapshot = JSON.stringify(p);
    completeLevel(p, 1, 5, 3);
    enterLevel(p, 1);
    selectCharacter(p, "muscle");
    setSfxEnabled(p, true);
    expect(JSON.stringify(p)).toBe(snapshot);
  });

  it("refuses to select locked characters", () => {
    const p = defaultProgress();
    expect(selectCharacter(p, "muscle")).toBe(p);
    const unlocked = completeLevel(defaultProgress(), 1, 1, 1);
    const at3 = enterLevel(completeLevel(unlocked, 2, 1, 1), 3);
    expect(selectCharacter(at3, "muscle").selectedCharacter).toBe("muscle");
  });

  it("only raises best score and stars, independently", () => {
    let p = completeLevel(defaultProgress(), 1, 500, 1);
    p = completeLevel(p, 1, 300, 3);
    expect(p.levels[1]).toEqual({ bestScore: 500, stars: 3 });
    p = completeLevel(p, 1, 900, 2);
    expect(p.levels[1]).toEqual({ bestScore: 900, stars: 3 });
  });

  it("toggles sfx", () => {
    expect(defaultProgress().sfxEnabled).toBe(false);
    expect(setSfxEnabled(defaultProgress(), true).sfxEnabled).toBe(true);
  });
});

describe("parseProgress", () => {
  it.each([null, undefined, "x", 42, [], true, {}, { version: 2 }])(
    "returns defaults for %j",
    (raw) => {
      expect(parseProgress(raw)).toEqual(defaultProgress());
    }
  );

  it("accepts a valid object", () => {
    const valid = {
      version: 1,
      highestUnlockedLevel: 3,
      levels: { "1": { bestScore: 10, stars: 2 } },
      unlockedCharacters: ["standard", "muscle"],
      selectedCharacter: "muscle",
      sfxEnabled: true,
    };
    expect(parseProgress(valid)).toEqual(valid);
  });

  it("falls back field by field", () => {
    const p = parseProgress({
      version: 1,
      highestUnlockedLevel: 9,
      levels: {
        "1": { bestScore: 10, stars: 4 },
        "2": { bestScore: -1, stars: 1 },
        "3": { bestScore: 5, stars: 1.5 },
        "7": { bestScore: 5, stars: 1 },
        x: { bestScore: 5, stars: 1 },
      },
      unlockedCharacters: ["ghost", "muscle", "muscle"],
      selectedCharacter: "ghost",
      sfxEnabled: "yes",
    });
    expect(p.highestUnlockedLevel).toBe(1);
    expect(p.levels).toEqual({});
    expect(p.unlockedCharacters).toEqual(["standard", "muscle"]);
    expect(p.selectedCharacter).toBe("standard");
    expect(p.sfxEnabled).toBe(false);
  });

  it("always includes the default character and requires selection to be unlocked", () => {
    const p = parseProgress({
      version: 1,
      unlockedCharacters: [],
      selectedCharacter: "muscle",
    });
    expect(p.unlockedCharacters).toEqual(["standard"]);
    expect(p.selectedCharacter).toBe("standard");
  });

  it("handles non-object levels and non-array characters", () => {
    const p = parseProgress({ version: 1, levels: "bad", unlockedCharacters: "bad" });
    expect(p.levels).toEqual({});
    expect(p.unlockedCharacters).toEqual(["standard"]);
  });
});

describe("createProgressStore", () => {
  it("round trips through working storage", () => {
    const storage = fakeStorage();
    const store = createProgressStore(storage);
    expect(store.persistent).toBe(true);
    store.update((p) => completeLevel(p, 1, 123, 2));
    expect(storage.data.has(PROGRESS_STORAGE_KEY)).toBe(true);
    const reloaded = createProgressStore(storage);
    expect(reloaded.get().levels[1]).toEqual({ bestScore: 123, stars: 2 });
    expect(reloaded.get().highestUnlockedLevel).toBe(2);
  });

  it("falls back to memory when getItem throws", () => {
    const store = createProgressStore({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {},
    });
    expect(store.persistent).toBe(false);
    expect(store.get()).toEqual(defaultProgress());
    expect(store.update((p) => setSfxEnabled(p, true)).sfxEnabled).toBe(true);
  });

  it("keeps the in-memory value and flips persistent when setItem throws", () => {
    const store = createProgressStore({
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    });
    expect(store.persistent).toBe(true);
    const next = store.update((p) => completeLevel(p, 1, 5, 1));
    expect(next.highestUnlockedLevel).toBe(2);
    expect(store.get().highestUnlockedLevel).toBe(2);
    expect(store.persistent).toBe(false);
  });

  it("starts fresh on invalid JSON text and overwrites it on save", () => {
    const storage = fakeStorage("{not json");
    const store = createProgressStore(storage);
    expect(store.get()).toEqual(defaultProgress());
    store.update((p) => setSfxEnabled(p, true));
    expect(JSON.parse(storage.data.get(PROGRESS_STORAGE_KEY) ?? "")).toMatchObject({
      sfxEnabled: true,
    });
  });

  it("works with null storage", () => {
    const store = createProgressStore(null);
    expect(store.persistent).toBe(false);
    expect(store.update((p) => completeLevel(p, 1, 1, 1)).highestUnlockedLevel).toBe(2);
  });

  it("works with no storage argument outside a browser", () => {
    const store = createProgressStore();
    expect(store.persistent).toBe(false);
    expect(store.get()).toEqual(defaultProgress());
  });

  it("does not throw when the update function throws", () => {
    const store = createProgressStore(null);
    expect(() =>
      store.update(() => {
        throw new Error("boom");
      })
    ).not.toThrow();
  });
});
