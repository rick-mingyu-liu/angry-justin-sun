/**
 * YouTube helpers: pure functions for ids, watch links and chapter times.
 * The player itself lives in youtubePlayer.ts.
 */

import type { Chapter, YouTubeRef } from "./types";

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isValidYouTubeId(value: unknown): value is string {
  return typeof value === "string" && VIDEO_ID_PATTERN.test(value);
}

/** Chapter start on the YouTube upload: the Bilibili time plus the upload's offset, never negative. */
export function youtubeStartSeconds(ref: YouTubeRef, startSeconds: number): number {
  const offset =
    typeof ref.offsetSeconds === "number" && Number.isFinite(ref.offsetSeconds)
      ? ref.offsetSeconds
      : 0;
  const start = Number.isFinite(startSeconds) ? startSeconds : 0;
  return Math.max(0, Math.floor(start + offset));
}

/** Inverse of youtubeStartSeconds: a YouTube playback time on the Bilibili timeline. */
export function bilibiliSecondsFromYouTube(ref: YouTubeRef, youtubeSeconds: number): number {
  const offset =
    typeof ref.offsetSeconds === "number" && Number.isFinite(ref.offsetSeconds)
      ? ref.offsetSeconds
      : 0;
  const time = Number.isFinite(youtubeSeconds) ? youtubeSeconds : 0;
  // Rounded, so a fractional offset maps a chapter start back onto itself.
  return Math.max(0, Math.round(time - offset));
}

export function buildYouTubeWatchUrl(ref: YouTubeRef, startSeconds = 0): string | null {
  if (!isValidYouTubeId(ref.videoId)) return null;
  const params = new URLSearchParams({ v: ref.videoId });
  const start = youtubeStartSeconds(ref, startSeconds);
  if (start >= 1) params.set("t", `${start}s`);
  return `https://www.youtube.com/watch?${params.toString()}`;
}

/** Thumbnail used to test whether YouTube is reachable from this network. */
export function youtubeProbeImageUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/default.jpg`;
}

/**
 * The chapter playing at `seconds` (Bilibili timeline): the last chapter that
 * has started. Null before the first chapter or with no chapters.
 */
export function chapterAt(chapters: readonly Chapter[], seconds: number): Chapter | null {
  let current: Chapter | null = null;
  for (const chapter of chapters) {
    if (
      chapter.startSeconds <= seconds &&
      (!current || chapter.startSeconds >= current.startSeconds)
    ) {
      current = chapter;
    }
  }
  return current;
}
