# 播客弹弓 (Podcast Slingshot)

Watch or listen to a Bilibili podcast on the left while playing a slingshot physics game on the right. Browser-only MVP: no accounts, no backend.

The game is an adaptation of [Angry Aliens](https://github.com/feliperyba/angry-aliens-phaser) (Phaser 3.90, Matter.js 0.20, TypeScript, Vite 6). The page around it is plain TypeScript, HTML and CSS. The interface is in Simplified Chinese.

## Run

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run build      # type-check, then production build into dist/
npm run preview    # serve dist/ on http://localhost:4173
npm test           # unit tests (Vitest)
npm run lint
```

`dist/` is a static site with relative asset paths; any static host can serve it. Nothing is loaded from a CDN. The only external request is the Bilibili player iframe, once a programme is configured.

## Deploy on Vercel and see traffic

Import the repository in Vercel; it detects Vite (build `npm run build`, output `dist`). For visitor numbers:

1. In the Vercel project, open **Analytics** and click **Enable**.
2. Deploy again. The tracking routes only exist on deployments made after enabling.

The code side is already in place (`src/app/analytics.ts`, package `@vercel/analytics`). It only switches on in builds made on Vercel, so local runs and other hosts load and send nothing. Page views, referrers, countries and devices then appear in the Analytics tab; Vercel says first data can take a while to show.

Limits on the free Hobby plan, per Vercel's docs on 2026-10-13: 50,000 events a month and a one-month reporting window. Custom events (for example "level cleared") need the Pro plan, so none are sent.

Vercel has no servers in mainland China and says `*.vercel.app` may be slow or blocked there; a custom domain is less likely to be blocked but nothing is guaranteed. If the mainland audience matters, test from a mainland network before relying on it.

## Configure the podcast

The programme is set in `src/podcast/podcastData.ts`. It currently points at `BV1fcHD6cEw3` (邵艾伦Alan, 对话孙宇晨：年轻人如何抓住AI时代的机会？) with 39 chapters. The chapter titles and times come from [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut), which wrote them for the YouTube upload of the same episode; both uploads are 15750 s long, but the times were not checked one by one against the Bilibili video.

To change it, edit the `Podcast` object. If `PODCAST` is `null` the panel shows `尚未配置节目`.

```ts
export const PODCAST: Podcast | null = {
  id: "episode-1",
  title: "节目标题",
  video: { bvid: "<BV 号>" }, // optional: page (分 P, from 1)
  chapters: [{ id: "intro", title: "章节标题", startSeconds: 0 }],
};
```

- `bvid` is the `BV…` id from the video URL (`https://www.bilibili.com/video/BV…`). An invalid id leaves the panel in the unconfigured state.
- `startSeconds` is in seconds. Check every chapter time against the real video; the app does not verify them.
- Chapters seek the video by reloading the iframe with `t=<seconds>`.

How the player behaves, by design:

- It is the official external player, `https://player.bilibili.com/player.html?bvid=…&p=…&t=…&autoplay=…`. Nothing is scraped, proxied or downloaded.
- On page load nothing plays; the user presses play in the player. Clicking a chapter jumps there and starts playing (`autoplay=1`, with the click as the user gesture). Browsers that block this, Safari in particular, fall back to showing the player paused at the chapter.
- The highlighted chapter is the one the user clicked. There is no live chapter tracking, playback position or custom seek bar, because the iframe exposes no supported API for them.
- `在 B 站打开` always links to the selected video on bilibili.com, in case embedding is blocked for that video.

## What is in the game

- Thirty levels (`src/game/levels.ts`, titles and hints in `src/game/levelCatalog.ts`). Levels 1 to 8 were built for this game; levels 9 to 30 reuse upstream layouts with plain shots. Upstream designed those around special abilities, so each one was first won by scripted play with plain shots, and five upstream layouts that could not be won reliably that way are left out. A level unlocks when the previous one is cleared. `选关` in the toolbar opens the level page (stars, best score, locks); the game pauses while it is open. To add a level, append a blueprint to `levels.ts` and an entry to `levelCatalog.ts`; the level page and progress rules follow the catalog.
- Two appearances (`src/game/characters.ts`): 坚果孙哥 and 薄肌孙哥. The second unlocks on entering level 3. They share one collision circle and the same launch physics; only the sprite differs. Switching is possible while a walnut sits in the slingshot, applies to it and the waiting ones, and costs no shot.
- Sound effects start muted (`游戏音效：关`) and play at a low volume when enabled. There is no background music. The toggle does not touch the podcast.
- The game pauses when the tab goes to the background and stays paused until `继续` is pressed.
- Progress is stored in `localStorage` under `podcast-slingshot:progress:v1`: highest unlocked level, best score and stars per level, unlocked and selected character, sound preference. Invalid data falls back to defaults; if storage is unavailable the game runs from memory and says so. A refresh starts the latest unlocked level from its initial state.

## Graduation certificate (薄肌毕业证书)

Winning every level in the catalog earns a certificate from the fictional 薄肌学院. It is a game reward, not a qualification, and nothing verifies it on a server.

- **When:** only when all 30 levels have a won result, in any order. Unlocking or entering level 30 is not enough, and all stars are not required. Every level at three stars adds an `优秀毕业生` badge.
- **Where:** a one-time celebration follows the victory card of the last outstanding level (or the first page load, for a save that already qualifies). After that a `毕业证书` button stays in the level page and on victory cards.
- **What:** a dialog with a name field (up to 16 characters, empty means 薄肌同学), a preview, and `保存图片`, which downloads an 1800×1200 PNG. The preview is the export canvas itself, so they cannot differ. On browsers that ignore downloads the image is shown for saving by hand.
- **Stored** with the rest of the progress: when it was first earned, that day's date (frozen), the name, and whether the celebration was seen. Stars on the certificate follow the current best results.
- **Code:** rules in `src/storage/progress.ts`, text in `src/certificate/model.ts`, drawing in `src/certificate/render.ts`, dialog in `src/app/GraduationDialog.ts`. The lettering uses a small subset of Noto Serif SC (`third_party/FONTS.md`); other characters in a name use the system serif.

Browser check: `npm run build && npm run preview`, then in another terminal `npm run test:browser:certificate`. It drives the real page in headless Chrome with seeded saves and writes the exported PNGs to `scripts/browser-checks/output/`. It needs Google Chrome installed.

## Layout of the code

```text
src/app/        AppShell (page, header), credits.ts (footer, 致谢与许可 dialog), GameHost (toolbar, overlays, characters, progress wiring)
src/podcast/    PodcastPanel, bilibili.ts (URL building), podcastData.ts (configuration)
src/game/       gameAdapter.ts (mount/pause/resume/restartLevel/loadLevel/selectCharacter/setMuted/destroy + events),
                createGame.ts, characters.ts, levels.ts, levelCatalog.ts
src/storage/    progress.ts (validation, unlock and graduation rules, store with in-memory fallback)
src/certificate/ graduation certificate: model (text), render (canvas), ornaments
src/styles/     app.css
src/…           upstream game code (scenes, objects, systems, config)
game-assets/    served as-is: upstream atlases, audio, fonts, shaders; characters/ sprites
assets/characters-source/   original character PNGs, untouched
scripts/prepare-characters.mjs   rebuilds game-assets/characters/ from the originals
tests/          unlock rules, storage validation and fallback, Bilibili URL construction
third_party/    upstream pin, licences, asset provenance, list of modifications
```

The podcast panel and the game are mounted once and do not know about each other. Selecting a chapter only changes the iframe URL; game controls only call the game adapter.

To change a character image, replace the PNG in `assets/characters-source/` and run `node scripts/prepare-characters.mjs`.

## Third-party material and open rights questions

See `third_party/README.md`. In short: the game code is MIT (upstream), Phaser and Matter.js are MIT. Several items are **not cleared** and need a decision before any public release: the character images (a real person's likeness), the upstream audio file (no documented origin), and the bundled fonts (conflicting licence statements). The upstream `LICENSE` is kept at the repository root.

The page footer credits the author (刘瑞克) and states that this is an unofficial fan work. Its 「致谢与许可」 dialog lists third-party material and links to `licenses.txt`, which the build generates from `LICENSE` and `third_party/licenses/` (see the `licences` plugin in `vite.config.ts`). To change the author line or the credits list, edit `src/app/credits.ts`.
