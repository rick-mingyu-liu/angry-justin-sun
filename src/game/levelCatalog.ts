/**
 * LevelRegistry (metadata half): the three levels the MVP exposes.
 * Kept free of Phaser imports so storage and UI code can use it.
 * Level geometry lives in ./levels.ts.
 */

export interface LevelCatalogEntry {
  id: number;
  title: string;
  hint: string;
}

export const LEVEL_CATALOG: readonly LevelCatalogEntry[] = [
  { id: 1, title: "热身发射", hint: "拖动坚果瞄准，松开发射" },
  { id: 2, title: "釜底抽薪", hint: "打掉底部的支撑，让上面的塌下来" },
  { id: 3, title: "肌肉登场", hint: "肌肉孙哥已解锁，可在下方切换外观" },
];

export const TOTAL_LEVELS = LEVEL_CATALOG.length;

export function isLevelId(value: unknown): value is number {
  return typeof value === "number" && LEVEL_CATALOG.some((level) => level.id === value);
}

export function getLevelEntry(id: number): LevelCatalogEntry {
  return LEVEL_CATALOG.find((level) => level.id === id) ?? LEVEL_CATALOG[0];
}
