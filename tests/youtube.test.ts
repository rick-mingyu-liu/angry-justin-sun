import { describe, expect, it } from "vitest";
import { initialLanguage } from "../src/i18n/language";
import {
  decidePlatform,
  isPlatformId,
  platformAfterProbe,
  prefersMainlandChinese,
} from "../src/podcast/platformChoice";
import type { Chapter } from "../src/podcast/types";
import {
  bilibiliSecondsFromYouTube,
  buildYouTubeWatchUrl,
  chapterAt,
  isValidYouTubeId,
  youtubeStartSeconds,
} from "../src/podcast/youtube";

const ID = "0Z-vhBvBmUY";

describe("isValidYouTubeId", () => {
  it("accepts 11 url-safe characters", () => {
    expect(isValidYouTubeId(ID)).toBe(true);
    expect(isValidYouTubeId("abc_DEF-123")).toBe(true);
  });
  it.each(["", "0Z-vhBvBmU", "0Z-vhBvBmUYx", "0Z vhBvBmUY", "0Z-vhBvBmU?", 5, null, undefined])(
    "rejects %j",
    (value) => {
      expect(isValidYouTubeId(value)).toBe(false);
    }
  );
});

describe("YouTube times", () => {
  it("adds the upload's offset and never goes negative", () => {
    expect(youtubeStartSeconds({ videoId: ID }, 91)).toBe(91);
    expect(youtubeStartSeconds({ videoId: ID, offsetSeconds: 5 }, 91)).toBe(96);
    expect(youtubeStartSeconds({ videoId: ID, offsetSeconds: -10 }, 4)).toBe(0);
    expect(youtubeStartSeconds({ videoId: ID, offsetSeconds: NaN }, 91.8)).toBe(91);
    expect(youtubeStartSeconds({ videoId: ID }, NaN)).toBe(0);
  });
  it("round-trips chapter starts, also with a fractional offset", () => {
    for (const offsetSeconds of [0, 2.5, -3.5, 7]) {
      const ref = { videoId: ID, offsetSeconds };
      for (const start of [10, 100, 482, 15394]) {
        expect(bilibiliSecondsFromYouTube(ref, youtubeStartSeconds(ref, start))).toBe(start);
      }
    }
  });
  it("maps a YouTube time back onto the Bilibili timeline", () => {
    expect(bilibiliSecondsFromYouTube({ videoId: ID }, 120.6)).toBe(121);
    expect(bilibiliSecondsFromYouTube({ videoId: ID }, 120.4)).toBe(120);
    expect(bilibiliSecondsFromYouTube({ videoId: ID, offsetSeconds: 5 }, 96)).toBe(91);
    expect(bilibiliSecondsFromYouTube({ videoId: ID, offsetSeconds: 5 }, 2)).toBe(0);
  });
});

describe("buildYouTubeWatchUrl", () => {
  it("links to the video, with t only from one second on", () => {
    expect(buildYouTubeWatchUrl({ videoId: ID })).toBe(`https://www.youtube.com/watch?v=${ID}`);
    expect(buildYouTubeWatchUrl({ videoId: ID }, 0.5)).toBe(
      `https://www.youtube.com/watch?v=${ID}`
    );
    expect(buildYouTubeWatchUrl({ videoId: ID }, 482)).toBe(
      `https://www.youtube.com/watch?v=${ID}&t=482s`
    );
  });
  it("returns null for an invalid id", () => {
    expect(buildYouTubeWatchUrl({ videoId: "nope" })).toBeNull();
  });
});

describe("chapterAt", () => {
  const chapters: Chapter[] = [
    { id: "a", title: { zh: "甲", en: "A" }, startSeconds: 10 },
    { id: "b", title: { zh: "乙", en: "B" }, startSeconds: 50 },
    { id: "c", title: { zh: "丙", en: "C" }, startSeconds: 90 },
  ];
  it("finds the last chapter that has started", () => {
    expect(chapterAt(chapters, 9)).toBeNull();
    expect(chapterAt(chapters, 10)?.id).toBe("a");
    expect(chapterAt(chapters, 89)?.id).toBe("b");
    expect(chapterAt(chapters, 10_000)?.id).toBe("c");
    expect(chapterAt([], 30)).toBeNull();
  });
  it("does not depend on list order", () => {
    expect(chapterAt([...chapters].reverse(), 60)?.id).toBe("b");
  });
});

describe("platform choice", () => {
  it("recognises mainland Chinese browser languages", () => {
    for (const tag of ["zh", "zh-CN", "zh-cn", "zh-Hans", "zh-SG", "zh-Hans-CN"]) {
      expect(prefersMainlandChinese([tag])).toBe(true);
    }
    for (const tag of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "zh-Hant-TW", "en-US", "ja"]) {
      expect(prefersMainlandChinese([tag])).toBe(false);
    }
    expect(prefersMainlandChinese([])).toBe(false);
    expect(prefersMainlandChinese(["en-US", "zh-CN"])).toBe(false);
  });

  it("uses Bilibili when there is no YouTube upload, whatever was stored", () => {
    expect(
      decidePlatform({ stored: "youtube", youtubeAvailable: false, browserLanguages: ["en-US"] })
    ).toEqual({ kind: "decided", platform: "bilibili" });
  });

  it("keeps a remembered choice", () => {
    expect(
      decidePlatform({ stored: "youtube", youtubeAvailable: true, browserLanguages: ["zh-CN"] })
    ).toEqual({ kind: "decided", platform: "youtube" });
    expect(
      decidePlatform({ stored: "bilibili", youtubeAvailable: true, browserLanguages: ["en-US"] })
    ).toEqual({ kind: "decided", platform: "bilibili" });
  });

  it("starts mainland Chinese browsers on Bilibili without probing", () => {
    expect(
      decidePlatform({ stored: null, youtubeAvailable: true, browserLanguages: ["zh-CN"] })
    ).toEqual({ kind: "decided", platform: "bilibili" });
  });

  it("probes for everyone else and ignores junk in storage", () => {
    expect(
      decidePlatform({ stored: "vimeo", youtubeAvailable: true, browserLanguages: ["en-GB"] })
    ).toEqual({ kind: "probe" });
    expect(
      decidePlatform({ stored: null, youtubeAvailable: true, browserLanguages: ["zh-TW"] })
    ).toEqual({ kind: "probe" });
    expect(platformAfterProbe(true)).toBe("youtube");
    expect(platformAfterProbe(false)).toBe("bilibili");
  });

  it("validates platform ids", () => {
    expect(isPlatformId("bilibili")).toBe(true);
    expect(isPlatformId("youtube")).toBe(true);
    expect(isPlatformId("YouTube")).toBe(false);
    expect(isPlatformId(undefined)).toBe(false);
  });
});

describe("initialLanguage", () => {
  it("prefers a stored choice", () => {
    expect(initialLanguage("en", ["zh-CN"])).toBe("en");
    expect(initialLanguage("zh", ["en-US"])).toBe("zh");
  });
  it("follows the first browser language otherwise", () => {
    expect(initialLanguage(null, ["zh-CN", "en"])).toBe("zh");
    expect(initialLanguage(null, ["zh-TW"])).toBe("zh");
    expect(initialLanguage(null, ["en-US", "zh-CN"])).toBe("en");
    expect(initialLanguage("fr", ["de-DE"])).toBe("en");
  });
  it("falls back to Chinese with no information", () => {
    expect(initialLanguage(undefined, [])).toBe("zh");
    expect(initialLanguage(undefined, [""])).toBe("zh");
  });
});
