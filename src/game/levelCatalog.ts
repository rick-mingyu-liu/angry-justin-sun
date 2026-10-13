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
  { id: 3, title: "薄肌登场", hint: "薄肌孙哥已解锁，可在下方切换外观" },
  { id: 4, title: "玻璃高塔", hint: "玻璃最脆，先打塔身" },
  { id: 5, title: "火药桶", hint: "打中桌上的黄色炸药箱，让它替你干活" },
  { id: 6, title: "双子楼", hint: "两座楼都要拆，先挑细腿的下手" },
  { id: 7, title: "石头堡垒", hint: "石墙很硬，试试抬高角度从上面砸" },
  { id: 8, title: "三连站", hint: "三座建筑一字排开，省着点用" },
  { id: 9, title: "林中堡垒", hint: "先打玻璃柱，别硬碰石头" },
  { id: 10, title: "王冠之下", hint: "先击碎顶端的玻璃王冠" },
  { id: 11, title: "连环炸", hint: "炸药箱相连，引爆一个就连锁" },
  { id: 12, title: "爆破神殿", hint: "击穿玻璃顶，引爆中间炸药箱" },
  { id: 13, title: "墓穴崩塌", hint: "中间炸药箱炸塌上方高塔" },
  { id: 14, title: "沙漠要塞", hint: "绕开右侧金属，攻击中间目标" },
  { id: 15, title: "铁门关", hint: "铁门太硬，从上方木楼打起" },
  { id: 16, title: "地牢深处", hint: "底层炸药箱挨着两个目标" },
  { id: 17, title: "铁甲堡垒", hint: "底层三个目标紧挨炸药箱" },
  { id: 18, title: "王座之厅", hint: "最高的目标站在玻璃柱上" },
  { id: 19, title: "水晶宫", hint: "全是玻璃，力道不用太大" },
  { id: 20, title: "冰瀑连环", hint: "目标坐在玻璃上，先击碎玻璃" },
  { id: 21, title: "方块阵", hint: "目标坐在玻璃板上，别打石柱" },
  { id: 22, title: "冰川堡垒", hint: "顶部是玻璃，先打掉再清底层" },
  { id: 23, title: "极地末日", hint: "从两侧木柱下手最省力" },
  { id: 24, title: "熔岩连环", hint: "高处目标踩着单块玻璃" },
  { id: 25, title: "火山口", hint: "炸药箱遍布，一炸连炸一片" },
  { id: 26, title: "林冠崩塌", hint: "打碎玻璃层，上面的会塌" },
  { id: 27, title: "长藤桥", hint: "木头比石头好打，石柱别硬碰" },
  { id: 28, title: "石像守卫", hint: "炸药箱就在目标脚边" },
  { id: 29, title: "树顶围攻", hint: "目标都在顶端，瞄准玻璃层" },
  { id: 30, title: "丛林要塞", hint: "石柱高大，瞄准较脆的木玻璃" },
];

export const TOTAL_LEVELS = LEVEL_CATALOG.length;

export function isLevelId(value: unknown): value is number {
  return typeof value === "number" && LEVEL_CATALOG.some((level) => level.id === value);
}

export function getLevelEntry(id: number): LevelCatalogEntry {
  return LEVEL_CATALOG.find((level) => level.id === id) ?? LEVEL_CATALOG[0];
}
