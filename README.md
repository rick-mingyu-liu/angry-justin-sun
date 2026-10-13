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

## Configure the podcast

The programme is set in `src/podcast/podcastData.ts`. It currently points at `BV1fcHD6cEw3` (邵艾伦Alan, 对话孙宇晨：年轻人如何抓住AI时代的机会？) with 39 chapters and no clips. The chapter titles and times come from [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut), which wrote them for the YouTube upload of the same episode; both uploads are 15750 s long, but the times were not checked one by one against the Bilibili video.

To change it, edit the `Podcast` object. If `PODCAST` is `null` the panel shows `尚未配置节目`.

```ts
export const PODCAST: Podcast | null = {
  id: "episode-1",
  title: "节目标题",
  video: { bvid: "<BV 号>" }, // optional: page (分 P, from 1)
  chapters: [{ id: "intro", title: "章节标题", startSeconds: 0 }],
  clips: [{ id: "clip-1", title: "切片标题", video: { bvid: "<BV 号>", startSeconds: 0 } }],
};
```

- `bvid` is the `BV…` id from the video URL (`https://www.bilibili.com/video/BV…`). An invalid id leaves the panel in the unconfigured state.
- `startSeconds` is in seconds. Check every chapter time against the real video; the app does not verify them.
- Chapters seek the main video by reloading the iframe with `t=<seconds>`. Clips load their own video.

How the player behaves, by design:

- It is the official external player, `https://player.bilibili.com/player.html?bvid=…&p=…&t=…&autoplay=0`. Nothing is scraped, proxied or downloaded.
- The first playback needs a click inside the player. The page never autoplays.
- The highlighted chapter is the one the user clicked. There is no live chapter tracking, playback position or custom seek bar, because the iframe exposes no supported API for them.
- `在 B 站打开` always links to the selected video on bilibili.com, in case embedding is blocked for that video.

## What is in the game

- Three levels (`src/game/levels.ts`, titles in `src/game/levelCatalog.ts`): a tutorial, a deck on thin legs that collapses, and a short log-cabin challenge. A level unlocks when the previous one is cleared.
- Two appearances (`src/game/characters.ts`): 坚果孙哥 and 肌肉孙哥. The second unlocks on entering level 3. They share one collision circle and the same launch physics; only the sprite differs. Switching is possible while a walnut sits in the slingshot, applies to it and the waiting ones, and costs no shot.
- Sound effects start muted (`游戏音效：关`) and play at a low volume when enabled. There is no background music. The toggle does not touch the podcast.
- The game pauses when the tab goes to the background and stays paused until `继续` is pressed.
- Progress is stored in `localStorage` under `podcast-slingshot:progress:v1`: highest unlocked level, best score and stars per level, unlocked and selected character, sound preference. Invalid data falls back to defaults; if storage is unavailable the game runs from memory and says so. A refresh starts the latest unlocked level from its initial state.

## Layout of the code

```text
src/app/        AppShell (page, header), GameHost (toolbar, overlays, characters, progress wiring)
src/podcast/    PodcastPanel, bilibili.ts (URL building), podcastData.ts (configuration)
src/game/       gameAdapter.ts (mount/pause/resume/restartLevel/loadLevel/selectCharacter/setMuted/destroy + events),
                createGame.ts, characters.ts, levels.ts, levelCatalog.ts
src/storage/    progress.ts (validation, unlock rules, store with in-memory fallback)
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
