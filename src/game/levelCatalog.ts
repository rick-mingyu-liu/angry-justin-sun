/**
 * LevelRegistry (metadata half): the levels the game exposes, in play order.
 * Kept free of Phaser imports so storage and UI code can use it.
 * Level geometry lives in ./levels.ts.
 */

import type { Localized } from "../i18n/language";

export interface LevelCatalogEntry {
  id: number;
  title: Localized;
  hint: Localized;
}

export const LEVEL_CATALOG: readonly LevelCatalogEntry[] = [
  {
    id: 1,
    title: { zh: "热身发射", en: "Warm-Up Shot" },
    hint: { zh: "拖动坚果瞄准，松开发射", en: "Drag the nut to aim, release to fire" },
  },
  {
    id: 2,
    title: { zh: "釜底抽薪", en: "Pull the Rug" },
    hint: {
      zh: "打掉底部的支撑，让上面的塌下来",
      en: "Knock out the base supports so the top collapses",
    },
  },
  {
    id: 3,
    title: { zh: "薄肌登场", en: "Lean Muscle Debut" },
    hint: {
      zh: "薄肌孙哥已解锁，可在下方切换外观",
      en: "Lean Muscle Sun unlocked: switch looks below",
    },
  },
  {
    id: 4,
    title: { zh: "玻璃高塔", en: "Glass Tower" },
    hint: { zh: "玻璃最脆，先打塔身", en: "Glass breaks easiest: hit the tower body first" },
  },
  {
    id: 5,
    title: { zh: "火药桶", en: "Powder Keg" },
    hint: {
      zh: "打中桌上的黄色炸药箱，让它替你干活",
      en: "Hit the yellow TNT on the table and let it work",
    },
  },
  {
    id: 6,
    title: { zh: "双子楼", en: "Twin Towers" },
    hint: {
      zh: "两座楼都要拆，先挑细腿的下手",
      en: "Topple both towers: start with the skinny legs",
    },
  },
  {
    id: 7,
    title: { zh: "石头堡垒", en: "Stone Fortress" },
    hint: {
      zh: "石墙很硬，试试抬高角度从上面砸",
      en: "Stone is tough: lob high and smash from above",
    },
  },
  {
    id: 8,
    title: { zh: "三连站", en: "Triple Stop" },
    hint: { zh: "三座建筑一字排开，省着点用", en: "Three buildings in a row: save your shots" },
  },
  {
    id: 9,
    title: { zh: "林中堡垒", en: "Forest Fort" },
    hint: { zh: "先打玻璃柱，别硬碰石头", en: "Hit the glass pillars, don't fight the stone" },
  },
  {
    id: 10,
    title: { zh: "王冠之下", en: "Under the Crown" },
    hint: { zh: "先击碎顶端的玻璃王冠", en: "Shatter the glass crown on top first" },
  },
  {
    id: 11,
    title: { zh: "连环炸", en: "Chain Reaction" },
    hint: { zh: "炸药箱相连，引爆一个就连锁", en: "The TNT is linked: set one off to chain them" },
  },
  {
    id: 12,
    title: { zh: "爆破神殿", en: "Temple of Boom" },
    hint: { zh: "击穿玻璃顶，引爆中间炸药箱", en: "Break the glass roof, blow the TNT inside" },
  },
  {
    id: 13,
    title: { zh: "墓穴崩塌", en: "Tomb Collapse" },
    hint: { zh: "中间炸药箱炸塌上方高塔", en: "Blow the middle TNT to drop the tower above" },
  },
  {
    id: 14,
    title: { zh: "沙漠要塞", en: "Desert Stronghold" },
    hint: { zh: "绕开右侧金属，攻击中间目标", en: "Avoid the metal on the right, hit the middle" },
  },
  {
    id: 15,
    title: { zh: "铁门关", en: "Iron Gate Pass" },
    hint: {
      zh: "铁门太硬，从上方木楼打起",
      en: "The gate is too tough: start with the wooden top",
    },
  },
  {
    id: 16,
    title: { zh: "地牢深处", en: "Dungeon Depths" },
    hint: { zh: "底层炸药箱挨着两个目标", en: "The bottom TNT sits next to two targets" },
  },
  {
    id: 17,
    title: { zh: "铁甲堡垒", en: "Ironclad Fort" },
    hint: { zh: "底层三个目标紧挨炸药箱", en: "Three targets at the bottom hug the TNT" },
  },
  {
    id: 18,
    title: { zh: "王座之厅", en: "Throne Room" },
    hint: { zh: "最高的目标站在玻璃柱上", en: "The top target stands on glass pillars" },
  },
  {
    id: 19,
    title: { zh: "水晶宫", en: "Crystal Palace" },
    hint: { zh: "全是玻璃，力道不用太大", en: "All glass: no need for full power" },
  },
  {
    id: 20,
    title: { zh: "冰瀑连环", en: "Frozen Falls" },
    hint: { zh: "目标坐在玻璃上，先击碎玻璃", en: "Targets sit on glass: shatter it first" },
  },
  {
    id: 21,
    title: { zh: "方块阵", en: "Block Party" },
    hint: { zh: "目标坐在玻璃板上，别打石柱", en: "Targets sit on glass panes: skip the stone" },
  },
  {
    id: 22,
    title: { zh: "冰川堡垒", en: "Glacier Fort" },
    hint: { zh: "顶部是玻璃，先打掉再清底层", en: "Clear the glass top, then sweep the base" },
  },
  {
    id: 23,
    title: { zh: "极地末日", en: "Polar Doomsday" },
    hint: { zh: "从两侧木柱下手最省力", en: "Hit the wooden posts on both sides" },
  },
  {
    id: 24,
    title: { zh: "熔岩连环", en: "Lava Chain" },
    hint: { zh: "高处目标踩着单块玻璃", en: "The high target stands on a single glass pane" },
  },
  {
    id: 25,
    title: { zh: "火山口", en: "Crater" },
    hint: { zh: "炸药箱遍布，一炸连炸一片", en: "TNT everywhere: one blast sets off the rest" },
  },
  {
    id: 26,
    title: { zh: "林冠崩塌", en: "Canopy Collapse" },
    hint: { zh: "打碎玻璃层，上面的会塌", en: "Break the glass layer and the top falls" },
  },
  {
    id: 27,
    title: { zh: "长藤桥", en: "Long Vine Bridge" },
    hint: { zh: "木头比石头好打，石柱别硬碰", en: "Wood beats stone: leave the stone pillars" },
  },
  {
    id: 28,
    title: { zh: "石像守卫", en: "Stone Guardians" },
    hint: { zh: "炸药箱就在目标脚边", en: "The TNT is right at the targets' feet" },
  },
  {
    id: 29,
    title: { zh: "树顶围攻", en: "Treetop Siege" },
    hint: { zh: "目标都在顶端，瞄准玻璃层", en: "Targets are all on top: aim for the glass" },
  },
  {
    id: 30,
    title: { zh: "丛林要塞", en: "Jungle Stronghold" },
    hint: { zh: "石柱高大，瞄准较脆的木玻璃", en: "Tall stone pillars: aim for wood and glass" },
  },
];

export const TOTAL_LEVELS = LEVEL_CATALOG.length;

/** The game awards at most three stars per level. */
export const MAX_STARS_PER_LEVEL = 3;

export function isLevelId(value: unknown): value is number {
  return typeof value === "number" && LEVEL_CATALOG.some((level) => level.id === value);
}

export function getLevelEntry(id: number): LevelCatalogEntry {
  return LEVEL_CATALOG.find((level) => level.id === id) ?? LEVEL_CATALOG[0];
}
