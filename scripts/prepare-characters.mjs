// Builds the in-game character sprites, certificate figures and site icons
// from the untouched source PNGs.
// Both outputs share one canvas size so the game can swap textures without
// touching scale or the (shared, circular) collision body.
//   node scripts/prepare-characters.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANVAS = 256;

// contentSize = longest visible side inside the 256px canvas. See
// src/game/characters.ts for how the canvas maps onto the collision circle.
const characters = [
  { source: "justin-nut-transparent.png", output: "nut-standard.png", contentSize: 216 },
  { source: "justin-nut-upgraded-transparent.png", output: "nut-muscle.png", contentSize: 248 },
];

for (const { source, output, contentSize } of characters) {
  const input = path.join(root, "assets/characters-source", source);
  const trimmed = await sharp(input).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
  const resized = await sharp(trimmed.data)
    .resize(contentSize, contentSize, {
      fit: "inside",
      kernel: "lanczos3",
    })
    .toBuffer({ resolveWithObject: true });

  const padX = CANVAS - resized.info.width;
  const padY = CANVAS - resized.info.height;
  const target = path.join(root, "game-assets/characters", output);
  await sharp(resized.data)
    .extend({
      left: Math.floor(padX / 2),
      right: Math.ceil(padX / 2),
      top: Math.floor(padY / 2),
      bottom: Math.ceil(padY / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(target);

  console.log(
    `${output}: visible ${trimmed.info.width}x${trimmed.info.height} -> ${resized.info.width}x${resized.info.height} in ${CANVAS}x${CANVAS}`
  );
}

// Larger copies for the graduation certificate (1800x1200 canvas). Trimmed to
// the visible pixels, no padding: the certificate layout places them itself.
const certificateCharacters = [
  { source: "justin-nut-transparent.png", output: "nut-standard.png", height: 560 },
  { source: "justin-nut-upgraded-transparent.png", output: "nut-muscle.png", height: 760 },
];

for (const { source, output, height } of certificateCharacters) {
  const input = path.join(root, "assets/characters-source", source);
  const trimmed = await sharp(input).trim({ threshold: 8 }).toBuffer();
  const target = path.join(root, "game-assets/certificate", output);
  const info = await sharp(trimmed)
    .resize({ height, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(target);
  console.log(`certificate/${output}: ${info.width}x${info.height}`);
}

// Site icons from the standard character. Trimmed and centred on a square;
// the Apple touch icon gets an opaque background because iOS fills
// transparency with black. favicon.ico holds PNG images (supported by every
// browser that still asks for it).
const iconSource = await sharp(
  path.join(root, "assets/characters-source/justin-nut-transparent.png")
)
  .trim({ threshold: 8 })
  .toBuffer();

async function squareIcon(size, contentSize, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
  const content = await sharp(iconSource)
    .resize(contentSize, contentSize, {
      fit: "contain",
      kernel: "lanczos3",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: content, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function icoFromPngs(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const icoImages = [];
for (const size of [16, 32, 48]) icoImages.push({ size, png: await squareIcon(size, size) });
await writeFile(path.join(root, "game-assets/favicon.ico"), icoFromPngs(icoImages));
await mkdir(path.join(root, "game-assets/icons"), { recursive: true });
await writeFile(path.join(root, "game-assets/icons/icon-192.png"), await squareIcon(192, 184));
await writeFile(
  path.join(root, "game-assets/icons/apple-touch-icon.png"),
  await squareIcon(180, 148, { r: 255, g: 244, b: 217, alpha: 1 })
);
console.log("site icons: favicon.ico (16/32/48), icons/icon-192.png, icons/apple-touch-icon.png");
