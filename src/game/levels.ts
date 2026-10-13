/**
 * LevelRegistry (geometry half): the only levels the game can load.
 *
 * Built with the upstream grid helpers. Every shot is the plain upstream RED
 * projectile, so no level depends on a special ability.
 */
import { BirdType } from "../types/BirdType";
import { PigSize } from "../constants";
import { BlockMaterial } from "../constants/Materials";
import {
  SLINGSHOT,
  convertGridLevelToLevelData,
  createGridLevel,
  type GridLevelBlueprint,
  type LevelData,
} from "../data/levels";
import { getLevelEntry } from "./levelCatalog";

const { GLASS, WOOD, STONE, EXPLOSIVE } = BlockMaterial;

function shots(count: number): { type: BirdType }[] {
  return Array.from({ length: count }, () => ({ type: BirdType.RED }));
}

function describe(id: number): Pick<GridLevelBlueprint, "levelId" | "name" | "teachingFocus"> {
  const entry = getLevelEntry(id);
  return { levelId: entry.id, name: entry.title, teachingFocus: entry.hint };
}

const BLUEPRINTS: GridLevelBlueprint[] = [
  // Level 1: upstream "First Blood" glass hut, with spare shots so it cannot
  // really be failed while learning to drag and release.
  {
    ...describe(1),
    description: "A single target in a glass hut.",
    theme: "forest",
    birds: shots(3),
    blocks: [
      { col: 3, row: 0, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 5, row: 0, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 3, row: 2, gridW: 3, gridH: 1, material: GLASS, shape: "rectangle" },
      { col: 4, row: 3, gridW: 1, gridH: 1, material: GLASS, shape: "triangle", rotation: 0 },
    ],
    pigs: [{ col: 4, row: 0, size: PigSize.SMALL }],
    slingshot: SLINGSHOT,
    minBirdsToClear: 1,
  },

  // Level 2: a loaded deck on two thin wooden legs, one target under it and
  // one riding on top. Knocking out a leg drops the deck and its stone load
  // onto the lower target and throws the upper one off.
  {
    ...describe(2),
    description: "A heavy deck on thin legs. Take out the support.",
    theme: "forest",
    birds: shots(3),
    blocks: [
      { col: 2, row: 0, gridW: 1, gridH: 3, material: WOOD, shape: "rectangle" },
      { col: 6, row: 0, gridW: 1, gridH: 3, material: WOOD, shape: "rectangle" },
      { col: 2, row: 3, gridW: 5, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 2, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 3, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
      { col: 5, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
      { col: 6, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 3, row: 5, gridW: 3, gridH: 1, material: GLASS, shape: "rectangle" },
    ],
    pigs: [
      { col: 4, row: 0, size: PigSize.SMALL },
      { col: 4, row: 4, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 1,
  },

  // Level 3: upstream "Timber!" log cabin, replayed with plain shots only.
  {
    ...describe(3),
    description: "A log cabin with three targets.",
    theme: "forest",
    birds: shots(3),
    blocks: [
      { col: 1, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 5, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 0, row: 2, gridW: 7, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 1, row: 3, gridW: 5, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 0, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 6, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 0, row: 3, gridW: 1, gridH: 1, material: WOOD, shape: "triangle", rotation: 0 },
      { col: 6, row: 3, gridW: 1, gridH: 1, material: WOOD, shape: "triangle", rotation: 0 },
      { col: 1, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
    ],
    pigs: [
      { col: 2, row: 0, size: PigSize.SMALL },
      { col: 4, row: 0, size: PigSize.SMALL },
      { col: 3, row: 4, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 2,
  },

  // Level 4: upstream "Glass Snap" two-storey glass tower, plain shots only.
  {
    ...describe(4),
    description: "A two-storey glass tower with a target on each floor.",
    theme: "forest",
    birds: shots(3),
    blocks: [
      { col: 2, row: 0, gridW: 1, gridH: 4, material: GLASS, shape: "rectangle" },
      { col: 4, row: 0, gridW: 1, gridH: 4, material: GLASS, shape: "rectangle" },
      { col: 2, row: 4, gridW: 3, gridH: 1, material: GLASS, shape: "rectangle" },
      { col: 2, row: 5, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 4, row: 5, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 2, row: 7, gridW: 3, gridH: 1, material: GLASS, shape: "rectangle" },
      { col: 3, row: 8, gridW: 1, gridH: 1, material: GLASS, shape: "triangle", rotation: 0 },
      { col: 2, row: 8, gridW: 1, gridH: 1, material: GLASS, shape: "circle" },
      { col: 4, row: 8, gridW: 1, gridH: 1, material: GLASS, shape: "circle" },
    ],
    pigs: [
      { col: 3, row: 0, size: PigSize.SMALL },
      { col: 3, row: 5, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 1,
  },

  // Level 5: a wooden table with a TNT crate on top and two targets under it.
  // A low stone wall blocks flat shots at the legs; the crate is the way in.
  {
    ...describe(5),
    description: "A TNT crate on a table, two targets underneath.",
    theme: "desert",
    birds: shots(4),
    blocks: [
      { col: 0, row: 0, gridW: 1, gridH: 2, material: STONE, shape: "rectangle" },
      { col: 2, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 6, row: 0, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 2, row: 2, gridW: 5, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 3, row: 3, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 4, row: 3, gridW: 1, gridH: 1, material: EXPLOSIVE, shape: "square" },
      { col: 5, row: 3, gridW: 1, gridH: 1, material: STONE, shape: "square" },
    ],
    pigs: [
      { col: 3, row: 0, size: PigSize.SMALL },
      { col: 5, row: 0, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 1,
  },

  // Level 6: two towers, glass-legged in front and a taller stone one behind.
  {
    ...describe(6),
    description: "Two towers, three targets.",
    theme: "desert",
    birds: shots(4),
    blocks: [
      { col: 0, row: 0, gridW: 1, gridH: 3, material: GLASS, shape: "rectangle" },
      { col: 2, row: 0, gridW: 1, gridH: 3, material: GLASS, shape: "rectangle" },
      { col: 0, row: 3, gridW: 3, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 0, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
      // Rear tower: stone legs that debris and plain shots cannot knock out,
      // so its target has to be hit directly.
      { col: 9, row: 0, gridW: 1, gridH: 4, material: STONE, shape: "rectangle" },
      { col: 11, row: 0, gridW: 1, gridH: 4, material: STONE, shape: "rectangle" },
      { col: 9, row: 4, gridW: 3, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 11, row: 5, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
    ],
    pigs: [
      { col: 1, row: 0, size: PigSize.SMALL },
      { col: 1, row: 4, size: PigSize.SMALL },
      { col: 10, row: 5, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 2,
  },

  // Level 7: stone walls that plain shots barely scratch, under a wooden roof
  // carrying stone weights. The roof is the weak point.
  {
    ...describe(7),
    description: "Stone walls, wooden roof.",
    theme: "castle",
    birds: shots(4),
    blocks: [
      { col: 1, row: 0, gridW: 1, gridH: 3, material: STONE, shape: "rectangle" },
      { col: 5, row: 0, gridW: 1, gridH: 3, material: STONE, shape: "rectangle" },
      { col: 3, row: 0, gridW: 1, gridH: 3, material: GLASS, shape: "rectangle" },
      { col: 1, row: 3, gridW: 5, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 2, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 4, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 3, row: 4, gridW: 1, gridH: 1, material: WOOD, shape: "triangle", rotation: 0 },
    ],
    pigs: [
      { col: 2, row: 0, size: PigSize.SMALL },
      { col: 4, row: 0, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 2,
  },

  // Level 8: a glass hut, a loaded deck and a TNT-footed tower in a row.
  {
    ...describe(8),
    description: "Hut, deck and tower: four targets.",
    theme: "castle",
    birds: shots(5),
    blocks: [
      // Glass hut
      { col: 0, row: 0, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 2, row: 0, gridW: 1, gridH: 2, material: GLASS, shape: "rectangle" },
      { col: 0, row: 2, gridW: 3, gridH: 1, material: GLASS, shape: "rectangle" },
      // Loaded deck
      { col: 4, row: 0, gridW: 1, gridH: 3, material: WOOD, shape: "rectangle" },
      { col: 8, row: 0, gridW: 1, gridH: 3, material: WOOD, shape: "rectangle" },
      { col: 4, row: 3, gridW: 5, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 5, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
      { col: 7, row: 4, gridW: 1, gridH: 1, material: STONE, shape: "circle" },
      // Tower on a TNT crate
      { col: 10, row: 0, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 11, row: 0, gridW: 1, gridH: 1, material: EXPLOSIVE, shape: "square" },
      { col: 12, row: 0, gridW: 1, gridH: 1, material: STONE, shape: "square" },
      { col: 10, row: 1, gridW: 3, gridH: 1, material: WOOD, shape: "rectangle" },
      { col: 10, row: 2, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 12, row: 2, gridW: 1, gridH: 2, material: WOOD, shape: "rectangle" },
      { col: 10, row: 4, gridW: 3, gridH: 1, material: WOOD, shape: "rectangle" },
    ],
    pigs: [
      { col: 1, row: 0, size: PigSize.SMALL },
      { col: 6, row: 0, size: PigSize.SMALL },
      { col: 6, row: 4, size: PigSize.SMALL },
      { col: 11, row: 2, size: PigSize.SMALL },
    ],
    slingshot: SLINGSHOT,
    minBirdsToClear: 3,
  },
];

const MVP_LEVELS: LevelData[] = BLUEPRINTS.map((blueprint) =>
  convertGridLevelToLevelData(createGridLevel(blueprint))
);

export function getMvpLevelById(id: number): LevelData | undefined {
  return MVP_LEVELS.find((level) => level.levelId === id);
}
