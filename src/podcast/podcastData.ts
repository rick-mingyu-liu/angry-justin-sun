/**
 * The podcast configuration. Edit this file to point the page at a real video.
 *
 * No real Bilibili video has been supplied yet, so PODCAST is null and the UI
 * shows its "not configured" state.
 *
 * TEMPLATE (uncomment and fill in). Chapter timestamps MUST be checked against
 * the real video before being filled in; do not guess them.
 *
 * export const PODCAST: Podcast | null = {
 *   id: "episode-1",
 *   title: "PLACEHOLDER TITLE",
 *   video: { bvid: "BV__________" },
 *   chapters: [
 *     { id: "intro", title: "PLACEHOLDER CHAPTER", startSeconds: 0 },
 *   ],
 *   clips: [
 *     { id: "clip-1", title: "PLACEHOLDER CLIP", video: { bvid: "BV__________", startSeconds: 0 } },
 *   ],
 * };
 */

import { isValidBvid } from "./bilibili";
import type { Podcast } from "./types";

export const PODCAST: Podcast | null = null as Podcast | null;

/** The configured podcast if its main bvid is valid; clips with invalid bvids are dropped. */
export function getConfiguredPodcast(): Podcast | null {
  if (!PODCAST || !isValidBvid(PODCAST.video.bvid)) return null;
  return { ...PODCAST, clips: PODCAST.clips.filter((clip) => isValidBvid(clip.video.bvid)) };
}
