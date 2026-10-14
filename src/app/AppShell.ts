/**
 * AppShell: builds the page once. Header, then the podcast panel next to the
 * game host, then the footer. Both children are created exactly once and never recreated.
 */

import { getCharacter } from "../game/characters";
import {
  applyDocumentLanguage,
  getLanguage,
  onLanguageChange,
  setLanguage,
} from "../i18n/language";
import { m } from "../i18n/messages";
import { PodcastPanel } from "../podcast/PodcastPanel";
import { buildCreditsDialog, buildFooter } from "./credits";
import { button, el, icon } from "./dom";
import { GameHost, type SfxControl } from "./GameHost";

function buildHelpDialog(): HTMLDialogElement {
  const dialog = el("dialog", "help");
  dialog.setAttribute("aria-labelledby", "help-heading");

  const head = el("div", "help__head");
  const heading = el("h2", "help__heading");
  heading.id = "help-heading";
  const form = el("form");
  form.method = "dialog";
  const close = el("button", "btn btn--icon");
  close.type = "submit";
  close.append(icon("close"));
  form.append(close);
  head.append(heading, form);

  const steps = el("ol", "help__steps");
  const render = () => {
    heading.textContent = m().helpHeading;
    close.setAttribute("aria-label", m().helpClose);
    steps.replaceChildren(...m().helpSteps.map((step) => el("li", undefined, step)));
  };
  render();
  onLanguageChange(render);

  dialog.append(head, steps);
  // Clicking the backdrop (the dialog element itself, outside its content) closes it.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

function buildSoundButton(sfx: SfxControl): HTMLButtonElement {
  const sound = button("header__btn header__btn--sound", "");
  const render = () => {
    const enabled = sfx.isSfxEnabled();
    const label = enabled ? m().sfxOn : m().sfxOff;
    sound.label.textContent = label;
    // The text label is hidden on narrow screens; the name stays on the button.
    sound.element.setAttribute("aria-label", label);
    sound.setIcon(enabled ? "soundOn" : "soundOff");
    sound.element.setAttribute("aria-pressed", String(enabled));
  };
  sound.element.addEventListener("click", () => {
    sfx.setSfxEnabled(!sfx.isSfxEnabled());
    render();
  });
  render();
  onLanguageChange(render);
  return sound.element;
}

function buildLanguageButton(): HTMLButtonElement {
  const toggle = button("header__btn header__btn--language", "");
  const render = () => {
    const target = getLanguage() === "zh" ? "en" : "zh";
    toggle.label.textContent = m().languageToggle;
    // The whole button speaks the target language; its name starts with the visible text.
    toggle.element.lang = target === "zh" ? "zh-CN" : "en";
    toggle.element.setAttribute("aria-label", m().languageToggleLabel);
  };
  toggle.element.addEventListener("click", () => {
    setLanguage(getLanguage() === "zh" ? "en" : "zh");
  });
  render();
  onLanguageChange(render);
  return toggle.element;
}

function buildHeader(sfx: SfxControl, help: HTMLDialogElement): HTMLElement {
  const header = el("header", "header");

  const brand = el("h1", "header__brand");
  const logo = el("img", "header__logo");
  logo.src = getCharacter("standard").assetPath;
  logo.alt = "";
  logo.width = 256;
  logo.height = 256;
  const brandText = el("span");
  brand.append(logo, brandText);

  const actions = el("div", "header__actions");
  const helpButton = button("header__btn header__btn--help", "", "help");
  helpButton.element.setAttribute("aria-haspopup", "dialog");
  helpButton.element.addEventListener("click", () => {
    if (!help.open) help.showModal();
  });
  const render = () => {
    brandText.textContent = m().brand;
    helpButton.label.textContent = m().help;
  };
  render();
  onLanguageChange(render);
  actions.append(
    buildLanguageButton(),
    el("span", "header__divider"),
    buildSoundButton(sfx),
    el("span", "header__divider"),
    helpButton.element
  );

  header.append(brand, actions);
  return header;
}

export interface AppShell {
  destroy(): void;
}

/** Builds the whole page inside `root`. Call once. */
export function mountAppShell(root: HTMLElement): AppShell {
  applyDocumentLanguage();
  const renderTitle = () => {
    document.title = m().documentTitle;
  };
  renderTitle();
  onLanguageChange(renderTitle);

  const podcast = new PodcastPanel();
  const game = new GameHost();
  const help = buildHelpDialog();
  const credits = buildCreditsDialog();

  const main = el("main", "layout");
  const podcastColumn = el("div", "layout__podcast");
  podcastColumn.append(podcast.element);
  const gameColumn = el("div", "layout__game");
  gameColumn.append(game.element);
  main.append(podcastColumn, gameColumn);

  root.replaceChildren(buildHeader(game, help), main, buildFooter(credits), help, credits);
  // Phaser measures its parent, so the game starts only once it is in the document.
  game.start();

  return {
    destroy() {
      game.destroy();
    },
  };
}
