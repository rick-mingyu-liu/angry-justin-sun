import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { ParallaxScene } from "../scenes/ParallaxScene";
import { GameScene } from "../scenes/GameScene";
import { bootstrapServices, getServiceContainer, ServiceTokens } from "../config/bootstrap";
import { WORLD_CONFIG } from "../config/PhysicsConfig";
import { MobileManager } from "../systems/mobile";
import type { IMobileSettingsProvider } from "../interfaces/IMobileSettings";

let servicesBootstrapped = false;

/**
 * Derived from the upstream src/main.ts. Differences: the game mounts into a
 * host element instead of taking over the page, only the scenes the MVP needs
 * are registered (no menu, level select, in-canvas UI or transition scenes),
 * and the fullscreen / orientation-lock behaviour is gone.
 */
export function createGame(parent: HTMLElement): Phaser.Game {
  if (!servicesBootstrapped) {
    bootstrapServices();
    servicesBootstrapped = true;
  }

  const container = getServiceContainer();
  const mobileSettings = container.resolve<IMobileSettingsProvider>(ServiceTokens.MOBILE_SETTINGS);
  const mobileManager = MobileManager.getInstance();
  mobileManager.setSettingsProvider(mobileSettings);
  const isMobile = mobileManager.isMobile();

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent,
    backgroundColor: "#87CEEB",
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    input: {
      activePointers: 3,
      // Let the wheel scroll the page when the cursor is over the stage.
      mouse: { preventDefaultWheel: false },
    },
    render: {
      antialias: true,
      antialiasGL: !isMobile,
      powerPreference: isMobile ? "default" : "high-performance",
      roundPixels: true,
    },
    physics: {
      default: "matter",
      matter: {
        gravity: WORLD_CONFIG.gravity,
        debug: false,
        enableSleeping: WORLD_CONFIG.enableSleeping,
        positionIterations: WORLD_CONFIG.positionIterations,
        velocityIterations: WORLD_CONFIG.velocityIterations,
        constraintIterations: WORLD_CONFIG.constraintIterations,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      autoRound: true,
      expandParent: false,
      width: 1920,
      height: 1080,
    },
    scene: [BootScene, ParallaxScene, GameScene],
  };

  return new Phaser.Game(config);
}
