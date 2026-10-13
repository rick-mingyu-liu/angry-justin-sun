/**
 * PodcastPanel: left column. Programme, chapters, clips and the selected row.
 *
 * Uses the official Bilibili iframe only. Selecting a row swaps the iframe
 * URL; there is no playback API, so the highlighted row is the one the user
 * picked, not live chapter tracking. Never imports game code.
 */

import { button, el, icon } from "../app/dom";
import { buildEmbedUrl, buildWatchUrl, chapterVideoRef, formatTimestamp } from "./bilibili";
import { getConfiguredPodcast } from "./podcastData";
import type { Podcast, VideoRef } from "./types";

type TabId = "chapters" | "clips";

interface TabView {
  id: TabId;
  tab: HTMLButtonElement;
  panel: HTMLUListElement;
  rows: Map<string, HTMLButtonElement>;
}

const BILIBILI_HOME_URL = "https://www.bilibili.com/";

const TAB_LABELS: Record<TabId, string> = { chapters: "话题章节", clips: "精选切片" };
const TAB_EMPTY_TEXT: Record<TabId, string> = { chapters: "暂无章节", clips: "暂无切片" };

export class PodcastPanel {
  readonly element: HTMLElement;

  private readonly podcast: Podcast | null;
  private readonly player = el("div", "podcast__player");
  private readonly openLink = el("a", "podcast__open-link");
  private readonly openNote = el("span", "podcast__open-note");
  private readonly browser = el("div", "podcast__browser");
  private readonly toggle = button("podcast__toggle", "章节与切片");
  private readonly tabs: Record<TabId, TabView>;

  private iframe: HTMLIFrameElement | null = null;
  private embedUrl: string | null = null;
  private activeTab: TabId = "chapters";
  private selected: { tab: TabId; id: string } | null = null;

  constructor(podcast: Podcast | null = getConfiguredPodcast()) {
    this.podcast = podcast;
    this.tabs = { chapters: this.createTab("chapters"), clips: this.createTab("clips") };
    this.element = this.build();
    this.fillLists();
    this.showTab("chapters");
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
    head.append(heading, el("span", "podcast__source", "bilibili"));

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
    const tablist = el("div", "podcast__tabs");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "节目内容");
    tablist.append(this.tabs.chapters.tab, this.tabs.clips.tab);
    tablist.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next: TabId = this.activeTab === "chapters" ? "clips" : "chapters";
      this.showTab(next);
      this.tabs[next].tab.focus();
    });
    this.browser.append(tablist, this.tabs.chapters.panel, this.tabs.clips.panel);

    const foot = el("p", "podcast__foot");
    foot.append(icon("info"), el("span", undefined, "切换章节不打断游戏"));

    section.append(head, this.player);
    if (this.podcast) section.append(el("h3", "podcast__title", this.podcast.title));
    section.append(open, this.toggle.element, this.browser, foot);
    return section;
  }

  private createTab(id: TabId): TabView {
    const tab = el("button", "podcast__tab", TAB_LABELS[id]);
    tab.type = "button";
    tab.id = `podcast-tab-${id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `podcast-list-${id}`);
    tab.addEventListener("click", () => this.showTab(id));

    const panel = el("ul", "podcast__list");
    panel.id = `podcast-list-${id}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);

    return { id, tab, panel, rows: new Map() };
  }

  private fillLists(): void {
    const podcast = this.podcast;
    for (const chapter of podcast?.chapters ?? []) {
      this.addRow("chapters", chapter.id, chapter.title, formatTimestamp(chapter.startSeconds));
    }
    for (const clip of podcast?.clips ?? []) {
      this.addRow("clips", clip.id, clip.title);
    }
    for (const view of Object.values(this.tabs)) {
      if (view.rows.size > 0) continue;
      view.panel.append(el("li", "podcast__empty", TAB_EMPTY_TEXT[view.id]));
    }
  }

  private addRow(tab: TabId, id: string, title: string, timestamp?: string): void {
    const view = this.tabs[tab];
    const row = el("button", "podcast__row");
    row.type = "button";
    row.append(icon("play", "icon podcast__row-marker"));
    if (timestamp !== undefined) row.append(el("span", "podcast__row-time", timestamp));
    row.append(el("span", "podcast__row-title", title));
    row.addEventListener("click", () => this.select(tab, id));
    view.rows.set(id, row);

    const item = el("li");
    item.append(row);
    view.panel.append(item);
  }

  private showTab(id: TabId): void {
    this.activeTab = id;
    for (const view of Object.values(this.tabs)) {
      const active = view.id === id;
      view.tab.setAttribute("aria-selected", String(active));
      view.tab.tabIndex = active ? 0 : -1;
      view.panel.hidden = !active;
    }
  }

  /** Narrow screens only; on desktop the stylesheet keeps the lists open. */
  private setCollapsed(collapsed: boolean): void {
    this.browser.dataset.collapsed = String(collapsed);
    this.toggle.element.setAttribute("aria-expanded", String(!collapsed));
  }

  private select(tab: TabId, id: string): void {
    const podcast = this.podcast;
    if (!podcast) return;

    let video: VideoRef | null = null;
    if (tab === "chapters") {
      const chapter = podcast.chapters.find((entry) => entry.id === id);
      if (chapter) video = chapterVideoRef(podcast, chapter);
    } else {
      video = podcast.clips.find((entry) => entry.id === id)?.video ?? null;
    }
    if (!video) return;

    this.selected = { tab, id };
    for (const view of Object.values(this.tabs)) {
      for (const [rowId, row] of view.rows) {
        if (this.selected.tab === view.id && this.selected.id === rowId) {
          row.setAttribute("aria-current", "true");
        } else {
          row.removeAttribute("aria-current");
        }
      }
    }
    this.showVideo(video, true);
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
