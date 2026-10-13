import type { LevelData } from "../data/levels";
import type { IProgressManager, LevelProgress } from "../systems/progress/IProgressManager";

/**
 * Replaces the upstream localStorage ProgressManager. The game only needs star
 * calculation; persistence belongs to the host page (src/storage/progress.ts),
 * which reacts to the adapter's levelCompleted event.
 */
export class HostProgressManager implements IProgressManager {
  saveProgress(): void {}

  loadProgress(): LevelProgress | null {
    return null;
  }

  getMaxUnlockedLevel(): number {
    return 1;
  }

  isLevelUnlocked(): boolean {
    return true;
  }

  calculateStars(score: number, thresholds: LevelData["starThresholds"]): number {
    if (score >= thresholds.threeStars) return 3;
    if (score >= thresholds.twoStars) return 2;
    return 1;
  }

  clearAllProgress(): void {}
}
