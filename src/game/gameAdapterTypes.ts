import type { CharacterId } from "./characters";

/** Events the game publishes to the host page. */
export interface GameAdapterEvents {
  /** A level finished building (initial load, restart, or level change). */
  levelStarted: { levelId: number; shotsRemaining: number };
  shotCountChanged: { remaining: number };
  scoreChanged: { score: number };
  levelCompleted: { levelId: number; score: number; stars: number };
  levelFailed: { levelId: number; score: number };
  /** True only while a projectile sits in the slingshot and nothing is in flight. */
  projectileReadyChanged: { ready: boolean };
  pausedChanged: { paused: boolean };
}

export type GameAdapterEvent = keyof GameAdapterEvents;

export interface GameAdapterOptions {
  initialLevel: number;
  initialCharacter: CharacterId;
  muted: boolean;
}

export interface GameAdapter {
  /** Creates the Phaser game inside `container`. Call once. */
  mount(container: HTMLElement): void;
  pause(): void;
  resume(): void;
  restartLevel(): void;
  loadLevel(levelId: number): void;
  /**
   * Changes the appearance of the next projectile. Returns false (and changes
   * nothing) unless a projectile is ready and no shot is in flight.
   */
  selectCharacter(id: CharacterId): boolean;
  setMuted(muted: boolean): void;
  destroy(): void;
  /** Subscribes to an event; returns an unsubscribe function. */
  on<K extends GameAdapterEvent>(
    event: K,
    handler: (payload: GameAdapterEvents[K]) => void
  ): () => void;
  isPaused(): boolean;
  isProjectileReady(): boolean;
  getLevelId(): number;
}
