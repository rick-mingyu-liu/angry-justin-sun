import { describe, expect, it } from "vitest";
import {
  buildEmbedUrl,
  buildWatchUrl,
  chapterVideoRef,
  formatTimestamp,
  isValidBvid,
} from "../src/podcast/bilibili";
import type { Podcast } from "../src/podcast/types";

const BVID = "BV1xx411c7mD";
const BASE = "https://player.bilibili.com/player.html";

describe("isValidBvid", () => {
  it("accepts BV + 10 alphanumerics", () => {
    expect(isValidBvid(BVID)).toBe(true);
  });
  it.each(["", "BV__________", "bv1xx411c7mD", "BV1xx411c7m", "BV1xx411c7mDx", 5, null, undefined])(
    "rejects %j",
    (v) => {
      expect(isValidBvid(v)).toBe(false);
    }
  );
});

describe("buildEmbedUrl", () => {
  it("builds bvid only with page 1 and autoplay 0", () => {
    expect(buildEmbedUrl({ bvid: BVID })).toBe(`${BASE}?bvid=${BVID}&p=1&autoplay=0`);
  });
  it("includes page", () => {
    expect(buildEmbedUrl({ bvid: BVID, page: 3 })).toBe(`${BASE}?bvid=${BVID}&p=3&autoplay=0`);
  });
  it("includes start time", () => {
    expect(buildEmbedUrl({ bvid: BVID, startSeconds: 90 })).toBe(
      `${BASE}?bvid=${BVID}&p=1&t=90&autoplay=0`
    );
  });
  it("floors fractional start times", () => {
    expect(buildEmbedUrl({ bvid: BVID, startSeconds: 90.9 })).toContain("&t=90&");
  });
  it.each([-5, 0, 0.5, NaN, Infinity])("omits t for %s", (s) => {
    expect(buildEmbedUrl({ bvid: BVID, startSeconds: s })).not.toContain("t=");
  });
  it.each([0, -1, 1.5, NaN])("falls back to p=1 for page %s", (page) => {
    expect(buildEmbedUrl({ bvid: BVID, page })).toContain("&p=1&");
  });
  it("returns null for an invalid bvid", () => {
    expect(buildEmbedUrl({ bvid: "nope" })).toBeNull();
  });
});

describe("buildWatchUrl", () => {
  it("builds the watch page url", () => {
    expect(buildWatchUrl({ bvid: BVID })).toBe(`https://www.bilibili.com/video/${BVID}/?p=1`);
    expect(buildWatchUrl({ bvid: BVID, page: 2, startSeconds: 61.7 })).toBe(
      `https://www.bilibili.com/video/${BVID}/?p=2&t=61`
    );
  });
  it("omits invalid t and returns null for invalid bvid", () => {
    expect(buildWatchUrl({ bvid: BVID, startSeconds: -3 })).not.toContain("t=");
    expect(buildWatchUrl({ bvid: "bad" })).toBeNull();
  });
});

describe("chapterVideoRef", () => {
  it("combines the main video with the chapter start", () => {
    const podcast: Podcast = {
      id: "p",
      title: "t",
      video: { bvid: BVID, page: 2, startSeconds: 5 },
      chapters: [],
      clips: [],
    };
    expect(chapterVideoRef(podcast, { id: "c", title: "c", startSeconds: 120 })).toEqual({
      bvid: BVID,
      page: 2,
      startSeconds: 120,
    });
  });
});

describe("formatTimestamp", () => {
  it.each([
    [0, "00:00"],
    [5, "00:05"],
    [65, "01:05"],
    [3599, "59:59"],
    [3600, "1:00:00"],
    [3725, "1:02:05"],
    [65.9, "01:05"],
    [-4, "00:00"],
    [NaN, "00:00"],
  ])("%s -> %s", (input, expected) => {
    expect(formatTimestamp(input)).toBe(expected);
  });
});
