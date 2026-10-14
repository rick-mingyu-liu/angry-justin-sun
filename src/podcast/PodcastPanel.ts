/**
 * PodcastPanel: left column. Programme, platform switch, chapter list.
 *
 * Bilibili uses the official iframe: selecting a chapter swaps its URL and asks
 * it to play (the click is the user gesture); it has no playback API, so the
 * highlighted row is the one the user picked. YouTube uses the IFrame Player
 * API: chapters seek without a reload and the highlight follows playback.
 * The position carries over when switching platforms. Never imports game code.
 */

import { button, el, icon } from "../app/dom";
import { localize, onLanguageChange } from "../i18n/language";
import { m } from "../i18n/messages";
import { buildEmbedUrl, buildWatchUrl, formatTimestamp } from "./bilibili";
import {
  decidePlatform,
  platformAfterProbe,
  probeImage,
  clearStoredPlatform,
  readStoredPlatform,
  storePlatform,
} from "./platformChoice";
import { getConfiguredPodcast } from "./podcastData";
import type { Chapter, PlatformId, Podcast, VideoRef } from "./types";
import {
  bilibiliSecondsFromYouTube,
  buildYouTubeWatchUrl,
  chapterAt,
  isValidYouTubeId,
  youtubeProbeImageUrl,
  youtubeStartSeconds,
} from "./youtube";
import { YouTubePlayer } from "./youtubePlayer";

const HOME_URL: Record<PlatformId, string> = {
  bilibili: "https://www.bilibili.com/",
  youtube: "https://www.youtube.com/",
};
const PROBE_TIMEOUT_MS = 2500;

type Placeholder = () => { title: string; detail: string; file: string };

interface ChapterRow {
  chapter: Chapter;
  element: HTMLButtonElement;
  title: HTMLSpanElement;
}

function browserLanguages(): readonly string[] {
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

export class PodcastPanel {
  readonly element: HTMLElement;

  private readonly podcast: Podcast | null;
  private readonly heading = el("h2", "podcast__heading");
  private readonly switcher = el("div", "podcast__platforms");
  private readonly platformButtons = new Map<PlatformId, HTMLButtonElement>();
  private readonly player = el("div", "podcast__player");
  private readonly notice = el("p", "podcast__notice");
  private readonly titleNode = el("h3", "podcast__title");
  private readonly openLink = el("a", "podcast__open-link");
  private readonly openLabel = el("span");
  private readonly openNote = el("span", "podcast__open-note");
  private readonly browser = el("div", "podcast__browser");
  private readonly toggle = button("podcast__toggle", "");
  private readonly listHeading = el("h3", "podcast__list-heading");
  private readonly list = el("ul", "podcast__list");
  private readonly footText = el("span");
  private readonly translationNote = el("p", "podcast__translation-note");
  private readonly rows: ChapterRow[] = [];

  /** Null while the automatic choice is still being made. */
  private platform: PlatformId | null = null;
  /** Bumped on every platform change so a late probe result is ignored. */
  private choiceGeneration = 0;
  /** Last known position on the Bilibili timeline, carried across platform switches. */
  private position = 0;
  private iframe: HTMLIFrameElement | null = null;
  private embedUrl: string | null = null;
  private youtube: YouTubePlayer | null = null;
  private placeholder: Placeholder | null = null;
  private noticeText: (() => string) | null = null;

  constructor(podcast: Podcast | null = getConfiguredPodcast()) {
    this.podcast = podcast;
    this.element = this.build();
    this.fillList();
    this.setCollapsed(true);
    this.applyLanguage();
    onLanguageChange(() => this.applyLanguage());
    if (podcast) this.choosePlatform(podcast);
    else this.showUnconfigured();
  }

  private get youtubeAvailable(): boolean {
    return this.podcast?.youtube !== undefined && isValidYouTubeId(this.podcast.youtube.videoId);
  }

  // ---------------------------------------------------------------- building

  private build(): HTMLElement {
    const section = el("section", "panel podcast");
    section.setAttribute("aria-labelledby", "podcast-heading");

    const head = el("header", "podcast__head");
    this.heading.id = "podcast-heading";
    head.append(this.heading);

    if (this.youtubeAvailable) {
      this.switcher.setAttribute("role", "group");
      for (const platform of ["bilibili", "youtube"] as const) {
        const option = el("button", "podcast__platform");
        option.type = "button";
        option.dataset.platform = platform;
        option.addEventListener("click", () => this.switchPlatform(platform));
        this.platformButtons.set(platform, option);
        this.switcher.append(option);
      }
      head.append(this.switcher);
    }

    // Rendered (empty, collapsed by CSS) from the start so screen readers
    // announce the text when it arrives.
    this.notice.setAttribute("role", "status");

    const open = el("p", "podcast__open");
    this.openLink.target = "_blank";
    this.openLink.rel = "noopener noreferrer";
    this.openLink.append(this.openLabel, icon("external"));
    open.append(this.openLink, this.openNote);

    this.toggle.element.append(icon("chevron", "icon podcast__toggle-chevron"));
    this.toggle.element.setAttribute("aria-controls", "podcast-browser");
    this.toggle.element.addEventListener("click", () => {
      this.setCollapsed(this.browser.dataset.collapsed !== "true");
    });

    this.browser.id = "podcast-browser";
    this.listHeading.id = "podcast-list-heading";
    this.list.setAttribute("aria-labelledby", this.listHeading.id);
    this.browser.append(this.listHeading, this.list);

    const foot = el("p", "podcast__foot");
    foot.append(icon("info"), this.footText);

    section.append(head, this.player, this.notice);
    if (this.podcast) section.append(this.titleNode);
    section.append(open, this.toggle.element, this.browser, foot, this.translationNote);
    return section;
  }

  private fillList(): void {
    for (const chapter of this.podcast?.chapters ?? []) {
      const row = el("button", "podcast__row");
      row.type = "button";
      const title = el("span", "podcast__row-title");
      row.append(icon("play", "icon podcast__row-marker"));
      row.append(el("span", "podcast__row-time", formatTimestamp(chapter.startSeconds)));
      row.append(title);
      row.addEventListener("click", () => this.select(chapter));
      this.rows.push({ chapter, element: row, title });

      const item = el("li");
      item.append(row);
      this.list.append(item);
    }
  }

  /** Every piece of text in the panel, for the first render and each language change. */
  private applyLanguage(): void {
    const text = m();
    this.heading.textContent = text.podcastHeading;
    this.switcher.setAttribute("aria-label", text.platformLabel);
    this.platformButtons.get("bilibili")?.replaceChildren(text.platformBilibili);
    this.platformButtons.get("youtube")?.replaceChildren(text.platformYouTube);
    if (this.podcast) this.titleNode.textContent = localize(this.podcast.title);
    this.toggle.label.textContent = text.chapters;
    this.listHeading.textContent = text.chapters;
    this.footText.textContent = text.chapterSwitchNote;
    this.translationNote.textContent = text.chapterTranslationNote;
    this.translationNote.hidden = text.chapterTranslationNote === "" || this.rows.length === 0;
    for (const row of this.rows) row.title.textContent = localize(row.chapter.title);
    if (this.rows.length === 0) {
      this.list.replaceChildren(el("li", "podcast__empty", text.noChapters));
    }
    if (this.iframe) this.iframe.title = text.playerTitle(text.platformBilibili);
    this.youtube?.setTitle(text.playerTitle(text.platformYouTube));
    if (this.placeholder) {
      if (this.youtube)
        this.player.firstElementChild?.replaceWith(this.placeholderCard(this.placeholder));
      else this.renderPlaceholder(this.placeholder);
    }
    this.renderNotice();
    this.renderOpenLink();
  }

  /** Narrow screens only; on desktop the stylesheet keeps the list open. */
  private setCollapsed(collapsed: boolean): void {
    this.browser.dataset.collapsed = String(collapsed);
    this.toggle.element.setAttribute("aria-expanded", String(!collapsed));
  }

  // --------------------------------------------------------------- platforms

  private choosePlatform(podcast: Podcast): void {
    const decision = decidePlatform({
      stored: readStoredPlatform(),
      youtubeAvailable: this.youtubeAvailable,
      browserLanguages: browserLanguages(),
    });
    if (decision.kind === "decided") {
      this.showPlatform(decision.platform);
      return;
    }
    const generation = ++this.choiceGeneration;
    this.renderSwitcher();
    this.showPlaceholder(() => ({ title: m().choosingPlatform, detail: "", file: "" }));
    void probeImage(youtubeProbeImageUrl(podcast.youtube!.videoId), PROBE_TIMEOUT_MS).then(
      (reachable) => {
        // The visitor picked a platform while the probe was running.
        if (generation !== this.choiceGeneration) return;
        this.showPlatform(platformAfterProbe(reachable));
      }
    );
  }

  private switchPlatform(platform: PlatformId): void {
    storePlatform(platform);
    this.setNotice(null);
    if (platform === this.platform) return;
    this.choiceGeneration += 1;
    this.showPlatform(platform);
  }

  private showPlatform(platform: PlatformId): void {
    const podcast = this.podcast;
    if (!podcast) return;
    if (platform === "youtube" && !this.youtubeAvailable) platform = "bilibili";
    this.teardownPlayers();
    this.platform = platform;
    this.renderSwitcher();
    if (platform === "youtube") this.showYouTube(podcast, this.position, false);
    else this.showBilibili({ ...podcast.video, startSeconds: this.position }, false);
  }

  private teardownPlayers(): void {
    this.youtube?.destroy();
    this.youtube = null;
    this.iframe = null;
    this.embedUrl = null;
    this.placeholder = null;
    this.player.replaceChildren();
  }

  private renderSwitcher(): void {
    for (const [platform, option] of this.platformButtons) {
      option.setAttribute("aria-pressed", String(platform === this.platform));
    }
  }

  // ---------------------------------------------------------------- chapters

  private select(chapter: Chapter): void {
    const podcast = this.podcast;
    if (!podcast) return;
    this.position = chapter.startSeconds;
    this.highlight(chapter.id);
    if (this.platform === "youtube" && this.youtube) {
      this.youtube.seek(youtubeStartSeconds(podcast.youtube!, chapter.startSeconds), true);
    } else if (this.platform === "bilibili") {
      this.showBilibili({ ...podcast.video, startSeconds: chapter.startSeconds }, true);
    }
    // Still choosing: the chosen player starts at this chapter.
    this.renderOpenLink();
  }

  private highlight(chapterId: string | null): void {
    for (const row of this.rows) {
      if (row.chapter.id === chapterId) row.element.setAttribute("aria-current", "true");
      else row.element.removeAttribute("aria-current");
    }
  }

  // ----------------------------------------------------------------- players

  /** Points the single Bilibili iframe at `video`. A changed URL reloads the player. */
  private showBilibili(video: VideoRef, selectedByUser: boolean): void {
    const embedUrl = buildEmbedUrl(video, { autoplay: selectedByUser });
    this.renderOpenLink();

    if (!embedUrl) {
      this.iframe = null;
      this.embedUrl = null;
      this.showPlaceholder(() => ({
        title: m().noUrlTitle,
        detail: m().noUrlDetail,
        file: "src/podcast/podcastData.ts",
      }));
      return;
    }
    // An explicit selection reloads even an unchanged URL, so clicking the
    // current chapter again jumps back to its start.
    if (embedUrl === this.embedUrl && !selectedByUser) return;
    this.embedUrl = embedUrl;

    if (!this.iframe) {
      const iframe = el("iframe", "podcast__frame");
      iframe.title = m().playerTitle(m().platformBilibili);
      iframe.loading = "lazy";
      // "autoplay" lets a chapter click start playback inside the cross-origin player.
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      this.iframe = iframe;
      this.placeholder = null;
      iframe.src = embedUrl;
      this.player.replaceChildren(iframe);
      return;
    }
    this.iframe.src = embedUrl;
  }

  private showYouTube(podcast: Podcast, position: number, play: boolean): void {
    const ref = podcast.youtube!;
    // The loading card sits underneath; the player's iframe covers it once created.
    this.showPlaceholder(() => ({ title: m().youtubeLoading, detail: "", file: "" }));
    const loading = this.player.firstElementChild;
    const frame = el("div", "podcast__frame");
    const player = new YouTubePlayer(frame, {
      videoId: ref.videoId,
      startSeconds: youtubeStartSeconds(ref, position),
      title: m().playerTitle(m().platformYouTube),
      onTime: (seconds) => {
        if (this.youtube !== player) return;
        this.position = bilibiliSecondsFromYouTube(ref, seconds);
        // A second of slack: right after a seek the player can report a time
        // just before the chapter that was clicked.
        this.highlight(chapterAt(podcast.chapters, this.position + 1)?.id ?? null);
        this.renderOpenLink();
      },
      onFailure: (error) => {
        if (this.youtube !== player) return;
        console.warn("[PodcastPanel] YouTube unavailable, using Bilibili", error);
        // A remembered YouTube choice would fail the same slow way on every
        // visit from this network; forget it so the next visit decides afresh.
        if (readStoredPlatform() === "youtube") clearStoredPlatform();
        this.setNotice(() => m().youtubeFailed);
        this.showPlatform("bilibili");
      },
    });
    this.youtube = player;
    this.player.replaceChildren(...(loading ? [loading] : []), frame);
    if (play) player.seek(youtubeStartSeconds(ref, position), true);
    this.renderOpenLink();
  }

  private showUnconfigured(): void {
    this.renderOpenLink();
    this.showPlaceholder(() => ({
      title: m().unconfiguredTitle,
      detail: import.meta.env.DEV ? m().unconfiguredDev : m().unconfiguredProd,
      file: import.meta.env.DEV ? "src/podcast/podcastData.ts" : "",
    }));
  }

  private showPlaceholder(placeholder: Placeholder): void {
    this.placeholder = placeholder;
    this.renderPlaceholder(placeholder);
  }

  private renderPlaceholder(placeholder: Placeholder): void {
    this.player.replaceChildren(this.placeholderCard(placeholder));
  }

  private placeholderCard(placeholder: Placeholder): HTMLElement {
    const { title, detail, file } = placeholder();
    const card = el("div", "podcast__placeholder");
    const glyph = el("span", "podcast__placeholder-glyph");
    glyph.append(icon("play"));
    card.append(glyph, el("p", "podcast__placeholder-title", title));
    if (detail) card.append(el("p", "podcast__placeholder-detail", detail));
    if (file) card.append(el("code", "podcast__placeholder-file", file));
    return card;
  }

  // ------------------------------------------------------------------- links

  private setNotice(text: (() => string) | null): void {
    this.noticeText = text;
    this.renderNotice();
  }

  private renderNotice(): void {
    const text = this.noticeText?.() ?? "";
    this.notice.textContent = text;
  }

  private renderOpenLink(): void {
    const text = m();
    const platform = this.platform ?? "bilibili";
    const name = platform === "youtube" ? text.platformYouTube : text.platformBilibili;
    const podcast = this.podcast;
    let url: string | null = null;
    let note = "";
    if (!podcast) {
      note = text.unconfiguredLink(name);
    } else {
      url =
        platform === "youtube"
          ? buildYouTubeWatchUrl(podcast.youtube!, this.position)
          : buildWatchUrl({ ...podcast.video, startSeconds: this.position });
      if (!url) note = text.invalidVideo(name);
    }
    this.openLabel.textContent = text.openOn(name);
    this.openLink.href = url ?? HOME_URL[platform];
    this.openNote.textContent = note;
    this.openNote.hidden = note === "";
  }
}
