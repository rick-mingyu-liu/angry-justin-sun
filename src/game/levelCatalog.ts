/**
 * LevelRegistry (metadata half): the levels the game exposes, in play order.
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
  { id: 4, title: "玻璃高塔", hint: "玻璃最脆，先打塔身" },
  { id: 5, title: "火药桶", hint: "打中桌上的黄色炸药箱，让它替你干活" },
  { id: 6, title: "双子楼", hint: "两座楼都要拆，先挑细腿的下手" },
  { id: 7, title: "石头堡垒", hint: "石墙很硬，试试抬高角度从上面砸" },
  { id: 8, title: "终点站", hint: "最后一关，目标多，省着点用" },
];

export const TOTAL_LEVELS = LEVEL_CATALOG.length;

export function isLevelId(value: unknown): value is number {
  return typeof value === "number" && LEVEL_CATALOG.some((level) => level.id === value);
}

export function getLevelEntry(id: number): LevelCatalogEntry {
  return LEVEL_CATALOG.find((level) => level.id === id) ?? LEVEL_CATALOG[0];
}
