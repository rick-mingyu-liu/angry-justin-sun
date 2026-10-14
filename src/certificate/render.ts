/**
 * Graduation certificate: the canvas renderer. One drawing routine serves both the on-screen
 * preview and the PNG export, so they cannot disagree. All text comes from the model and is
 * drawn with fillText; the decorations are paths (see ornaments.ts) and the two characters are
 * the only bitmaps.
 */

import type { Language } from "../i18n/language";
import {
  drawBanner,
  drawFlourish,
  drawFrame,
  drawLaurel,
  drawRosette,
  drawSparkle,
  drawStar,
  drawStarRule,
  drawWalnut,
} from "./ornaments";
import {
  CERTIFICATE_ASSET_PATHS,
  CERTIFICATE_FONT_FAMILY,
  CERTIFICATE_FONT_NON_ASCII,
  CERTIFICATE_FONT_STACK,
  CERTIFICATE_SYSTEM_FONT_STACK,
  CERTIFICATE_HEIGHT,
  CERTIFICATE_WIDTH,
  type CertificateModel,
} from "./types";

export interface CertificateAssets {
  standard: HTMLImageElement;
  muscle: HTMLImageElement;
}

type Ctx = CanvasRenderingContext2D;

// --- Palette -------------------------------------------------------------------------------

const PAPER = "#FFF8E8";
const INK = "#3A220F";
const GOLD = "#B58A35";
const GOLD_LIGHT = "#E9D29A";
const GOLD_DEEP = "#8F6A22";
const SEAL_RED = "#B62828";
const VIGNETTE_EDGE = "rgba(168, 118, 44, 0.16)";
const VIGNETTE_CLEAR = "rgba(168, 118, 44, 0)";
const TITLE_GLOW = "rgba(181, 138, 53, 0.42)";
const GROUND_SHADOW = "rgba(92, 58, 20, 0.26)";
const GROUND_SHADOW_CLEAR = "rgba(92, 58, 20, 0)";

// --- Paper ---------------------------------------------------------------------------------

const PAPER_FLECK_COUNT = 1400;
const PAPER_FLECK_SEED = 20261013;

// --- Centre column (all y values are the visual centre of the line) --------------------------

const CENTRE_X = CERTIFICATE_WIDTH / 2;
/** Vertical centre of a line sits this many em above its alphabetic baseline. */
const BASELINE_SHIFT = 0.35;
const FONT_STEP = 2;

// A style's `en` entries replace its values on the English certificate: Latin
// text wants much tighter letter spacing than CJK, and its lines run longer.

const INSTITUTION = {
  y: 132,
  size: 48,
  minSize: 30,
  maxWidth: 560,
  tracking: 0.08,
  en: { size: 40, tracking: 0.01 },
};
const INSTITUTION_TRANSLATION = { y: 177, size: 22, minSize: 14, maxWidth: 620, tracking: 0.26 };
const INSTITUTION_LAUREL = { offsetX: 318, baseY: 214, length: 158, lean: 0.95, bend: 1.25 };
const INSTITUTION_STARS = [
  { dx: 452, y: 150, r: 8 },
  { dx: 486, y: 172, r: 5 },
];
const INSTITUTION_RULE = { y: 212, halfWidth: 150, star: 8 };

const TITLE = {
  y: 306,
  size: 168,
  minSize: 96,
  maxWidth: 1080,
  tracking: 0.03,
  en: { size: 132, tracking: 0 },
};
const TITLE_GLOW_OFFSET = 4;
const TITLE_FLOURISH = { gap: 34, size: 178, minX: 130 };
const TITLE_STARS = [
  { dx: 752, dy: 14, r: 9 },
  { dx: 716, dy: 78, r: 6 },
];

const SUBTITLE = { y: 420, size: 30, minSize: 18, maxWidth: 640, tracking: 0.24 };
const SUBTITLE_RULE = { gap: 28, halfWidth: 430 };

/** The recipient has a fixed box; everything below it stays put whatever the name is. */
const RECIPIENT = {
  y: 522,
  maxWidth: 740,
  size: 108,
  singleFloor: 64,
  twoLineSize: 62,
  twoLineFloor: 44,
  lineHeight: 1.16,
  tracking: 0,
};
const RECIPIENT_RULE = { y: 606, halfWidth: 236, star: 7 };
const ELLIPSIS = "…";

const BODY = {
  y: 656,
  size: 40,
  minSize: 26,
  maxWidth: 740,
  tracking: 0.04,
  en: { tracking: 0.01 },
};
const SECOND_LINE = {
  y: 714,
  size: 40,
  minSize: 26,
  maxWidth: 740,
  tracking: 0.04,
  en: { size: 32, minSize: 22, tracking: 0.005 },
};

const STATS = {
  y: 790,
  columnOffset: 262,
  columnWidth: 226,
  size: 32,
  minSize: 20,
  tracking: 0.03,
  en: { size: 30, tracking: 0.005 },
};
const STATS_DATE = {
  labelDy: -21,
  labelSize: 24,
  labelTracking: 0.1,
  textDy: 19,
  textSize: 30,
  minSize: 18,
  en: { labelSize: 22, labelTracking: 0.06 },
};
const STATS_DIVIDER = { halfHeight: 34 };
const STATS_RULE = { dy: 50, halfWidth: 46, star: 5 };

const SEAL = { y: 950, radius: 92, rotation: -0.13, alpha: 0.93 };
const SEAL_TEXT = { dy: 30, size: 46, minSize: 24, maxWidth: 134, tracking: 0.02 };
/** Seal text too long for one line (the English one) is broken at a space into two. */
const SEAL_TWO_LINES = {
  dy: [12, 42],
  size: 26,
  minSize: 16,
  maxWidth: [150, 128],
  tracking: 0.02,
};
const SEAL_FLOURISH = { gap: 26, size: 132 };

const FOOT_INSTITUTION = {
  y: 1072,
  size: 28,
  minSize: 18,
  maxWidth: 520,
  tracking: 0.1,
  en: { tracking: 0.02 },
};
const FOOTER = {
  y: 1112,
  size: 23,
  minSize: 15,
  maxWidth: 640,
  tracking: 0.12,
  en: { tracking: 0.01 },
};
const FOOTER_RULE = { gap: 22, length: 96 };

// --- Characters ----------------------------------------------------------------------------

/** Each character is placed by the centre of its feet and its drawn height. */
const STANDARD_NUT = { x: 296, footY: 1036, height: 408 };
const MUSCLE_NUT = { x: 1506, footY: 1046, height: 596 };
const GROUND = { widthRatio: 0.62, heightRatio: 0.085, lift: 0.012 };
const CHARACTER_LAUREL = { offset: 0.33, length: 74, lean: 0.55, bend: 0.4 };
const SPARKLES = [
  { x: 112, y: 716, r: 15 },
  { x: 496, y: 742, r: 12 },
  { x: 470, y: 632, r: 9 },
  { x: 98, y: 846, r: 9 },
  { x: 134, y: 626, r: 8 },
  { x: 1296, y: 588, r: 12 },
  { x: 1716, y: 556, r: 15 },
  { x: 1318, y: 668, r: 8 },
  { x: 1694, y: 470, r: 9 },
];
/** Short rays fanned over the ordinary walnut's head, as radius range and angles (degrees). */
const HEAD_RAYS = { centreDy: 0.5, inner: 224, outer: 252, angles: [-126, -110, -70, -54] };

// --- Excellent badge (only drawn when model.excellent) ---------------------------------------

const BADGE = { x: 292, y: 470, radius: 54, bannerDy: 38, bannerHeight: 46, rotation: -0.07 };
const BADGE_TEXT = {
  size: 28,
  minSize: 16,
  maxWidth: 232,
  tracking: 0.08,
  padding: 26,
  en: { tracking: 0.02 },
};

// --- Text helpers --------------------------------------------------------------------------

type FontWeight = 700 | 900;

interface LineStyle {
  y: number;
  size: number;
  minSize: number;
  maxWidth: number;
  tracking: number;
}

/** The style for `language`: its `en` entries applied on the English certificate. */
function styleFor<T extends object>(style: T & { en?: Partial<T> }, language: Language): T {
  const { en, ...base } = style;
  return (language === "en" ? { ...base, ...en } : base) as T;
}

interface SegmenterLike {
  segment(input: string): Iterable<{ segment: string }>;
}

/** Splits into user-perceived characters so emoji sequences are never cut in half. */
function graphemes(text: string): string[] {
  const ctor = (
    Intl as unknown as {
      Segmenter?: new (locale?: string, options?: { granularity: "grapheme" }) => SegmenterLike;
    }
  ).Segmenter;
  if (!ctor) return Array.from(text);
  return Array.from(new ctor(undefined, { granularity: "grapheme" }).segment(text), (part) => {
    return part.segment;
  });
}

/** Swapped to the system stack while drawing a name the bundled subset cannot fully cover. */
let activeFontStack: string = CERTIFICATE_FONT_STACK;

function setFont(ctx: Ctx, weight: FontWeight, size: number): void {
  ctx.font = `${weight} ${size}px ${activeFontStack}`;
}

const SUBSET_NON_ASCII = new Set(CERTIFICATE_FONT_NON_ASCII);

/** True when every character is in the bundled subset (printable ASCII, or its listed extras). */
function subsetCovers(text: string): boolean {
  return Array.from(text).every((char) => {
    const code = char.charCodeAt(0);
    return (code >= 0x20 && code < 0x7f) || SUBSET_NON_ASCII.has(char);
  });
}

/** Width of `text` in the current font with `spacing` px between graphemes. */
function measure(ctx: Ctx, text: string, spacing: number): number {
  if (spacing === 0) return ctx.measureText(text).width;
  const parts = graphemes(text);
  let width = Math.max(0, parts.length - 1) * spacing;
  for (const part of parts) width += ctx.measureText(part).width;
  return width;
}

/** Largest size from `size` down to `minSize` at which the text fits; sets ctx.font to it. */
function fitSize(ctx: Ctx, text: string, weight: FontWeight, style: Omit<LineStyle, "y">): number {
  let size = style.size;
  setFont(ctx, weight, size);
  while (size > style.minSize && measure(ctx, text, size * style.tracking) > style.maxWidth) {
    size = Math.max(style.minSize, size - FONT_STEP);
    setFont(ctx, weight, size);
  }
  return size;
}

/**
 * Draws one horizontally centred line in the current font. Letter-spaced text is placed
 * grapheme by grapheme; `maxWidth` is a final guard that squeezes rather than overflows.
 */
function fillCentred(
  ctx: Ctx,
  text: string,
  cx: number,
  baseline: number,
  spacing: number,
  maxWidth: number
): void {
  ctx.textBaseline = "alphabetic";
  if (spacing === 0) {
    ctx.textAlign = "center";
    ctx.fillText(text, cx, baseline, maxWidth);
    return;
  }
  const width = measure(ctx, text, spacing);
  const squeeze = width > maxWidth ? maxWidth / width : 1;
  ctx.textAlign = "left";
  let x = cx - (width * squeeze) / 2;
  for (const part of graphemes(text)) {
    const advance = ctx.measureText(part).width;
    ctx.fillText(part, x, baseline, advance * squeeze);
    x += (advance + spacing) * squeeze;
  }
}

/** Fits and draws one centred line; returns the width it took. */
function drawLine(
  ctx: Ctx,
  text: string,
  weight: FontWeight,
  style: LineStyle,
  colour: string,
  cx = CENTRE_X
): number {
  const size = fitSize(ctx, text, weight, style);
  const spacing = size * style.tracking;
  ctx.fillStyle = colour;
  fillCentred(ctx, text, cx, style.y + size * BASELINE_SHIFT, spacing, style.maxWidth);
  return Math.min(style.maxWidth, measure(ctx, text, spacing));
}

// --- Recipient fitting ---------------------------------------------------------------------

interface RecipientLayout {
  lines: string[];
  size: number;
}

function isBlank(part: string): boolean {
  return part.trim() === "";
}

/** A break between words: at a space or after a hyphen. */
function isWordBreak(parts: string[], i: number): boolean {
  return isBlank(parts[i - 1]) || isBlank(parts[i]) || parts[i - 1] === "-";
}

/**
 * The most even two-line split in which both lines fit. A split between words always wins over
 * one inside a word, so a Latin name is never cut mid-word when a word break fits.
 */
function splitInTwo(ctx: Ctx, parts: string[]): string[] | null {
  let best: string[] | null = null;
  let bestCost = Infinity;
  for (let i = 1; i < parts.length; i++) {
    const first = parts.slice(0, i).join("").trimEnd();
    const second = parts.slice(i).join("").trimStart();
    if (!first || !second) continue;
    const a = ctx.measureText(first).width;
    const b = ctx.measureText(second).width;
    if (a > RECIPIENT.maxWidth || b > RECIPIENT.maxWidth) continue;
    const cost = Math.abs(a - b) + (isWordBreak(parts, i) ? 0 : RECIPIENT.maxWidth);
    if (cost < bestCost) {
      bestCost = cost;
      best = [first, second];
    }
  }
  return best;
}

/** Longest prefix of `parts` that fits together with `suffix`; at least one grapheme. */
function takeFitting(ctx: Ctx, parts: string[], suffix: string): number {
  let count = 1;
  while (
    count < parts.length &&
    ctx.measureText(parts.slice(0, count + 1).join("") + suffix).width <= RECIPIENT.maxWidth
  ) {
    count++;
  }
  return count;
}

/**
 * Fit-to-width for the recipient: one line shrinking to a floor, then two lines shrinking to a
 * smaller floor, then two lines with an ellipsis. Leaves ctx.font at the chosen size.
 */
function layoutRecipient(ctx: Ctx, text: string): RecipientLayout {
  const name = text.trim();
  const parts = graphemes(name);

  for (let size = RECIPIENT.size; size >= RECIPIENT.singleFloor; size -= FONT_STEP) {
    setFont(ctx, 700, size);
    if (ctx.measureText(name).width <= RECIPIENT.maxWidth) return { lines: [name], size };
  }
  if (parts.length < 2) return { lines: [name], size: RECIPIENT.singleFloor };

  for (let size = RECIPIENT.twoLineSize; size >= RECIPIENT.twoLineFloor; size -= FONT_STEP) {
    setFont(ctx, 700, size);
    const lines = splitInTwo(ctx, parts);
    if (lines) return { lines, size };
  }

  const size = RECIPIENT.twoLineFloor;
  setFont(ctx, 700, size);
  const firstCount = takeFitting(ctx, parts, "");
  const rest = parts.slice(firstCount);
  const first = parts.slice(0, firstCount).join("").trimEnd();
  if (rest.length === 0) return { lines: [first], size };
  const whole = rest.join("").trimStart();
  if (ctx.measureText(whole).width <= RECIPIENT.maxWidth) return { lines: [first, whole], size };
  const kept = rest
    .slice(0, takeFitting(ctx, rest, ELLIPSIS))
    .join("")
    .trim();
  return { lines: [first, kept + ELLIPSIS], size };
}

function drawRecipient(ctx: Ctx, text: string): void {
  // A name is arbitrary text: unless the subset has all of it, use one system
  // face for the whole name instead of mixing two per character.
  activeFontStack = subsetCovers(text) ? CERTIFICATE_FONT_STACK : CERTIFICATE_SYSTEM_FONT_STACK;
  try {
    drawRecipientLines(ctx, text);
  } finally {
    activeFontStack = CERTIFICATE_FONT_STACK;
  }
}

function drawRecipientLines(ctx: Ctx, text: string): void {
  const { lines, size } = layoutRecipient(ctx, text);
  const lineHeight = size * RECIPIENT.lineHeight;
  const firstY = RECIPIENT.y - ((lines.length - 1) * lineHeight) / 2;
  ctx.fillStyle = INK;
  lines.forEach((line, index) => {
    const baseline = firstY + index * lineHeight + size * BASELINE_SHIFT;
    fillCentred(ctx, line, CENTRE_X, baseline, size * RECIPIENT.tracking, RECIPIENT.maxWidth);
  });
}

// --- Sections ------------------------------------------------------------------------------

/** Small deterministic generator, so the paper grain is identical on every draw. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPaper(ctx: Ctx): void {
  const w = CERTIFICATE_WIDTH;
  const h = CERTIFICATE_HEIGHT;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, w * 0.66);
  vignette.addColorStop(0, VIGNETTE_CLEAR);
  vignette.addColorStop(1, VIGNETTE_EDGE);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const random = seededRandom(PAPER_FLECK_SEED);
  ctx.fillStyle = GOLD_DEEP;
  for (let i = 0; i < PAPER_FLECK_COUNT; i++) {
    const x = random() * w;
    const y = random() * h;
    const length = 2 + random() * 9;
    const angle = random() * Math.PI;
    ctx.globalAlpha = 0.02 + random() * 0.035;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillRect(-length / 2, -0.5, length, 1);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawHeader(ctx: Ctx, model: CertificateModel): void {
  for (const side of [-1, 1] as const) {
    const lean = -Math.PI / 2 + side * INSTITUTION_LAUREL.lean;
    drawLaurel(
      ctx,
      CENTRE_X + side * INSTITUTION_LAUREL.offsetX,
      INSTITUTION_LAUREL.baseY,
      INSTITUTION_LAUREL.length,
      lean,
      -side * INSTITUTION_LAUREL.bend,
      GOLD
    );
    for (const star of INSTITUTION_STARS) {
      drawStar(ctx, CENTRE_X + side * star.dx, star.y, star.r, GOLD);
    }
  }
  drawLine(ctx, model.institution, 700, styleFor(INSTITUTION, model.language), INK);
  drawLine(ctx, model.institutionTranslation, 700, INSTITUTION_TRANSLATION, INK);
  drawStarRule(
    ctx,
    CENTRE_X,
    INSTITUTION_RULE.y,
    INSTITUTION_RULE.halfWidth,
    INSTITUTION_RULE.star,
    GOLD
  );
}

function drawTitle(ctx: Ctx, model: CertificateModel): void {
  const style = styleFor(TITLE, model.language);
  const size = fitSize(ctx, model.title, 900, style);
  const spacing = size * style.tracking;
  const baseline = style.y + size * BASELINE_SHIFT;
  ctx.fillStyle = TITLE_GLOW;
  fillCentred(ctx, model.title, CENTRE_X, baseline + TITLE_GLOW_OFFSET, spacing, style.maxWidth);
  ctx.fillStyle = INK;
  fillCentred(ctx, model.title, CENTRE_X, baseline, spacing, style.maxWidth);

  const half = Math.min(style.maxWidth, measure(ctx, model.title, spacing)) / 2;
  for (const side of [-1, 1] as const) {
    const reach = Math.min(
      half + TITLE_FLOURISH.gap,
      CENTRE_X - TITLE_FLOURISH.minX - TITLE_FLOURISH.size
    );
    drawFlourish(ctx, CENTRE_X + side * reach, TITLE.y + 8, TITLE_FLOURISH.size, side, -1, GOLD);
    for (const star of TITLE_STARS) {
      drawStar(ctx, CENTRE_X + side * star.dx, TITLE.y + star.dy, star.r, GOLD);
    }
  }
}

function drawSubtitle(ctx: Ctx, model: CertificateModel): void {
  const width = drawLine(ctx, model.subtitle, 700, SUBTITLE, INK);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    ctx.moveTo(CENTRE_X + side * (width / 2 + SUBTITLE_RULE.gap), SUBTITLE.y);
    ctx.lineTo(CENTRE_X + side * SUBTITLE_RULE.halfWidth, SUBTITLE.y);
  }
  ctx.stroke();
  for (const side of [-1, 1]) {
    drawStar(ctx, CENTRE_X + side * SUBTITLE_RULE.halfWidth, SUBTITLE.y, 5, GOLD, 2, 0.6);
  }
}

function drawStatistics(ctx: Ctx, model: CertificateModel): void {
  const stats = styleFor(STATS, model.language);
  const date = styleFor(STATS_DATE, model.language);
  const left = CENTRE_X - STATS.columnOffset;
  const right = CENTRE_X + STATS.columnOffset;
  const column = {
    size: stats.size,
    minSize: stats.minSize,
    maxWidth: STATS.columnWidth,
    tracking: stats.tracking,
  };
  // The two counts share one size, so a longer label does not make its column look smaller.
  const countSize = Math.min(
    fitSize(ctx, model.clearedText, 700, column),
    fitSize(ctx, model.starsText, 700, column)
  );
  const counts = { ...column, y: STATS.y, size: countSize };
  drawLine(ctx, model.clearedText, 700, counts, INK, left);
  drawLine(ctx, model.starsText, 700, counts, INK, CENTRE_X);
  drawLine(
    ctx,
    model.dateLabel,
    700,
    {
      ...column,
      y: STATS.y + date.labelDy,
      size: date.labelSize,
      minSize: 14,
      tracking: date.labelTracking,
    },
    INK,
    right
  );
  drawLine(
    ctx,
    model.dateText,
    700,
    {
      ...column,
      y: STATS.y + date.textDy,
      size: date.textSize,
      minSize: date.minSize,
    },
    INK,
    right
  );

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const x = CENTRE_X + (side * STATS.columnOffset) / 2;
    ctx.moveTo(x, STATS.y - STATS_DIVIDER.halfHeight);
    ctx.lineTo(x, STATS.y + STATS_DIVIDER.halfHeight);
  }
  ctx.stroke();
  for (const x of [left, CENTRE_X, right]) {
    drawStarRule(ctx, x, STATS.y + STATS_RULE.dy, STATS_RULE.halfWidth, STATS_RULE.star, GOLD);
  }
}

/** A fictional round stamp: rings, stars, a walnut between laurel sprigs and the seal text. */
function drawSeal(ctx: Ctx, model: CertificateModel): void {
  for (const side of [-1, 1] as const) {
    const x = CENTRE_X + side * (SEAL.radius + SEAL_FLOURISH.gap);
    drawFlourish(ctx, x, SEAL.y + 22, SEAL_FLOURISH.size, side, -1, GOLD);
  }

  const r = SEAL.radius;
  ctx.save();
  ctx.translate(CENTRE_X, SEAL.y);
  ctx.rotate(SEAL.rotation);
  ctx.globalAlpha = SEAL.alpha;
  ctx.strokeStyle = SEAL_RED;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  ctx.arc(0, 0, r - 13, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = -2; i <= 2; i++) {
    const a = -Math.PI / 2 + i * 0.21;
    drawStar(ctx, Math.cos(a) * (r - 24), Math.sin(a) * (r - 24), i === 0 ? 6 : 4.5, SEAL_RED);
  }
  for (let i = -1; i <= 1; i++) {
    const a = Math.PI / 2 + i * 0.26;
    drawStar(ctx, Math.cos(a) * (r - 25), Math.sin(a) * (r - 25), 5, SEAL_RED);
  }
  drawWalnut(ctx, 0, -27, 20, SEAL_RED, PAPER);
  for (const side of [-1, 1]) {
    drawLaurel(ctx, side * 22, -4, 54, -Math.PI / 2 + side * 1.1, side * -1.15, SEAL_RED);
  }
  drawSealText(ctx, model.seal);
  ctx.restore();
}

/**
 * The seal text under the walnut, in capitals like a rubber stamp (Chinese is unaffected). One
 * line when it fits at the minimum size; otherwise two lines at one shared size.
 */
function drawSealText(ctx: Ctx, text: string): void {
  const stamp = text.toUpperCase();
  setFont(ctx, 900, SEAL_TEXT.minSize);
  const words = stamp.split(" ");
  if (
    words.length < 2 ||
    measure(ctx, stamp, SEAL_TEXT.minSize * SEAL_TEXT.tracking) <= SEAL_TEXT.maxWidth
  ) {
    drawLine(ctx, stamp, 900, { ...SEAL_TEXT, y: SEAL_TEXT.dy }, SEAL_RED, 0);
    return;
  }
  const two = SEAL_TWO_LINES;
  // The split that allows the largest shared size wins (the lower line has the narrower chord).
  let best = { lines: [stamp, ""], size: 0 };
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const size = Math.min(
      ...lines.map((line, row) => {
        const style = { ...two, maxWidth: two.maxWidth[row] };
        return fitSize(ctx, line, 900, style);
      })
    );
    if (size > best.size) best = { lines, size };
  }
  best.lines.forEach((line, row) => {
    const style = { ...two, y: two.dy[row], size: best.size, maxWidth: two.maxWidth[row] };
    drawLine(ctx, line, 900, style, SEAL_RED, 0);
  });
}

function drawFooter(ctx: Ctx, model: CertificateModel): void {
  const footer = styleFor(FOOTER, model.language);
  drawLine(ctx, model.institution, 700, styleFor(FOOT_INSTITUTION, model.language), INK);
  const width = drawLine(ctx, model.footer, 700, footer, INK);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    const from = CENTRE_X + side * (width / 2 + FOOTER_RULE.gap);
    ctx.moveTo(from, footer.y);
    ctx.lineTo(from + side * FOOTER_RULE.length, footer.y);
  }
  ctx.stroke();
  for (const side of [-1, 1]) {
    drawStar(ctx, CENTRE_X + side * (width / 2 + FOOTER_RULE.gap), FOOTER.y, 4, GOLD, 2, 0.6);
  }
}

interface Placement {
  x: number;
  footY: number;
  height: number;
}

/** Draws a character unaltered at its natural aspect ratio, on a soft ground shadow. */
function drawCharacter(ctx: Ctx, image: HTMLImageElement, place: Placement): void {
  const width = (place.height * image.naturalWidth) / image.naturalHeight;
  const shadowY = place.footY - place.height * GROUND.lift;
  const rx = (width * GROUND.widthRatio) / 2 + width * 0.12;
  const ry = place.height * GROUND.heightRatio * 0.5 + 10;

  for (const side of [-1, 1]) {
    drawLaurel(
      ctx,
      place.x + side * width * CHARACTER_LAUREL.offset,
      shadowY - 4,
      CHARACTER_LAUREL.length,
      -Math.PI / 2 + side * CHARACTER_LAUREL.lean,
      side * -CHARACTER_LAUREL.bend,
      GOLD
    );
  }

  ctx.save();
  ctx.translate(place.x, shadowY);
  ctx.scale(1, ry / rx);
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  shadow.addColorStop(0, GROUND_SHADOW);
  shadow.addColorStop(0.55, GROUND_SHADOW);
  shadow.addColorStop(1, GROUND_SHADOW_CLEAR);
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, place.x - width / 2, place.footY - place.height, width, place.height);
}

function drawCharacters(ctx: Ctx, assets: CertificateAssets): void {
  drawCharacter(ctx, assets.standard, STANDARD_NUT);
  drawCharacter(ctx, assets.muscle, MUSCLE_NUT);

  for (const sparkle of SPARKLES) drawSparkle(ctx, sparkle.x, sparkle.y, sparkle.r, GOLD);

  const cy = STANDARD_NUT.footY - STANDARD_NUT.height * HEAD_RAYS.centreDy;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (const degrees of HEAD_RAYS.angles) {
    const a = (degrees * Math.PI) / 180;
    ctx.moveTo(STANDARD_NUT.x + Math.cos(a) * HEAD_RAYS.inner, cy + Math.sin(a) * HEAD_RAYS.inner);
    ctx.lineTo(STANDARD_NUT.x + Math.cos(a) * HEAD_RAYS.outer, cy + Math.sin(a) * HEAD_RAYS.outer);
  }
  ctx.stroke();
  ctx.lineCap = "butt";
}

/** A gold rosette with the badge text on a ribbon, in the empty space above the ordinary walnut. */
function drawExcellentBadge(ctx: Ctx, text: string, language: Language): void {
  const textStyle = styleFor(BADGE_TEXT, language);
  ctx.save();
  ctx.translate(BADGE.x, BADGE.y);
  ctx.rotate(BADGE.rotation);
  drawRosette(ctx, 0, 0, BADGE.radius, GOLD, GOLD_DEEP, PAPER);
  drawStar(ctx, 0, -6, BADGE.radius * 0.4, PAPER);

  const size = fitSize(ctx, text, 700, textStyle);
  const spacing = size * textStyle.tracking;
  const width = Math.min(textStyle.maxWidth, measure(ctx, text, spacing)) + textStyle.padding * 2;
  drawBanner(ctx, 0, BADGE.bannerDy, width, BADGE.bannerHeight, GOLD_LIGHT, GOLD_DEEP, GOLD);
  ctx.fillStyle = INK;
  fillCentred(ctx, text, 0, BADGE.bannerDy + size * BASELINE_SHIFT, spacing, textStyle.maxWidth);
  ctx.restore();
}

// --- Public API ----------------------------------------------------------------------------

/**
 * Sets the canvas to 1800x1200 and draws the whole certificate. A pure function of
 * (model, assets): the preview and the PNG export both come from this call.
 */
export function drawCertificate(
  canvas: HTMLCanvasElement,
  model: CertificateModel,
  assets: CertificateAssets
): void {
  canvas.width = CERTIFICATE_WIDTH;
  canvas.height = CERTIFICATE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建证书画布。");

  drawPaper(ctx);
  drawFrame(ctx, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT, GOLD, PAPER);
  drawHeader(ctx, model);
  drawTitle(ctx, model);
  drawSubtitle(ctx, model);
  drawCharacters(ctx, assets);
  if (model.excellent) drawExcellentBadge(ctx, model.excellentBadge, model.language);
  drawRecipient(ctx, model.recipient);
  drawStarRule(
    ctx,
    CENTRE_X,
    RECIPIENT_RULE.y,
    RECIPIENT_RULE.halfWidth,
    RECIPIENT_RULE.star,
    GOLD
  );
  drawLine(ctx, model.body, 700, styleFor(BODY, model.language), INK);
  drawLine(ctx, model.secondLine, 700, styleFor(SECOND_LINE, model.language), INK);
  drawStatistics(ctx, model);
  drawSeal(ctx, model);
  drawFooter(ctx, model);
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`证书图片加载失败：${path}`));
    image.src = path;
  });
}

/** Registers one weight of the bundled font. Never rejects: the system serif stands in. */
async function loadFont(path: string, weight: FontWeight): Promise<void> {
  if (typeof FontFace === "undefined") return;
  try {
    const face = new FontFace(CERTIFICATE_FONT_FAMILY, `url("${path}") format("woff2")`, {
      weight: String(weight),
      style: "normal",
    });
    document.fonts.add(await face.load());
  } catch {
    // Missing or unreadable font file: CERTIFICATE_FONT_STACK falls through to a system serif.
  }
}

let fontsPromise: Promise<void> | null = null;
let assetsPromise: Promise<CertificateAssets> | null = null;

function loadFonts(): Promise<void> {
  fontsPromise ??= Promise.all([
    loadFont(CERTIFICATE_ASSET_PATHS.fontBold, 700),
    loadFont(CERTIFICATE_ASSET_PATHS.fontBlack, 900),
  ]).then(() => undefined);
  return fontsPromise;
}

/**
 * Loads both character images and the bundled font. Resolves when the images are decoded and
 * the fonts have settled; rejects only when an image cannot be loaded. Cached, and the cache is
 * dropped on rejection so that a retry starts again.
 */
export function loadCertificateAssets(): Promise<CertificateAssets> {
  if (assetsPromise) return assetsPromise;
  const pending = Promise.all([
    loadImage(CERTIFICATE_ASSET_PATHS.standard),
    loadImage(CERTIFICATE_ASSET_PATHS.muscle),
    loadFonts(),
  ]).then(([standard, muscle]) => ({ standard, muscle }));
  assetsPromise = pending;
  pending.catch(() => {
    if (assetsPromise === pending) assetsPromise = null;
  });
  return pending;
}

/** canvas.toBlob as a Promise, always PNG. */
export function certificateToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("证书图片导出失败，请重试。"));
      }, "image/png");
    } catch (error) {
      reject(new Error(`证书图片导出失败：${String(error)}`));
    }
  });
}
