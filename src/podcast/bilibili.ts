/**
 * BilibiliAdapter: pure URL helpers for the official external iframe player
 * (https://player.bilibili.com/player.html). No DOM access.
 */

import type { Chapter, Podcast, VideoRef } from "./types";

const BVID_PATTERN = /^BV[0-9A-Za-z]{10}$/;

export function isValidBvid(value: unknown): value is string {
  return typeof value === "string" && BVID_PATTERN.test(value);
}

function validPage(page: number | undefined): number {
  return typeof page === "number" && Number.isInteger(page) && page >= 1 ? page : 1;
}

function validStart(seconds: number | undefined): number | null {
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 1
    ? Math.floor(seconds)
    : null;
}

export function buildEmbedUrl(video: VideoRef): string | null {
  if (!isValidBvid(video.bvid)) return null;
  const params = new URLSearchParams({ bvid: video.bvid, p: String(validPage(video.page)) });
  const start = validStart(video.startSeconds);
  if (start !== null) params.set("t", String(start));
  params.set("autoplay", "0");
  return `https://player.bilibili.com/player.html?${params.toString()}`;
}

export function buildWatchUrl(video: VideoRef): string | null {
  if (!isValidBvid(video.bvid)) return null;
  const params = new URLSearchParams({ p: String(validPage(video.page)) });
  const start = validStart(video.startSeconds);
  if (start !== null) params.set("t", String(start));
  return `https://www.bilibili.com/video/${video.bvid}/?${params.toString()}`;
}

export function chapterVideoRef(podcast: Podcast, chapter: Chapter): VideoRef {
  return { ...podcast.video, startSeconds: chapter.startSeconds };
}

export function formatTimestamp(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${String(m).padStart(2, "0")}:${ss}`;
}
