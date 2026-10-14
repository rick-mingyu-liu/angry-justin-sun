/**
 * Which video platform a visitor starts on. Pure decision rules plus the
 * stored preference; the network probe lives in PodcastPanel.
 *
 * Only an explicit switch is remembered. An automatic choice is made again on
 * each visit, so someone who travels, or turns a VPN on, gets a fresh answer.
 */

import type { PlatformId } from "./types";

const STORAGE_KEY = "angry-podcast:video-platform";

export function isPlatformId(value: unknown): value is PlatformId {
  return value === "bilibili" || value === "youtube";
}

/** Simplified Chinese (mainland) browsers: zh, zh-CN, zh-SG, zh-Hans… */
export function prefersMainlandChinese(browserLanguages: readonly string[]): boolean {
  const first = browserLanguages.find((tag) => typeof tag === "string" && tag !== "");
  if (!first) return false;
  const tag = first.toLowerCase();
  if (!tag.startsWith("zh")) return false;
  return !/^zh-(tw|hk|mo|hant)/.test(tag);
}

export type PlatformDecision =
  | { kind: "decided"; platform: PlatformId }
  /** YouTube is a candidate: test whether it is reachable first. */
  | { kind: "probe" };

/**
 * The first step of the choice:
 * - a remembered choice wins if that platform is configured;
 * - without a YouTube upload there is nothing to choose;
 * - mainland-Chinese browsers start on Bilibili without waiting on a probe;
 * - everyone else starts on YouTube if it turns out to be reachable.
 */
export function decidePlatform(input: {
  stored: unknown;
  youtubeAvailable: boolean;
  browserLanguages: readonly string[];
}): PlatformDecision {
  const { stored, youtubeAvailable, browserLanguages } = input;
  if (!youtubeAvailable) return { kind: "decided", platform: "bilibili" };
  if (isPlatformId(stored)) return { kind: "decided", platform: stored };
  if (prefersMainlandChinese(browserLanguages)) return { kind: "decided", platform: "bilibili" };
  return { kind: "probe" };
}

export function platformAfterProbe(youtubeReachable: boolean): PlatformId {
  return youtubeReachable ? "youtube" : "bilibili";
}

export function readStoredPlatform(): unknown {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storePlatform(platform: PlatformId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, platform);
  } catch {
    // Blocked storage: the switch still works for this page view.
  }
}

export function clearStoredPlatform(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored that we can reach.
  }
}

/**
 * Resolves true if `imageUrl` loads within `timeoutMs`. Used with a YouTube
 * thumbnail: where YouTube is blocked the request fails or hangs.
 */
export function probeImage(imageUrl: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      image.src = "";
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.referrerPolicy = "no-referrer";
    image.src = imageUrl;
  });
}
