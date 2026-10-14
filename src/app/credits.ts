/**
 * Page footer (author line and a not-affiliated notice) and the credits dialog
 * listing third-party material. The full licence texts ship alongside the
 * build as `licenses.txt` (see the `licences` plugin in vite.config.ts); the
 * licences require them to accompany the code and fonts, not to be linked.
 */

import { onLanguageChange } from "../i18n/language";
import { m } from "../i18n/messages";
import { el, icon } from "./dom";

const AUTHOR_NAME = "刘瑞克";
const AUTHOR_URL = "https://github.com/rick-mingyu-liu";

interface Credit {
  what: string;
  who: string;
  href: string;
  licence: string;
  /** Language of `who` when it differs from the interface (a Chinese name). */
  lang?: string;
}

/** Read at render time so the rows follow the interface language. */
function credits(): readonly Credit[] {
  const t = m();
  return [
    {
      what: t.creditPrototype,
      who: "angry-aliens-phaser",
      href: "https://github.com/feliperyba/angry-aliens-phaser",
      licence: "MIT",
    },
    { what: t.creditEngine, who: "Phaser", href: "https://phaser.io", licence: "MIT" },
    {
      what: t.creditPhysics,
      who: "matter-js",
      href: "https://github.com/liabru/matter-js",
      licence: "MIT",
    },
    { what: t.creditArt, who: "Kenney", href: "https://kenney.nl", licence: t.creditKenneyLicence },
    {
      what: t.creditGameFont,
      who: "Kenney Fonts",
      href: "https://kenney.nl",
      licence: "CC BY-SA 3.0",
    },
    {
      what: t.creditCertificateFont,
      who: t.creditFontSubset,
      href: "https://github.com/google/fonts",
      licence: "SIL OFL 1.1",
    },
    {
      what: t.creditShow,
      who: t.creditShowWho,
      href: "https://www.bilibili.com/video/BV1fcHD6cEw3",
      licence: t.creditEmbed,
      lang: "zh-CN",
    },
  ];
}

function externalLink(className: string, text: string, href: string): HTMLAnchorElement {
  const link = el("a", className, text);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

export function buildCreditsDialog(): HTMLDialogElement {
  const dialog = el("dialog", "help credits");
  dialog.setAttribute("aria-labelledby", "credits-heading");

  const head = el("div", "help__head");
  const heading = el("h2", "help__heading");
  heading.id = "credits-heading";
  const form = el("form");
  form.method = "dialog";
  const close = el("button", "btn btn--icon");
  close.type = "submit";
  close.append(icon("close"));
  form.append(close);
  head.append(heading, form);

  const list = el("dl", "credits__list");
  const note = el("p", "credits__note");
  const notes = el("div", "credits__notes");
  notes.append(note);

  const render = () => {
    heading.textContent = m().credits;
    close.setAttribute("aria-label", m().close);
    list.replaceChildren();
    for (const credit of credits()) {
      const term = el("dt", "credits__what", credit.what);
      const detail = el("dd", "credits__detail");
      const link = externalLink("credits__link", credit.who, credit.href);
      if (credit.lang) link.lang = credit.lang;
      detail.append(link, el("span", "credits__licence", credit.licence));
      list.append(term, detail);
    }
    note.textContent = m().creditsNotice;
  };
  render();
  onLanguageChange(render);

  dialog.append(head, list, notes);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

export function buildFooter(credits: HTMLDialogElement): HTMLElement {
  const footer = el("footer", "footer");

  const author = el("span", "footer__item");
  const authorLink = externalLink("footer__link", AUTHOR_NAME, AUTHOR_URL);
  // The name stays Chinese in both languages.
  authorLink.lang = "zh-CN";

  const notice = el("span", "footer__item");

  const creditsButton = el("button", "footer__link footer__button");
  creditsButton.type = "button";
  creditsButton.setAttribute("aria-haspopup", "dialog");
  creditsButton.addEventListener("click", () => {
    if (!credits.open) credits.showModal();
  });

  const render = () => {
    const [before, after] = m().footerMadeBy;
    author.replaceChildren(before, authorLink, after);
    notice.textContent = m().footerNotice;
    creditsButton.textContent = m().credits;
  };
  render();
  onLanguageChange(render);

  footer.append(author, notice, creditsButton);
  return footer;
}
