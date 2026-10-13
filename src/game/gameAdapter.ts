import type Phaser from "phaser";
import { gameEvents, SubscriptionGroup } from "../events/EventBus";
import { getServiceContainer, ServiceTokens } from "../config/bootstrap";
import type { IAudioSystem } from "../interfaces/audio";
import type { GameScene } from "../scenes/GameScene";
import { setActiveCharacter, type CharacterId } from "./characters";
import { createGame } from "./createGame";
import { HOST_LEVEL_REGISTRY_KEY } from "./hostKeys";
import { isLevelId } from "./levelCatalog";
import type {
  GameAdapter,
  GameAdapterEvent,
  GameAdapterEvents,
  GameAdapterOptions,
} from "./gameAdapterTypes";

const GAME_SCENE = "GameScene";
const PARALLAX_SCENE = "ParallaxScene";

type Handler<K extends GameAdapterEvent> = (payload: GameAdapterEvents[K]) => void;

/**
 * GameAdapter: the only place the host page talks to the Phaser game.
 * It never touches the podcast player.
 */
export function createGameAdapter(options: GameAdapterOptions): GameAdapter {
  let game: Phaser.Game | null = null;
  let resizeObserver: ResizeObserver | null = null;
  const subscriptions = new SubscriptionGroup();
  const handlers = new Map<GameAdapterEvent, Set<Handler<GameAdapterEvent>>>();

  let levelId = isLevelId(options.initialLevel) ? options.initialLevel : 1;
  let muted = options.muted;
  let paused = false;
  let levelRunning = false;
  let projectileReady = false;
  let pauseWhenReady = false;

  setActiveCharacter(options.initialCharacter);

  function emit<K extends GameAdapterEvent>(event: K, payload: GameAdapterEvents[K]): void {
    handlers.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[GameAdapter] ${event} handler failed`, error);
      }
    });
  }

  function gameScene(): GameScene | null {
    if (!game || !levelRunning) return null;
    return game.scene.getScene(GAME_SCENE) as GameScene | null;
  }

  function setProjectileReady(ready: boolean): void {
    if (projectileReady === ready) return;
    projectileReady = ready;
    emit("projectileReadyChanged", { ready });
  }

  function setPaused(value: boolean): void {
    if (paused === value) return;
    paused = value;
    emit("pausedChanged", { paused });
  }

  function applyMuted(): void {
    const container = getServiceContainer();
    if (!container.has(ServiceTokens.AUDIO_SYSTEM)) return;
    const audio = container.resolve<IAudioSystem>(ServiceTokens.AUDIO_SYSTEM);
    audio.settings.setSfxEnabled(!muted);
    // Jingles only check the setting when they start.
    if (muted) audio.jingles.stop();
  }

  function startLevel(id: number): void {
    if (!game) return;
    levelId = id;
    game.registry.set(HOST_LEVEL_REGISTRY_KEY, id);

    // Still loading assets: BootScene reads the registry when it finishes.
    if (!levelRunning) return;

    setProjectileReady(false);
    game.scene.stop(PARALLAX_SCENE);
    game.scene.stop(GAME_SCENE);
    game.scene.start(GAME_SCENE, { level: id });
    setPaused(false);
  }

  function bindGameEvents(): void {
    subscriptions.add(
      gameEvents.subscribe("host:level-started", ({ level, shotsRemaining }) => {
        levelRunning = true;
        levelId = level;
        applyMuted();
        setProjectileReady(false);
        setPaused(false);
        emit("levelStarted", { levelId: level, shotsRemaining });
        emit("scoreChanged", { score: 0 });
        // A pause requested while assets were loading (tab hidden during boot).
        if (pauseWhenReady) {
          pauseWhenReady = false;
          pause();
        }
      })
    );
    subscriptions.add(
      gameEvents.subscribe("host:shots-changed", ({ remaining }) => {
        emit("shotCountChanged", { remaining });
      })
    );
    subscriptions.add(
      gameEvents.subscribe("host:projectile-ready", ({ ready }) => setProjectileReady(ready))
    );
    subscriptions.add(
      gameEvents.subscribe("score-changed", ({ score }) => emit("scoreChanged", { score }))
    );
    subscriptions.add(
      gameEvents.subscribe("ui-results", ({ level, score, stars, won }) => {
        setProjectileReady(false);
        emit("scoreChanged", { score });
        if (won) {
          emit("levelCompleted", { levelId: level, score, stars });
        } else {
          emit("levelFailed", { levelId: level, score });
        }
      })
    );
  }

  function pause(): void {
    if (!game || paused) return;
    if (!levelRunning) {
      pauseWhenReady = true;
      return;
    }
    gameScene()?.cancelAim();
    game.scene.pause(GAME_SCENE);
    game.scene.pause(PARALLAX_SCENE);
    setPaused(true);
  }

  function resume(): void {
    pauseWhenReady = false;
    if (!game || !paused) return;
    game.scene.resume(PARALLAX_SCENE);
    game.scene.resume(GAME_SCENE);
    setPaused(false);
  }

  return {
    mount(container: HTMLElement): void {
      if (game) return;
      game = createGame(container);
      game.registry.set(HOST_LEVEL_REGISTRY_KEY, levelId);
      bindGameEvents();

      // Phaser only re-fits on window resize; the host layout can change the
      // stage size on its own (column reflow, collapsing panels).
      resizeObserver = new ResizeObserver(() => game?.scale.refresh());
      resizeObserver.observe(container);
    },

    pause,
    resume,

    restartLevel(): void {
      startLevel(levelId);
    },

    loadLevel(id: number): void {
      if (isLevelId(id)) startLevel(id);
    },

    selectCharacter(id: CharacterId): boolean {
      const scene = gameScene();
      if (!scene || !projectileReady || !scene.isProjectileReady()) return false;
      setActiveCharacter(id);
      scene.applyActiveCharacter();
      return true;
    },

    setMuted(value: boolean): void {
      muted = value;
      applyMuted();
    },

    destroy(): void {
      subscriptions.disposeAll();
      handlers.clear();
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (game) {
        // game.destroy() does not emit scene "shutdown", which is where
        // GameScene releases its event-bus subscriptions.
        game.scene.stop(PARALLAX_SCENE);
        game.scene.stop(GAME_SCENE);
        game.destroy(true);
      }
      game = null;
      levelRunning = false;
      paused = false;
      projectileReady = false;
      pauseWhenReady = false;
    },

    on<K extends GameAdapterEvent>(event: K, handler: Handler<K>): () => void {
      const set = handlers.get(event) ?? new Set();
      handlers.set(event, set);
      set.add(handler as Handler<GameAdapterEvent>);
      return () => set.delete(handler as Handler<GameAdapterEvent>);
    },

    isPaused: () => paused,
    isProjectileReady: () => projectileReady,
    getLevelId: () => levelId,
  };
}
