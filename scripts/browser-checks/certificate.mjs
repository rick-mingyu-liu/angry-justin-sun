// Browser regression check for the graduation certificate.
//
//   npm run build && npm run preview        (in one terminal)
//   npm run test:browser:certificate        (in another)
//
// Drives the real page in headless Chrome (system Chrome, via playwright-core).
// Progress is seeded through localStorage fixtures; the app ships no bypass.
// The Bilibili player is stubbed so nothing external is loaded.
// Exported PNGs are written to scripts/browser-checks/output/ for inspection.
import { chromium } from "playwright-core";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] ?? "http://localhost:4173/";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "output");
fs.mkdirSync(OUT, { recursive: true });

const KEY = "podcast-slingshot:progress:v1";
const TOTAL = 30;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(ok ? "PASS" : "FAIL", name, extra);
};

/** A save with the given levels won (2 stars each unless overridden). */
function fixture(wonIds, { stars = 2, graduation } = {}) {
  const levels = {};
  for (const id of wonIds) levels[id] = { bestScore: 1000 * id, stars };
  const save = {
    version: 1,
    highestUnlockedLevel: TOTAL,
    levels,
    unlockedCharacters: ["standard", "muscle"],
    selectedCharacter: "standard",
    sfxEnabled: false,
  };
  if (graduation) save.graduation = graduation;
  return save;
}
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});

async function openPage(save, viewport = { width: 1440, height: 900 }, waitUntilReady = true) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  await context.route(/player\.bilibili\.com/, (route) =>
    route.fulfill({ contentType: "text/html", body: "<html><body>stub</body></html>" })
  );
  // Seed once per context: reloads must see what the app itself saved.
  await context.addInitScript(
    ([key, value]) => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      if (value) localStorage.setItem(key, value);
    },
    [KEY, save ? JSON.stringify(save) : ""]
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE);
  if (waitUntilReady) await ready(page);
  return { context, page, errors };
}
const ready = async (page) => {
  await page.waitForFunction(
    () => {
      const card = document.querySelectorAll(".character")[0];
      return card && !card.disabled;
    },
    null,
    { timeout: 60000 }
  );
  await sleep(400);
};
const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
const dialogOpen = (page) => page.locator("dialog.graduation[open]").count();
const pauseLabel = async (page) =>
  (await page.locator(".toolbar__actions").innerText()).includes("继续") ? "paused" : "running";

async function shoot(page, dx, dy) {
  const box = await page.locator(".stage__mount canvas").boundingBox();
  const k = box.width / 1100;
  const px = box.x + box.width * 0.1636;
  const py = box.y + box.height * 0.735;
  await page.mouse.move(px, py);
  await page.mouse.down();
  for (let step = 1; step <= 10; step += 1) {
    await page.mouse.move(px + (dx * k * step) / 10, py + (dy * k * step) / 10);
    await sleep(30);
  }
  await sleep(200);
  await page.mouse.up();
}
const overlay = (page) => page.locator(".stage__overlay").innerText();

// ---------------------------------------------------------------- 1. not eligible
{
  const { context, page } = await openPage(fixture(range(1, 29)));
  await sleep(2500);
  check("29/30 with level 30 unlocked: no celebration", (await dialogOpen(page)) === 0);
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  check(
    "29/30: no certificate entry in the level page",
    !(await page.locator(".graduation-entry").isVisible())
  );
  check("29/30: no graduation record stored", (await stored(page)).graduation === undefined);
  await context.close();
}

// ------------------------------------------- 2. finishing the last outstanding level
{
  // Everything but level 1 is won, so one easy shot completes the set out of order.
  const { context, page, errors } = await openPage(fixture(range(2, 30)));
  const frame = await page.evaluate(() => {
    const iframe = document.querySelector(".podcast__frame");
    iframe.__mark = 1;
    return iframe.src;
  });
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".level-card").first().click();
  await ready(page);

  let won = false;
  for (let attempt = 0; attempt < 4 && !won; attempt += 1) {
    await shoot(page, -110, 45);
    await page.waitForFunction(
      () => /过关|差一点/.test(document.querySelector(".stage__overlay").innerText),
      null,
      { timeout: 90000 }
    );
    won = (await overlay(page)).includes("过关");
    if (!won) {
      await page.locator(".stage__overlay").getByRole("button", { name: "重开" }).click();
      await ready(page);
    }
  }
  check("last outstanding level won", won);
  check("victory card shows first", (await overlay(page)).includes("过关"));
  await page.waitForSelector("dialog.graduation[open]", { timeout: 8000 });
  check("celebration opens once after the victory card", true);
  check(
    "exactly one modal is open",
    (await page.locator("dialog[open]").count()) === 1 &&
      (await page.locator("dialog.level-menu[open]").count()) === 0
  );
  check(
    "focus moved inside the dialog",
    await page.evaluate(() =>
      document.querySelector("dialog.graduation").contains(document.activeElement)
    )
  );
  check(
    "dialog has an accessible name",
    (await page.locator("dialog.graduation").getAttribute("aria-labelledby")) !== null &&
      (await page.locator("#graduation-heading").innerText()) === "薄肌毕业证书"
  );
  check(
    "greeting uses the default name",
    (await page.locator(".graduation__greeting").innerText()) === "恭喜毕业，薄肌同学。"
  );
  const first = await stored(page);
  check(
    "record created with today's date, celebration not yet acknowledged",
    first.graduation?.displayDate === today() && first.graduation?.celebrationSeen === false,
    JSON.stringify(first.graduation)
  );

  // Tab must stay inside the dialog.
  for (let i = 0; i < 12; i += 1) await page.keyboard.press("Tab");
  check(
    "focus is trapped in the dialog",
    await page.evaluate(() =>
      document.querySelector("dialog.graduation").contains(document.activeElement)
    )
  );

  // Nickname replaces the default entirely and is rendered as text.
  const nickname = "  阿伟<b>🔥</b>  ";
  await page.locator("#graduation-nickname").fill(nickname);
  await sleep(600);
  check(
    "greeting follows the nickname, with no forced prefix or suffix",
    (await page.locator(".graduation__greeting").innerText()) === "恭喜毕业，阿伟<b>🔥</b>。",
    await page.locator(".graduation__greeting").innerText()
  );
  check(
    "nickname is not parsed as HTML",
    (await page.locator(".graduation__greeting b").count()) === 0
  );
  const label = await page.locator(".graduation__canvas").getAttribute("aria-label");
  check(
    "preview describes the real stats, date and name",
    label.includes("阿伟") &&
      label.includes("总星数") &&
      label.includes(today()) &&
      !label.includes("72 / 90"),
    label
  );
  const totals = /总星数 (\d+) \/ (\d+)/.exec(label);
  const saved = await stored(page);
  const earned = Object.values(saved.levels).reduce((sum, level) => sum + level.stars, 0);
  check(
    "star total on the certificate equals the saved results",
    totals && Number(totals[1]) === earned && Number(totals[2]) === TOTAL * 3,
    `${totals?.[0]} vs saved ${earned}`
  );

  // Real export.
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    page.getByRole("button", { name: "保存图片" }).click(),
  ]);
  const file = path.join(OUT, "certificate-desktop.png");
  await download.saveAs(file);
  const meta = await sharp(file).metadata();
  check(
    "exported file is an 1800x1200 PNG named 薄肌毕业证书.png",
    meta.format === "png" &&
      meta.width === 1800 &&
      meta.height === 1200 &&
      download.suggestedFilename() === "薄肌毕业证书.png",
    `${meta.format} ${meta.width}x${meta.height} ${download.suggestedFilename()}`
  );
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixel = (x, y) =>
    Array.from(data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 4));
  const corners = [pixel(4, 4), pixel(1795, 4), pixel(4, 1195), pixel(1795, 1195)];
  check(
    "PNG is opaque paper to the edges (no transparent or black corners)",
    corners.every(([r, g, b, a]) => a === 255 && r > 200 && g > 190 && b > 150),
    JSON.stringify(corners)
  );
  check(
    "a saveable image is also shown for browsers that ignore downloads",
    await page.locator(".graduation__manual-image").isVisible()
  );
  const preview = await page.evaluate(() => {
    const canvas = document.querySelector(".graduation__canvas");
    const box = canvas.getBoundingClientRect();
    return { w: canvas.width, h: canvas.height, ratio: box.width / box.height };
  });
  check(
    "preview is the export canvas itself (1800x1200, shown at 3:2)",
    preview.w === 1800 && preview.h === 1200 && Math.abs(preview.ratio - 1.5) < 0.02,
    JSON.stringify(preview)
  );

  await page.keyboard.press("Escape");
  await sleep(500);
  check("Escape closes the dialog", (await dialogOpen(page)) === 0);
  const after = await stored(page);
  check(
    "closing acknowledges the celebration and keeps name, date and results",
    after.graduation.celebrationSeen === true &&
      after.graduation.nickname === "阿伟<b>🔥</b>" &&
      after.graduation.displayDate === first.graduation.displayDate &&
      after.graduation.earnedAt === first.graduation.earnedAt &&
      Object.keys(after.levels).length === TOTAL,
    JSON.stringify(after.graduation)
  );
  check(
    "victory card is still there with a certificate button",
    (await overlay(page)).includes("过关") && (await overlay(page)).includes("毕业证书")
  );
  await sleep(2500);
  check("celebration does not reopen by itself", (await dialogOpen(page)) === 0);
  check(
    "podcast iframe untouched",
    await page.evaluate((src) => {
      const iframe = document.querySelector(".podcast__frame");
      return iframe.__mark === 1 && iframe.src === src;
    }, frame)
  );

  // ---- reload: permanent entry, no auto popup, pause semantics
  await page.reload();
  await ready(page);
  await sleep(2500);
  check("after reload: no automatic popup", (await dialogOpen(page)) === 0);
  check("game is running before opening the certificate", (await pauseLabel(page)) === "running");
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  check(
    "permanent 毕业证书 entry in the level page",
    await page.locator(".graduation-entry").isVisible()
  );
  await page.locator(".graduation-entry").click();
  await sleep(500);
  check(
    "entry opens the certificate and closes the level page",
    (await dialogOpen(page)) === 1 && (await page.locator("dialog.level-menu[open]").count()) === 0
  );
  check("game is paused while the certificate is open", (await pauseLabel(page)) === "paused");
  check(
    "saved nickname is restored into the field",
    (await page.locator("#graduation-nickname").inputValue()) === "阿伟<b>🔥</b>"
  );
  await page.getByRole("button", { name: "继续挑战满星" }).click();
  await sleep(500);
  check(
    "closing resumes a game the certificate itself paused",
    (await dialogOpen(page)) === 0 && (await pauseLabel(page)) === "running"
  );

  // Manual pause must survive opening and closing the certificate.
  await page.getByRole("button", { name: /暂停/ }).first().click();
  await sleep(300);
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".graduation-entry").click();
  await sleep(400);
  await page.locator("dialog.graduation button[aria-label='关闭']").click();
  await sleep(500);
  check(
    "a manual pause is preserved after closing the certificate",
    (await pauseLabel(page)) === "paused" && (await overlay(page)).includes("已暂停")
  );
  await page.locator(".stage__overlay").getByRole("button", { name: "继续" }).click();

  // Empty name falls back to the default at display time only.
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".graduation-entry").click();
  await sleep(400);
  await page.locator("#graduation-nickname").fill("   ");
  await sleep(500);
  check(
    "empty name falls back to 薄肌同学",
    (await page.locator(".graduation__greeting").innerText()) === "恭喜毕业，薄肌同学。" &&
      (await stored(page)).graduation.nickname === ""
  );
  await page.locator("#graduation-nickname").fill("一二三四五六七八九十一二三四五六七八九十");
  await page.locator("#graduation-nickname").blur();
  await sleep(500);
  check(
    "long names are cut to 16 graphemes",
    Array.from((await stored(page)).graduation.nickname).length === 16,
    (await stored(page)).graduation.nickname
  );
  await page.keyboard.press("Escape");
  check("no page errors (desktop flow)", errors.length === 0, JSON.stringify(errors));
  await context.close();
}

// ------------------------- 2b. moving on quickly must not get the celebration mid-play
{
  const { context, page } = await openPage(fixture(range(2, 30)));
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".level-card").first().click();
  await ready(page);
  let won = false;
  for (let attempt = 0; attempt < 4 && !won; attempt += 1) {
    await shoot(page, -110, 45);
    await page.waitForFunction(
      () => /过关|差一点/.test(document.querySelector(".stage__overlay").innerText),
      null,
      { timeout: 90000 }
    );
    won = (await overlay(page)).includes("过关");
    // Either way, replay at once: on a win this is inside the celebration delay.
    await page
      .locator(".stage__overlay")
      .getByRole("button", { name: won ? "再玩一次" : "重开" })
      .click();
    if (!won) await ready(page);
  }
  check("2b: last level won, then replayed immediately", won);
  await ready(page);
  await sleep(2500);
  check(
    "2b: no celebration interrupts the level the player moved on to",
    (await dialogOpen(page)) === 0 && (await pauseLabel(page)) === "running"
  );
  check(
    "2b: the celebration is still owed",
    (await stored(page)).graduation?.celebrationSeen === false
  );
  // Opening it by hand before the celebration ran still plays it, then acknowledges.
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".graduation-entry").click();
  await page.waitForSelector("dialog.graduation.is-drawn", { timeout: 20000 });
  check(
    "2b: first manual viewing is the celebration",
    (await page.locator("dialog.graduation.is-celebrating").count()) === 1
  );
  await page.keyboard.press("Escape");
  await sleep(400);
  check(
    "2b: acknowledged after it was actually shown",
    (await stored(page)).graduation.celebrationSeen === true
  );
  await context.close();
}

// ----------------------- 2c. another dialog in the way defers the celebration, not drops it
{
  const { context, page } = await openPage(fixture(range(2, 30)));
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".level-card").first().click();
  await ready(page);
  let won = false;
  for (let attempt = 0; attempt < 4 && !won; attempt += 1) {
    await shoot(page, -110, 45);
    await page.waitForFunction(
      () => /过关|差一点/.test(document.querySelector(".stage__overlay").innerText),
      null,
      { timeout: 90000 }
    );
    won = (await overlay(page)).includes("过关");
    if (!won) {
      await page.locator(".stage__overlay").getByRole("button", { name: "重开" }).click();
      await ready(page);
    }
  }
  // Open the help dialog inside the celebration delay and keep it open past it.
  await page.locator(".header").getByRole("button", { name: /帮助/ }).click();
  await sleep(2600);
  check(
    "2c: celebration does not stack on the help dialog",
    (await dialogOpen(page)) === 0 && (await page.locator("dialog[open]").count()) === 1
  );
  await page.keyboard.press("Escape");
  await page.waitForSelector("dialog.graduation[open]", { timeout: 6000 }).catch(() => {});
  check("2c: celebration appears once the help dialog is closed", (await dialogOpen(page)) === 1);
  await page.keyboard.press("Escape");
  await context.close();
}

// ------------------------------------------------ 3. legacy save that already qualifies
{
  // The celebration pauses the game right after load, so do not wait for a ready walnut.
  const { context, page } = await openPage(fixture(range(1, 30), { stars: 3 }), undefined, false);
  await page.waitForSelector("dialog.graduation[open]", { timeout: 60000 });
  const record = (await stored(page)).graduation;
  check(
    "legacy save: recognised on load with today's date, not an invented one",
    record?.displayDate === today(),
    JSON.stringify(record)
  );
  const label = await page.locator(".graduation__canvas").getAttribute("aria-label");
  check(
    "all three-star save shows 90 / 90",
    label.includes(`总星数 ${TOTAL * 3} / ${TOTAL * 3}`),
    label
  );
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }),
    page.getByRole("button", { name: "保存图片" }).click(),
  ]);
  await download.saveAs(path.join(OUT, "certificate-excellent.png"));
  await page.keyboard.press("Escape");
  await sleep(300);
  await page.reload();
  await ready(page);
  await sleep(2500);
  check("legacy save: game resumes normally after the celebration was dismissed", true);
  check("legacy save: celebration shown only once", (await dialogOpen(page)) === 0);
  check(
    "legacy save: date frozen across reloads",
    (await stored(page)).graduation.earnedAt === record.earnedAt
  );
  await context.close();
}

// ------------------------------------------------------------- 4. phone-sized layout
{
  const { context, page, errors } = await openPage(
    fixture(range(1, 30), {
      graduation: {
        earnedAt: 1790000000000,
        displayDate: "2026.09.21",
        nickname: "Rick🔥薄肌练习生",
        celebrationSeen: true,
      },
    }),
    { width: 390, height: 844 }
  );
  await page.getByRole("button", { name: /选关/ }).first().click();
  await sleep(300);
  await page.locator(".graduation-entry").click();
  await sleep(900);
  const layout = await page.evaluate(() => {
    const dialog = document.querySelector("dialog.graduation").getBoundingClientRect();
    const canvas = document.querySelector(".graduation__canvas").getBoundingClientRect();
    return {
      inView:
        dialog.left >= 0 &&
        dialog.right <= innerWidth &&
        dialog.top >= 0 &&
        dialog.bottom <= innerHeight,
      canvas: [Math.round(canvas.width), Math.round(canvas.height)],
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  check(
    "390px: dialog fits the screen, no horizontal overflow",
    layout.inView && !layout.overflow,
    JSON.stringify(layout)
  );
  check(
    "390px: stored date is shown, not today's",
    (await page.locator(".graduation__canvas").getAttribute("aria-label")).includes("2026.09.21")
  );
  await page.screenshot({ path: path.join(OUT, "dialog-390.png") });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 20000 }).catch(() => null),
    page.getByRole("button", { name: "保存图片" }).click(),
  ]);
  if (download) await download.saveAs(path.join(OUT, "certificate-phone.png"));
  await sleep(500);
  check(
    "390px: saveable image shown after export",
    await page.locator(".graduation__manual-image").isVisible()
  );
  check("no page errors (phone layout)", errors.length === 0, JSON.stringify(errors));
  await context.close();
}

// ---------------------------------------------------------------- 5. blocked storage
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.route(/player\.bilibili\.com/, (route) =>
    route.fulfill({ contentType: "text/html", body: "<html></html>" })
  );
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(BASE);
  await ready(page);
  check(
    "blocked storage: game still loads and no certificate is offered",
    (await dialogOpen(page)) === 0
  );
  check("blocked storage: no page errors", errors.length === 0, JSON.stringify(errors));
  await context.close();
}

await browser.close();
console.log(failures === 0 ? "ALL PASSED" : `${failures} FAILED`, `(PNGs in ${OUT})`);
process.exit(failures === 0 ? 0 : 1);
