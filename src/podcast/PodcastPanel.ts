/**
 * PodcastPanel: left column. Programme, chapter list and the selected row.
 *
 * Uses the official Bilibili iframe only. Selecting a chapter swaps the iframe
 * URL; there is no playback API, so the highlighted row is the one the user
 * picked, not live chapter tracking. Never imports game code.
 */

import { button, el, icon } from "../app/dom";
import { buildEmbedUrl, buildWatchUrl, chapterVideoRef, formatTimestamp } from "./bilibili";
import { getConfiguredPodcast } from "./podcastData";
import type { Podcast, VideoRef } from "./types";

const BILIBILI_HOME_URL = "https://www.bilibili.com/";

export class PodcastPanel {
  readonly element: HTMLElement;

  private readonly podcast: Podcast | null;
  private readonly player = el("div", "podcast__player");
  private readonly openLink = el("a", "podcast__open-link");
  private readonly openNote = el("span", "podcast__open-note");
  private readonly browser = el("div", "podcast__browser");
  private readonly toggle = button("podcast__toggle", "话题章节");
  private readonly list = el("ul", "podcast__list");
  private readonly rows = new Map<string, HTMLButtonElement>();

  private iframe: HTMLIFrameElement | null = null;
  private embedUrl: string | null = null;

  constructor(podcast: Podcast | null = getConfiguredPodcast()) {
    this.podcast = podcast;
    this.element = this.build();
    this.fillList();
    this.setCollapsed(true);
    if (podcast) this.showVideo(podcast.video);
    else this.showUnconfigured();
  }

  private build(): HTMLElement {
    const section = el("section", "panel podcast");
    section.setAttribute("aria-labelledby", "podcast-heading");

    const head = el("header", "podcast__head");
    const heading = el("h2", "podcast__heading", "边听边玩");
    heading.id = "podcast-heading";
    head.append(heading);

    const open = el("p", "podcast__open");
    this.openLink.target = "_blank";
    this.openLink.rel = "noopener noreferrer";
    this.openLink.append(el("span", undefined, "在 B 站打开"), icon("external"));
    open.append(this.openLink, this.openNote);

    this.toggle.element.append(icon("chevron", "icon podcast__toggle-chevron"));
    this.toggle.element.setAttribute("aria-controls", "podcast-browser");
    this.toggle.element.addEventListener("click", () => {
      this.setCollapsed(this.browser.dataset.collapsed !== "true");
    });

    this.browser.id = "podcast-browser";
    const listHeading = el("h3", "podcast__list-heading", "话题章节");
    listHeading.id = "podcast-list-heading";
    this.list.setAttribute("aria-labelledby", listHeading.id);
    this.browser.append(listHeading, this.list);

    const foot = el("p", "podcast__foot");
    foot.append(icon("info"), el("span", undefined, "切换章节不打断游戏"));

    section.append(head, this.player);
    if (this.podcast) section.append(el("h3", "podcast__title", this.podcast.title));
    section.append(open, this.toggle.element, this.browser, foot);
    return section;
  }

  private fillList(): void {
    for (const chapter of this.podcast?.chapters ?? []) {
      const row = el("button", "podcast__row");
      row.type = "button";
      row.append(icon("play", "icon podcast__row-marker"));
      row.append(el("span", "podcast__row-time", formatTimestamp(chapter.startSeconds)));
      row.append(el("span", "podcast__row-title", chapter.title));
      row.addEventListener("click", () => this.select(chapter.id));
      this.rows.set(chapter.id, row);

      const item = el("li");
      item.append(row);
      this.list.append(item);
    }
    if (this.rows.size === 0) this.list.append(el("li", "podcast__empty", "暂无章节"));
  }

  /** Narrow screens only; on desktop the stylesheet keeps the list open. */
  private setCollapsed(collapsed: boolean): void {
    this.browser.dataset.collapsed = String(collapsed);
    this.toggle.element.setAttribute("aria-expanded", String(!collapsed));
  }

  private select(chapterId: string): void {
    const podcast = this.podcast;
    const chapter = podcast?.chapters.find((entry) => entry.id === chapterId);
    if (!podcast || !chapter) return;

    for (const [rowId, row] of this.rows) {
      if (rowId === chapterId) row.setAttribute("aria-current", "true");
      else row.removeAttribute("aria-current");
    }
    this.showVideo(chapterVideoRef(podcast, chapter), true);
  }

  /** Points the single iframe at `video`. A changed URL reloads the player. */
  private showVideo(video: VideoRef, reload = false): void {
    const embedUrl = buildEmbedUrl(video);
    const watchUrl = buildWatchUrl(video);
    this.setOpenLink(watchUrl, watchUrl ? "" : "视频地址无效，将打开 B 站首页");

    if (!embedUrl) {
      this.embedUrl = null;
      this.iframe = null;
      this.showPlaceholder(
        "无法生成播放地址",
        "请检查节目配置中的视频编号",
        "src/podcast/podcastData.ts"
      );
      return;
    }
    // An explicit selection reloads even an unchanged URL, so clicking the
    // current chapter again jumps back to its start.
    if (embedUrl === this.embedUrl && !reload) return;
    this.embedUrl = embedUrl;

    if (!this.iframe) {
      const iframe = el("iframe", "podcast__frame");
      iframe.title = "bilibili 视频播放器";
      iframe.loading = "lazy";
      iframe.allow = "fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      this.iframe = iframe;
      iframe.src = embedUrl;
      this.player.replaceChildren(iframe);
      return;
    }
    this.iframe.src = embedUrl;
  }

  private showUnconfigured(): void {
    this.setOpenLink(null, "尚未配置节目，将打开 B 站首页");
    this.showPlaceholder(
      "尚未配置节目",
      import.meta.env.DEV ? "开发者请在以下文件中填写节目" : "节目上线后会显示在这里",
      import.meta.env.DEV ? "src/podcast/podcastData.ts" : ""
    );
  }

  private showPlaceholder(title: string, detail: string, file: string): void {
    const card = el("div", "podcast__placeholder");
    const glyph = el("span", "podcast__placeholder-glyph");
    glyph.append(icon("play"));
    const text = el("p", "podcast__placeholder-detail", detail);
    card.append(glyph, el("p", "podcast__placeholder-title", title), text);
    if (file) card.append(el("code", "podcast__placeholder-file", file));
    this.player.replaceChildren(card);
  }

  private setOpenLink(watchUrl: string | null, note: string): void {
    this.openLink.href = watchUrl ?? BILIBILI_HOME_URL;
    this.openNote.textContent = note;
    this.openNote.hidden = note === "";
  }
}
