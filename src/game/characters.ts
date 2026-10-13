/**
 * CharacterRegistry: playable projectile appearances.
 *
 * Appearance only. Every character uses the upstream RED projectile physics
 * (circular body, same radius/density/launch parameters); the PNG never
 * defines the collision shape.
 */

export type CharacterId = "standard" | "muscle";

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  /** Phaser texture key, loaded in BootScene. */
  textureKey: string;
  /** Path relative to the Vite public dir (game-assets/). */
  assetPath: string;
  /** Unlocked when the player enters this level. Level 1 = always available. */
  unlockLevel: number;
}

export const CHARACTERS: readonly CharacterDefinition[] = [
  {
    id: "standard",
    name: "坚果孙哥",
    textureKey: "character-standard",
    assetPath: "characters/nut-standard.png",
    unlockLevel: 1,
  },
  {
    id: "muscle",
    name: "薄肌孙哥",
    textureKey: "character-muscle",
    assetPath: "characters/nut-muscle.png",
    unlockLevel: 3,
  },
];

export const DEFAULT_CHARACTER_ID: CharacterId = "standard";

export function isCharacterId(value: unknown): value is CharacterId {
  return CHARACTERS.some((character) => character.id === value);
}

export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}

/** All character sprites share this square canvas (scripts/prepare-characters.mjs). */
export const CHARACTER_TEXTURE_SIZE = 256;

/**
 * The sprite canvas is drawn slightly larger than the collision circle so the
 * (non-circular) walnut silhouette straddles the circle instead of sitting
 * inside it.
 */
const CHARACTER_VISUAL_SCALE = 1.35;

/** Sprite scale that maps the shared canvas onto a collision circle of `radius`. */
export function characterSpriteScale(radius: number): number {
  return (radius * 2 * CHARACTER_VISUAL_SCALE) / CHARACTER_TEXTURE_SIZE;
}

let activeCharacterId: CharacterId = DEFAULT_CHARACTER_ID;

/** Appearance used for the next projectile (and waiting ones). */
export function getActiveCharacter(): CharacterDefinition {
  return getCharacter(activeCharacterId);
}

export function setActiveCharacter(id: CharacterId): void {
  activeCharacterId = id;
}
