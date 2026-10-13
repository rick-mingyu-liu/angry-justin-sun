/**
 * AppShell: builds the page once. Header, then the podcast panel next to the
 * game host. Both children are created exactly once and never recreated.
 */

import { getCharacter } from "../game/characters";
import { PodcastPanel } from "../podcast/PodcastPanel";
import { button, el, icon } from "./dom";
import { GameHost, type SfxControl } from "./GameHost";

const HELP_STEPS: readonly string[] = [
  "节目需要在播放器里手动点击播放，游戏不会自动播放视频。",
  "按住弹弓上的坚果向后拖动瞄准，松开即可发射。",
  "打掉所有目标即可过关；发数用完还没打完，就重开再来。",
  "坚果落地、下一发就位后，才能在下方切换角色外观。",
  "切换章节或切片只会更新播放器；暂停、重开和换关只影响游戏。",
  "页面切到后台时游戏会自动暂停，回来后请点「继续」。",
  "游戏音效默认关闭，可在右上角单独打开，不影响节目声音。",
];

function buildHelpDialog(): HTMLDialogElement {
  const dialog = el("dialog", "help");
  dialog.setAttribute("aria-labelledby", "help-heading");

  const head = el("div", "help__head");
  const heading = el("h2", "help__heading", "怎么玩");
  heading.id = "help-heading";
  const form = el("form");
  form.method = "dialog";
  const close = el("button", "btn btn--icon");
  close.type = "submit";
  close.setAttribute("aria-label", "关闭帮助");
  close.append(icon("close"));
  form.append(close);
  head.append(heading, form);

  const steps = el("ol", "help__steps");
  for (const step of HELP_STEPS) steps.append(el("li", undefined, step));

  dialog.append(head, steps);
  // Clicking the backdrop (the dialog element itself, outside its content) closes it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

function buildSoundButton(sfx: SfxControl): HTMLButtonElement {
  const sound = button("header__btn", "");
  const render = () => {
    const enabled = sfx.isSfxEnabled();
    sound.label.textContent = enabled ? "游戏音效：开" : "游戏音效：关";
    sound.setIcon(enabled ? "soundOn" : "soundOff");
    sound.element.setAttribute("aria-pressed", String(enabled));
  };
  sound.element.addEventListener("click", () => {
    sfx.setSfxEnabled(!sfx.isSfxEnabled());
    render();
  });
  render();
  return sound.element;
}

function buildHeader(sfx: SfxControl, help: HTMLDialogElement): HTMLElement {
  const header = el("header", "header");

  const brand = el("h1", "header__brand");
  const logo = el("img", "header__logo");
  logo.src = getCharacter("standard").assetPath;
  logo.alt = "";
  logo.width = 256;
  logo.height = 256;
  brand.append(logo, el("span", undefined, "播客弹弓"));

  const actions = el("div", "header__actions");
  const helpButton = button("header__btn", "帮助", "help");
  helpButton.element.setAttribute("aria-haspopup", "dialog");
  helpButton.element.addEventListener("click", () => {
    if (!help.open) help.showModal();
  });
  actions.append(buildSoundButton(sfx), el("span", "header__divider"), helpButton.element);

  header.append(brand, actions);
  return header;
}

export interface AppShell {
  destroy(): void;
}

/** Builds the whole page inside `root`. Call once. */
export function mountAppShell(root: HTMLElement): AppShell {
  const podcast = new PodcastPanel();
  const game = new GameHost();
  const help = buildHelpDialog();

  const main = el("main", "layout");
  const podcastColumn = el("div", "layout__podcast");
  podcastColumn.append(podcast.element);
  const gameColumn = el("div", "layout__game");
  gameColumn.append(game.element);
  main.append(podcastColumn, gameColumn);

  root.replaceChildren(buildHeader(game, help), main, help);
  // Phaser measures its parent, so the game starts only once it is in the document.
  game.start();

  return {
    destroy() {
      game.destroy();
    },
  };
}
