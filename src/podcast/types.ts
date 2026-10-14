import type { Localized } from "../i18n/language";

/** A Bilibili video. `startSeconds` is where playback should begin. */
export type VideoRef = { bvid: string; page?: number; startSeconds?: number };

/**
 * The same programme on YouTube. `offsetSeconds` is added to every chapter
 * start when this upload is ahead of or behind the Bilibili one.
 */
export type YouTubeRef = { videoId: string; offsetSeconds?: number };

export type PlatformId = "bilibili" | "youtube";

export type Chapter = { id: string; title: Localized; startSeconds: number };

export type Podcast = {
  id: string;
  title: Localized;
  /** Bilibili upload; chapter times are measured against it. */
  video: VideoRef;
  youtube?: YouTubeRef;
  chapters: Chapter[];
};
