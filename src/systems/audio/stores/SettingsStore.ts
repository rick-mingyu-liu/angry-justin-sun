import type { ISettingsProvider, AudioSettings } from "../../../interfaces/audio";
import { SETTINGS_DEBOUNCE_MS } from "../config/AudioConfig";

/** Effects sit well under the podcast; they start muted and stay quiet when enabled. */
const GAME_SFX_VOLUME = 0.25;

export class SettingsStore implements ISettingsProvider {
  private settings: AudioSettings;
  private listeners: Set<(settings: AudioSettings) => void> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingNotification = false;

  constructor() {
    this.settings = this.loadFromStorage();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  setMusicEnabled(enabled: boolean): void {
    if (this.settings.musicEnabled === enabled) return;
    this.settings.musicEnabled = enabled;
    this.saveToStorage();
    this.scheduleNotification();
  }

  setSfxEnabled(enabled: boolean): void {
    if (this.settings.sfxEnabled === enabled) return;
    this.settings.sfxEnabled = enabled;
    this.saveToStorage();
    this.scheduleNotification();
  }

  setMusicVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.settings.musicVolume === clamped) return;
    this.settings.musicVolume = clamped;
    this.saveToStorage();
    this.scheduleNotification();
  }

  setSfxVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.settings.sfxVolume === clamped) return;
    this.settings.sfxVolume = clamped;
    this.saveToStorage();
    this.scheduleNotification();
  }

  onChange(callback: (settings: AudioSettings) => void): void {
    this.listeners.add(callback);
  }

  offChange(callback: (settings: AudioSettings) => void): void {
    this.listeners.delete(callback);
  }

  private scheduleNotification(): void {
    this.pendingNotification = true;

    if (this.debounceTimer) return;

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      if (this.pendingNotification) {
        this.notifyListeners();
        this.pendingNotification = false;
      }
    }, SETTINGS_DEBOUNCE_MS);
  }

  private notifyListeners(): void {
    const snapshot = this.getSettings();
    this.listeners.forEach((cb) => {
      try {
        cb(snapshot);
      } catch (e) {
        console.error("[SettingsStore] Error in listener callback", e);
      }
    });
  }

  // Podcast Slingshot: the host page owns the sound preference
  // (src/storage/progress.ts) and pushes it in through the game adapter, so
  // this store no longer reads or writes localStorage itself.
  private loadFromStorage(): AudioSettings {
    return this.getDefaultSettings();
  }

  private saveToStorage(): void {}

  private getDefaultSettings(): AudioSettings {
    return {
      musicEnabled: false,
      sfxEnabled: false,
      musicVolume: 0,
      sfxVolume: GAME_SFX_VOLUME,
    };
  }
}
