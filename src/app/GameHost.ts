/**
 * GameHost: right column. Owns the game adapter, the progress store wiring and
 * every DOM control around the stage. Never touches the podcast panel.
 */

import { CHARACTERS, type CharacterDefinition, type CharacterId } from "../game/characters";
import { createGameAdapter } from "../game/gameAdapter";
import type { GameAdapter } from "../game/gameAdapterTypes";
import { getLevelEntry, LEVEL_CATALOG, TOTAL_LEVELS } from "../game/levelCatalog";
import {
  canEnterLevel,
  completeLevel,
  createProgressStore,
  enterLevel,
  isCharacterUnlocked,
  selectCharacter,
  setSfxEnabled,
  type ProgressStore,
} from "../storage/progress";
import { button, el, icon } from "./dom";

/** What the header sound button needs from the game side. */
export interface SfxControl {
  isSfxEnabled(): boolean;
  setSfxEnabled(enabled: boolean): void;
}

type LevelResult =
  | { kind: "completed"; levelId: number; score: number; stars: number; best: number }
  | { kind: "failed"; score: number };

interface CharacterCard {
  definition: CharacterDefinition;
  element: HTMLButtonElement;
  status: HTMLSpanElement;
  badge: HTMLSpanElement;
}

const MAX_STARS = 3;

function formatScore(score: number): string {
  return score.toLocaleString("zh-CN");
}

export class GameHost implements SfxControl {
  readonly element: HTMLElement;

  private readonly store: ProgressStore = createProgressStore();
  private adapter: GameAdapter | null = null;
  private readonly unsubscribers: Array<() => void> = [];

  private levelId: number;
  private score = 0;
  private shotsRemaining: number | null = null;
  private shotsAtStart: number | null = null;
  private started = false;
  private loadFailed = false;
  private paused = false;
  private autoPaused = false;
  private projectileReady = false;
  private result: LevelResult | null = null;

  private readonly title = el("h2", "toolbar__title");
  private readonly levelButtons = new Map<number, HTMLButtonElement>();
  private readonly pauseButton = button("btn", "暂停", "pause");
  private readonly restartButton = button("btn", "重开", "restart");
  private readonly mount = el("div", "stage__mount");
  private readonly overlay = el("div", "stage__overlay");
  private readonly hintText = el("span", "hintbar__text");
  private readonly scoreValue = el("span", "hintbar__score-value");
  private readonly shotsValue = el("strong", "hintbar__shots-value");
  private readonly cards: CharacterCard[] = [];
  private readonly busyNote = el("p", "characters__note");

  constructor() {
    this.levelId = this.store.get().highestUnlockedLevel;
    this.store.update((progress) => enterLevel(progress, this.levelId));
    this.element = this.build();
    this.renderAll();
  }

  /** Creates and mounts the game. Call once, after `element` is in the document. */
  start(): void {
    if (this.adapter || this.loadFailed) return;
    const progress = this.store.get();
    try {
      const adapter = createGameAdapter({
        initialLevel: this.levelId,
        initialCharacter: progress.selectedCharacter,
        muted: !progress.sfxEnabled,
      });
      this.adapter = adapter;
      this.subscribe(adapter);
      adapter.mount(this.mount);
    } catch (error) {
      console.error("[GameHost] failed to start the game", error);
      this.loadFailed = true;
      this.renderAll();
      return;
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  destroy(): void {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    for (const unsubscribe of this.unsubscribers.splice(0)) unsubscribe();
    this.adapter?.destroy();
    this.adapter = null;
  }

  isSfxEnabled(): boolean {
    return this.store.get().sfxEnabled;
  }

  setSfxEnabled(enabled: boolean): void {
    this.adapter?.setMuted(!enabled);
    this.store.update((progress) => setSfxEnabled(progress, enabled));
  }

  private subscribe(adapter: GameAdapter): void {
    this.unsubscribers.push(
      adapter.on("levelStarted", ({ levelId, shotsRemaining }) => {
        this.started = true;
        this.levelId = levelId;
        this.shotsRemaining = shotsRemaining;
        this.shotsAtStart = shotsRemaining;
        this.score = 0;
        this.result = null;
        this.paused = adapter.isPaused();
        this.projectileReady = adapter.isProjectileReady();
        this.store.update((progress) => enterLevel(progress, levelId));
        this.renderAll();
      }),
      adapter.on("shotCountChanged", ({ remaining }) => {
        this.shotsRemaining = remaining;
        this.renderHintBar();
        this.renderCharacters();
      }),
      adapter.on("scoreChanged", ({ score }) => {
        this.score = score;
        this.renderHintBar();
      }),
      adapter.on("levelCompleted", ({ levelId, score, stars }) => {
        const progress = this.store.update((current) =>
          completeLevel(current, levelId, score, stars)
        );
        const best = progress.levels[levelId]?.bestScore ?? score;
        this.score = score;
        this.result = { kind: "completed", levelId, score, stars, best };
        this.renderAll();
      }),
      adapter.on("levelFailed", ({ score }) => {
        this.score = score;
        this.result = { kind: "failed", score };
        this.renderAll();
      }),
      adapter.on("projectileReadyChanged", ({ ready }) => {
        this.projectileReady = ready;
        this.renderCharacters();
      }),
      adapter.on("pausedChanged", ({ paused }) => {
        this.paused = paused;
        if (!paused) this.autoPaused = false;
        this.renderToolbar();
        this.renderOverlay();
        this.renderCharacters();
      })
    );
  }

  private readonly handleVisibilityChange = (): void => {
    const adapter = this.adapter;
    if (!adapter || document.visibilityState !== "hidden") return;
    // Coming back to the page never resumes; the player presses 继续.
    if (adapter.isPaused()) return;
    this.autoPaused = true;
    adapter.pause();
    // pause() is ignored while the game is still loading.
    this.autoPaused = adapter.isPaused();
  };

  private togglePause(): void {
    const adapter = this.adapter;
    if (!adapter) return;
    if (adapter.isPaused()) {
      adapter.resume();
    } else {
      this.autoPaused = false;
      adapter.pause();
    }
  }

  private requestLevel(levelId: number): void {
    if (!canEnterLevel(this.store.get(), levelId)) return;
    this.adapter?.loadLevel(levelId);
  }

  private requestCharacter(id: CharacterId): void {
    const adapter = this.adapter;
    if (!adapter || !isCharacterUnlocked(this.store.get(), id)) return;
    if (!adapter.selectCharacter(id)) return;
    this.store.update((progress) => selectCharacter(progress, id));
    this.renderCharacters();
  }

  // ---------------------------------------------------------------- building

  private build(): HTMLElement {
    const root = el("div", "game");

    const panel = el("section", "panel game__panel");
    panel.setAttribute("aria-label", "弹弓游戏");
    panel.append(this.buildToolbar(), this.buildStage(), this.buildHintBar());

    root.append(panel, this.buildCharacters());
    return root;
  }

  private buildToolbar(): HTMLElement {
    const toolbar = el("div", "toolbar");

    const levels = el("ol", "levels");
    levels.setAttribute("aria-label", "选择关卡");
    for (const level of LEVEL_CATALOG) {
      const levelButton = el("button", "levels__btn");
      levelButton.type = "button";
      levelButton.append(el("span", "levels__number", String(level.id)));
      const lock = el("span", "levels__lock");
      lock.append(icon("lock"));
      levelButton.append(lock);
      levelButton.addEventListener("click", () => this.requestLevel(level.id));
      this.levelButtons.set(level.id, levelButton);
      const item = el("li", "levels__item");
      item.append(levelButton);
      levels.append(item);
    }

    const actions = el("div", "toolbar__actions");
    this.pauseButton.element.addEventListener("click", () => this.togglePause());
    this.restartButton.element.addEventListener("click", () => this.adapter?.restartLevel());
    actions.append(this.pauseButton.element, this.restartButton.element);

    toolbar.append(this.title, levels, actions);
    return toolbar;
  }

  private buildStage(): HTMLElement {
    // The mount element belongs to Phaser alone; overlays live in a sibling layer.
    const stage = el("div", "stage");
    this.overlay.setAttribute("role", "status");
    this.overlay.setAttribute("aria-live", "polite");
    stage.append(this.mount, this.overlay);
    return stage;
  }

  private buildHintBar(): HTMLElement {
    const bar = el("div", "hintbar");

    const hint = el("p", "hintbar__hint");
    hint.append(icon("bulb", "icon hintbar__bulb"), this.hintText);

    const score = el("p", "hintbar__score");
    score.append(el("span", undefined, "得分 "), this.scoreValue);

    const shots = el("p", "hintbar__shots");
    shots.append(el("span", undefined, "剩余"), this.shotsValue, el("span", undefined, "发"));

    bar.append(hint, score, shots);
    return bar;
  }

  private buildCharacters(): HTMLElement {
    const panel = el("section", "panel characters");
    panel.setAttribute("aria-labelledby", "characters-heading");
    const heading = el("h2", "characters__heading", "角色");
    heading.id = "characters-heading";

    const list = el("div", "characters__cards");
    for (const definition of CHARACTERS) {
      const card = el("button", "character");
      card.type = "button";
      const image = el("img", "character__image");
      image.src = definition.assetPath;
      image.alt = "";
      image.width = 256;
      image.height = 256;
      image.draggable = false;
      const text = el("span", "character__text");
      const status = el("span", "character__status");
      text.append(el("span", "character__name", definition.name), status);
      const badge = el("span", "character__badge");
      card.append(image, text, badge);
      card.addEventListener("click", () => this.requestCharacter(definition.id));
      this.cards.push({ definition, element: card, status, badge });
      list.append(card);
    }

    const notes = el("div", "characters__notes");
    notes.append(this.busyNote);
    if (!this.store.persistent) {
      notes.append(
        el("p", "characters__note characters__note--quiet", "当前浏览器无法保存进度，刷新后会重置")
      );
    }

    panel.append(heading, list, notes);
    return panel;
  }

  // --------------------------------------------------------------- rendering

  private renderAll(): void {
    this.renderToolbar();
    this.renderHintBar();
    this.renderOverlay();
    this.renderCharacters();
  }

  private renderToolbar(): void {
    const progress = this.store.get();
    const entry = getLevelEntry(this.levelId);
    this.title.textContent = `第 ${entry.id} 关 · ${entry.title}`;

    for (const level of LEVEL_CATALOG) {
      const levelButton = this.levelButtons.get(level.id);
      if (!levelButton) continue;
      const locked = !canEnterLevel(progress, level.id);
      const current = level.id === this.levelId;
      levelButton.disabled = locked || !this.started;
      levelButton.classList.toggle("is-locked", locked);
      levelButton.setAttribute("aria-disabled", String(locked));
      levelButton.setAttribute(
        "aria-label",
        `第 ${level.id} 关 · ${level.title}${locked ? "（未解锁）" : ""}`
      );
      levelButton.title = locked ? "通关上一关后解锁" : `第 ${level.id} 关 · ${level.title}`;
      if (current) levelButton.setAttribute("aria-current", "true");
      else levelButton.removeAttribute("aria-current");
    }

    this.pauseButton.label.textContent = this.paused ? "继续" : "暂停";
    this.pauseButton.setIcon(this.paused ? "play" : "pause");
    this.pauseButton.element.disabled = !this.started;
    this.restartButton.element.disabled = !this.started;
  }

  private renderHintBar(): void {
    const hint = getLevelEntry(this.levelId).hint;
    this.hintText.textContent = hint;
    this.hintText.title = hint;
    this.scoreValue.textContent = formatScore(this.score);
    this.shotsValue.textContent = this.shotsRemaining === null ? "-" : String(this.shotsRemaining);
  }

  private renderCharacters(): void {
    const progress = this.store.get();
    let anyWaiting = false;
    for (const card of this.cards) {
      const { definition, element } = card;
      const unlocked = isCharacterUnlocked(progress, definition.id);
      const selected = unlocked && progress.selectedCharacter === definition.id;
      const waiting = unlocked && !this.projectileReady;
      anyWaiting ||= waiting;

      element.disabled = !unlocked || waiting;
      element.classList.toggle("is-locked", !unlocked);
      element.classList.toggle("is-selected", selected);
      element.classList.toggle("is-waiting", waiting);
      element.setAttribute("aria-pressed", String(selected));

      card.status.textContent = unlocked
        ? selected
          ? "使用中"
          : "可切换"
        : `第 ${definition.unlockLevel} 关解锁`;
      card.badge.replaceChildren();
      if (!unlocked) card.badge.append(icon("lock"));
      else if (selected) card.badge.append(icon("check"));
      card.badge.hidden = unlocked && !selected;
    }
    // Before the first shot the walnut is still being loaded into the slingshot.
    const fired = (this.shotsRemaining ?? 0) < (this.shotsAtStart ?? 0);
    this.busyNote.textContent = fired ? "发射中，落地后可切换" : "坚果就位后可切换";
    // The note explains the lock-out during play only, not on loading, pause or result screens.
    this.busyNote.hidden = !(anyWaiting && this.started && !this.paused && !this.result);
  }

  private renderOverlay(): void {
    const card = this.buildOverlayCard();
    this.overlay.classList.toggle("is-active", card !== null);
    if (card) this.overlay.replaceChildren(card);
    else this.overlay.replaceChildren();
  }

  private buildOverlayCard(): HTMLElement | null {
    if (this.loadFailed) {
      return this.overlayCard("游戏加载失败", "请刷新页面重试。播客播放不受影响。");
    }
    if (this.paused) {
      const card = this.overlayCard(
        "已暂停",
        this.autoPaused ? "页面切到后台，游戏已自动暂停" : undefined
      );
      card.append(this.overlayActions(["继续", () => this.adapter?.resume()]));
      return card;
    }
    if (!this.started) {
      const card = this.overlayCard("游戏加载中…");
      card.classList.add("overlay-card--loading");
      return card;
    }

    const result = this.result;
    if (!result) return null;

    if (result.kind === "failed") {
      const card = this.overlayCard("差一点！");
      card.append(this.overlayScores([["得分", result.score]]));
      card.append(this.overlayActions(["重开", () => this.adapter?.restartLevel()]));
      return card;
    }

    const nextLevel = result.levelId + 1;
    const hasNext = result.levelId < TOTAL_LEVELS;
    const card = this.overlayCard("过关！", hasNext ? undefined : "三关全部通关");

    const stars = el("p", "overlay-card__stars");
    const earned = Math.max(0, Math.min(MAX_STARS, Math.round(result.stars)));
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${earned} 星（满分 ${MAX_STARS} 星）`);
    for (let index = 0; index < MAX_STARS; index += 1) {
      stars.append(icon("star", index < earned ? "icon star is-earned" : "icon star"));
    }
    card.querySelector(".overlay-card__title")?.after(stars);

    card.append(
      this.overlayScores([
        ["得分", result.score],
        ["最高", result.best],
      ])
    );
    const replay: [string, () => void] = ["再玩一次", () => this.adapter?.restartLevel()];
    card.append(
      hasNext
        ? this.overlayActions(["下一关", () => this.adapter?.loadLevel(nextLevel)], replay)
        : this.overlayActions(replay)
    );
    return card;
  }

  private overlayCard(title: string, detail?: string): HTMLElement {
    const card = el("div", "overlay-card");
    card.append(el("p", "overlay-card__title", title));
    if (detail) card.append(el("p", "overlay-card__detail", detail));
    return card;
  }

  private overlayScores(entries: Array<[string, number]>): HTMLElement {
    const list = el("p", "overlay-card__scores");
    for (const [label, value] of entries) {
      const entry = el("span", "overlay-card__score");
      entry.append(el("span", undefined, `${label} `), el("strong", undefined, formatScore(value)));
      list.append(entry);
    }
    return list;
  }

  /** The first action is the primary one. */
  private overlayActions(...actions: Array<[string, () => void]>): HTMLElement {
    const row = el("div", "overlay-card__actions");
    actions.forEach(([label, onClick], index) => {
      const action = button(index === 0 ? "btn btn--primary" : "btn", label);
      action.element.addEventListener("click", onClick);
      row.append(action.element);
    });
    return row;
  }
}
