/**
 * Page footer (author line and a not-affiliated notice) and the credits dialog
 * listing third-party material. The full licence texts are served as
 * `licenses.txt` (see the `licences` plugin in vite.config.ts).
 */

import { el, icon } from "./dom";

const AUTHOR_NAME = "刘瑞克";
const AUTHOR_URL = "https://github.com/rick-mingyu-liu";

interface Credit {
  what: string;
  who: string;
  href: string;
  licence: string;
}

const CREDITS: readonly Credit[] = [
  {
    what: "游戏原型",
    who: "angry-aliens-phaser",
    href: "https://github.com/feliperyba/angry-aliens-phaser",
    licence: "MIT",
  },
  { what: "游戏引擎", who: "Phaser", href: "https://phaser.io", licence: "MIT" },
  {
    what: "物理引擎",
    who: "matter-js",
    href: "https://github.com/liabru/matter-js",
    licence: "MIT",
  },
  {
    what: "场景与界面素材",
    who: "Kenney",
    href: "https://kenney.nl",
    licence: "CC0（据原项目说明）",
  },
  { what: "游戏字体", who: "Kenney Fonts", href: "https://kenney.nl", licence: "CC BY-SA 3.0" },
  {
    what: "证书字体",
    who: "Noto Serif SC（子集）",
    href: "https://github.com/google/fonts",
    licence: "SIL OFL 1.1",
  },
  {
    what: "节目",
    who: "邵艾伦Alan · 哔哩哔哩",
    href: "https://www.bilibili.com/video/BV1fcHD6cEw3",
    licence: "官方播放器嵌入",
  },
  {
    what: "章节与角色灵感",
    who: "wolfyxbt/justin-nut",
    href: "https://github.com/wolfyxbt/justin-nut",
    licence: "参考",
  },
];

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
  const heading = el("h2", "help__heading", "致谢与许可");
  heading.id = "credits-heading";
  const form = el("form");
  form.method = "dialog";
  const close = el("button", "btn btn--icon");
  close.type = "submit";
  close.setAttribute("aria-label", "关闭");
  close.append(icon("close"));
  form.append(close);
  head.append(heading, form);

  const list = el("dl", "credits__list");
  for (const credit of CREDITS) {
    const term = el("dt", "credits__what", credit.what);
    const detail = el("dd", "credits__detail");
    detail.append(
      externalLink("credits__link", credit.who, credit.href),
      el("span", "credits__licence", credit.licence)
    );
    list.append(term, detail);
  }

  const notes = el("div", "credits__notes");
  const licences = el("p", "credits__note");
  licences.append(
    "开源许可证全文：",
    externalLink("credits__link", "licenses.txt", "licenses.txt")
  );
  notes.append(
    licences,
    el(
      "p",
      "credits__note",
      "本页面为非官方粉丝作品，与孙宇晨、邵艾伦Alan及哔哩哔哩无关。节目内容版权归原作者所有。"
    )
  );

  dialog.append(head, list, notes);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

export function buildFooter(credits: HTMLDialogElement): HTMLElement {
  const footer = el("footer", "footer");

  const author = el("span", "footer__item");
  author.append("由 ", externalLink("footer__link", AUTHOR_NAME, AUTHOR_URL), " 制作");

  const notice = el("span", "footer__item", "非官方粉丝作品，与孙宇晨、邵艾伦Alan及哔哩哔哩无关");

  const creditsButton = el("button", "footer__link footer__button", "致谢与许可");
  creditsButton.type = "button";
  creditsButton.setAttribute("aria-haspopup", "dialog");
  creditsButton.addEventListener("click", () => {
    if (!credits.open) credits.showModal();
  });

  footer.append(author, notice, creditsButton);
  return footer;
}
