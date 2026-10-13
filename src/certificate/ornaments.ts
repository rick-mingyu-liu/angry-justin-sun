/**
 * Graduation certificate: the drawn decorations. Everything here is a canvas path (no bitmaps),
 * positioned by the caller; nothing reads the model.
 */

type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;

/** Frame geometry, as insets from the canvas edge. */
const FRAME_OUTER_INSET = 22;
const FRAME_OUTER_WIDTH = 4;
const FRAME_SECOND_INSET = 33;
const FRAME_SECOND_WIDTH = 1.25;
const FRAME_INNER_INSET = 56;
const FRAME_INNER_WIDTH = 1.75;
const FRAME_NOTCH_RADIUS = 56;
const CORNER_WALNUT_OFFSET = 15;
const CORNER_WALNUT_RADIUS = 21;
const CORNER_SCROLL_START = 66;
const CORNER_SCROLL_DEPTH = 14;
const CORNER_SCROLL_SIZE = 124;
const TOP_WALNUT_RADIUS = 19;

/** A star with `points` tips; four thin points make a sparkle. */
export function drawStar(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  colour: string,
  points = 5,
  innerRatio = 0.42
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : radius * innerRatio;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

export function drawSparkle(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  colour: string
): void {
  drawStar(ctx, cx, cy, radius, colour, 4, 0.2);
}

function drawDiamond(ctx: Ctx, cx: number, cy: number, radius: number, colour: string): void {
  drawStar(ctx, cx, cy, radius, colour, 2, 0.6);
}

/** One pointed leaf from the origin along `angle`. */
function leaf(ctx: Ctx, x: number, y: number, angle: number, length: number): void {
  const width = length * 0.32;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.45, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.45, width, 0, 0);
  ctx.fill();
  ctx.restore();
}

/**
 * A laurel sprig growing from (x, y) in direction `angle` (radians, 0 = right) and curving by
 * `bend` radians over its length.
 */
export function drawLaurel(
  ctx: Ctx,
  x: number,
  y: number,
  length: number,
  angle: number,
  bend: number,
  colour: string
): void {
  const pairs = Math.max(4, Math.round(length / 17));
  const step = length / pairs;
  const leafLength = step * 1.75;
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.2, length / 70);
  ctx.lineCap = "round";
  let px = x;
  let py = y;
  ctx.beginPath();
  ctx.moveTo(px, py);
  const nodes: Array<{ x: number; y: number; heading: number; t: number }> = [];
  for (let i = 1; i <= pairs; i++) {
    const t = i / pairs;
    const heading = angle + bend * t;
    px += Math.cos(heading) * step;
    py += Math.sin(heading) * step;
    ctx.lineTo(px, py);
    nodes.push({ x: px, y: py, heading, t });
  }
  ctx.stroke();
  for (const node of nodes) {
    const size = leafLength * (1 - 0.35 * node.t);
    if (node.t === 1) {
      leaf(ctx, node.x, node.y, node.heading, size);
    } else {
      leaf(ctx, node.x, node.y, node.heading - 0.62, size);
      leaf(ctx, node.x, node.y, node.heading + 0.62, size);
    }
  }
  ctx.restore();
}

/** A small walnut: shell outline, seam and a few wrinkles. `fill` hides whatever is behind it. */
export function drawWalnut(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  colour: string,
  fill: string,
  rotation = 0
): void {
  const r = radius;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = colour;

  ctx.beginPath();
  ctx.moveTo(0, -1.12 * r);
  ctx.bezierCurveTo(0.72 * r, -1.02 * r, 0.98 * r, -0.36 * r, 0.9 * r, 0.14 * r);
  ctx.bezierCurveTo(0.84 * r, 0.78 * r, 0.38 * r, 1.06 * r, 0, 1.06 * r);
  ctx.bezierCurveTo(-0.38 * r, 1.06 * r, -0.84 * r, 0.78 * r, -0.9 * r, 0.14 * r);
  ctx.bezierCurveTo(-0.98 * r, -0.36 * r, -0.72 * r, -1.02 * r, 0, -1.12 * r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, r * 0.11);
  ctx.stroke();

  // Seam: a thin lens down the middle.
  ctx.beginPath();
  ctx.moveTo(0, -1.02 * r);
  ctx.quadraticCurveTo(0.2 * r, 0, 0, 0.98 * r);
  ctx.quadraticCurveTo(-0.2 * r, 0, 0, -1.02 * r);
  ctx.fillStyle = colour;
  ctx.fill();

  ctx.lineWidth = Math.max(1, r * 0.075);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 0.3 * r, -0.66 * r);
    ctx.quadraticCurveTo(side * 0.62 * r, -0.5 * r, side * 0.58 * r, -0.14 * r);
    ctx.moveTo(side * 0.34 * r, -0.2 * r);
    ctx.quadraticCurveTo(side * 0.5 * r, 0.1 * r, side * 0.34 * r, 0.4 * r);
    ctx.moveTo(side * 0.66 * r, 0.16 * r);
    ctx.quadraticCurveTo(side * 0.64 * r, 0.52 * r, side * 0.36 * r, 0.76 * r);
    ctx.stroke();
  }
  ctx.restore();
}

/** Continues the current path along a spiral that tightens from `fromRadius` to `toRadius`. */
function spiralTo(
  ctx: Ctx,
  cx: number,
  cy: number,
  fromRadius: number,
  toRadius: number,
  fromAngle: number,
  sweep: number
): void {
  const steps = Math.max(12, Math.ceil(Math.abs(sweep) * 10));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = fromRadius + (toRadius - fromRadius) * t;
    const a = fromAngle + sweep * t;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
}

/** The long stem: a shallow sweep from the origin that rises into the large curl. Unit size. */
function scrollStem(ctx: Ctx): void {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(0.3, 0, 0.62, -0.06, 0.8, -0.2);
  spiralTo(ctx, 0.715, -0.31, 0.14, 0.024, 0.908, -Math.PI * 2.6);
  ctx.stroke();
}

/** The short branch: leaves the stem a third of the way along and curls the other way. */
function scrollBranch(ctx: Ctx): void {
  ctx.beginPath();
  ctx.moveTo(0.26, -0.002);
  ctx.bezierCurveTo(0.42, 0, 0.52, 0.06, 0.56, 0.13);
  spiralTo(ctx, 0.49, 0.17, 0.08, 0.016, -Math.PI / 6, Math.PI * 2.4);
  ctx.stroke();
}

/**
 * A scroll flourish starting at (x, y) and extending `size` along `direction` (1 = right,
 * -1 = left). `lift` picks which side the large curl sits on (-1 = above, 1 = below).
 */
export function drawFlourish(
  ctx: Ctx,
  x: number,
  y: number,
  size: number,
  direction: 1 | -1,
  lift: 1 | -1,
  colour: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size * direction, size * -lift);
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.5, size / 60) / size;
  scrollStem(ctx);
  scrollBranch(ctx);
  leaf(ctx, 0.06, 0, -0.42, 0.2);
  leaf(ctx, 0.5, -0.045, -1.05, 0.15);
  leaf(ctx, 0.86, -0.17, -0.25, 0.17);
  ctx.restore();
}

/** A thin rule with a star in the middle and a dot at each end. */
export function drawStarRule(
  ctx: Ctx,
  cx: number,
  y: number,
  halfWidth: number,
  starRadius: number,
  colour: string
): void {
  const gap = starRadius * 2;
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, y);
  ctx.lineTo(cx - gap, y);
  ctx.moveTo(cx + gap, y);
  ctx.lineTo(cx + halfWidth, y);
  ctx.stroke();
  drawStar(ctx, cx, y, starRadius, colour);
  drawDiamond(ctx, cx - halfWidth, y, 3.5, colour);
  drawDiamond(ctx, cx + halfWidth, y, 3.5, colour);
  ctx.restore();
}

/** The corner piece, drawn at the top-left; the caller mirrors it into the other corners. */
function drawCorner(ctx: Ctx, colour: string, paper: string): void {
  const inset = FRAME_INNER_INSET;
  const walnut = inset + CORNER_WALNUT_OFFSET;
  drawWalnut(ctx, walnut, walnut, CORNER_WALNUT_RADIUS, colour, paper, -Math.PI / 4);
  for (const alongY of [false, true]) {
    ctx.save();
    // Reflect across the diagonal so the same scroll runs down the side edge.
    if (alongY) ctx.transform(0, 1, 1, 0, 0, 0);
    drawFlourish(
      ctx,
      inset + CORNER_SCROLL_START,
      inset + CORNER_SCROLL_DEPTH,
      CORNER_SCROLL_SIZE,
      1,
      1,
      colour
    );
    drawDiamond(ctx, inset + CORNER_SCROLL_START - 12, inset + CORNER_SCROLL_DEPTH, 4, colour);
    ctx.restore();
  }
}

/** Double border, notched inner line, corner flourishes and the walnut at the top centre. */
export function drawFrame(
  ctx: Ctx,
  width: number,
  height: number,
  colour: string,
  paper: string
): void {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineJoin = "miter";

  ctx.lineWidth = FRAME_OUTER_WIDTH;
  ctx.strokeRect(
    FRAME_OUTER_INSET,
    FRAME_OUTER_INSET,
    width - FRAME_OUTER_INSET * 2,
    height - FRAME_OUTER_INSET * 2
  );
  ctx.lineWidth = FRAME_SECOND_WIDTH;
  ctx.strokeRect(
    FRAME_SECOND_INSET,
    FRAME_SECOND_INSET,
    width - FRAME_SECOND_INSET * 2,
    height - FRAME_SECOND_INSET * 2
  );

  // Inner line with a concave notch at each corner, leaving room for the walnut.
  const i = FRAME_INNER_INSET;
  const n = FRAME_NOTCH_RADIUS;
  ctx.lineWidth = FRAME_INNER_WIDTH;
  ctx.beginPath();
  ctx.moveTo(i + n, i);
  ctx.lineTo(width - i - n, i);
  ctx.arc(width - i, i, n, Math.PI, Math.PI / 2, true);
  ctx.lineTo(width - i, height - i - n);
  ctx.arc(width - i, height - i, n, -Math.PI / 2, Math.PI, true);
  ctx.lineTo(i + n, height - i);
  ctx.arc(i, height - i, n, 0, -Math.PI / 2, true);
  ctx.lineTo(i, i + n);
  ctx.arc(i, i, n, Math.PI / 2, 0, true);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  for (const [sx, sy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    ctx.save();
    ctx.translate(sx === 1 ? 0 : width, sy === 1 ? 0 : height);
    ctx.scale(sx, sy);
    drawCorner(ctx, colour, paper);
    ctx.restore();
  }

  drawWalnut(ctx, width / 2, FRAME_INNER_INSET + 4, TOP_WALNUT_RADIUS, colour, paper);
  for (const side of [-1, 1]) {
    drawDiamond(ctx, width / 2 + side * 44, FRAME_INNER_INSET, 5, colour);
    drawDiamond(
      ctx,
      side === 1 ? width - FRAME_INNER_INSET : FRAME_INNER_INSET,
      height / 2,
      6,
      colour
    );
  }
}

/** A scalloped award rosette with two ribbon tails hanging below it. */
export function drawRosette(
  ctx: Ctx,
  cx: number,
  cy: number,
  radius: number,
  colour: string,
  shade: string,
  paper: string
): void {
  ctx.save();
  ctx.translate(cx, cy);

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.rotate(side * -0.3);
    const w = radius * 0.5;
    const top = radius * 0.5;
    const bottom = radius * 1.95;
    ctx.beginPath();
    ctx.moveTo(-w / 2, top);
    ctx.lineTo(w / 2, top);
    ctx.lineTo(w / 2, bottom);
    ctx.lineTo(0, bottom - w * 0.45);
    ctx.lineTo(-w / 2, bottom);
    ctx.closePath();
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.restore();
  }

  const scallops = 16;
  ctx.beginPath();
  for (let k = 0; k < scallops; k++) {
    const a = (k / scallops) * TAU;
    ctx.moveTo(Math.cos(a) * radius * 0.86, Math.sin(a) * radius * 0.86);
    ctx.arc(Math.cos(a) * radius * 0.86, Math.sin(a) * radius * 0.86, radius * 0.2, 0, TAU);
  }
  ctx.moveTo(radius * 0.88, 0);
  ctx.arc(0, 0, radius * 0.88, 0, TAU);
  ctx.fillStyle = colour;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, TAU);
  ctx.strokeStyle = paper;
  ctx.lineWidth = Math.max(1.5, radius * 0.035);
  ctx.stroke();
  ctx.restore();
}

/** A flat ribbon banner with folded swallow-tail ends, centred on (cx, cy). */
export function drawBanner(
  ctx: Ctx,
  cx: number,
  cy: number,
  width: number,
  height: number,
  colour: string,
  shade: string,
  edge: string
): void {
  const tail = height * 0.62;
  const drop = height * 0.24;
  ctx.save();
  ctx.translate(cx, cy);
  for (const side of [-1, 1]) {
    const inner = side * (width / 2 - tail * 0.45);
    const outer = side * (width / 2 + tail);
    ctx.beginPath();
    ctx.moveTo(inner, -height / 2 + drop);
    ctx.lineTo(outer, -height / 2 + drop);
    ctx.lineTo(outer - side * tail * 0.42, drop);
    ctx.lineTo(outer, height / 2 + drop);
    ctx.lineTo(inner, height / 2 + drop);
    ctx.closePath();
    ctx.fillStyle = shade;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.rect(-width / 2, -height / 2, width, height);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
