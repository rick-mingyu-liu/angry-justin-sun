// Builds the in-game character sprites from the untouched source PNGs.
// Both outputs share one canvas size so the game can swap textures without
// touching scale or the (shared, circular) collision body.
//   node scripts/prepare-characters.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
