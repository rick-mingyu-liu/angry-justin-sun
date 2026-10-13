/**
 * LevelRegistry (geometry half): the only levels the MVP can load.
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

const { GLASS, WOOD, STONE } = BlockMaterial;

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
];

const MVP_LEVELS: LevelData[] = BLUEPRINTS.map((blueprint) =>
  convertGridLevelToLevelData(createGridLevel(blueprint))
);

export function getMvpLevelById(id: number): LevelData | undefined {
  return MVP_LEVELS.find((level) => level.levelId === id);
}
