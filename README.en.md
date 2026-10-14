<div align="center">

[简体中文](README.md) | **English**

# Angry Justin Sun · 愤怒的孙哥

**Listen to Justin on the left. Launch Justin on the right.**

A podcast companion with slingshot physics, 30 levels, and your very own Boji graduation certificate.

<img src="game-assets/certificate/nut-standard.png" alt="Justin walnut" height="180" />
&nbsp;&nbsp;&nbsp;&nbsp;
<img src="game-assets/certificate/nut-muscle.png" alt="Muscular Justin walnut" height="220" />

[How to play](#how-to-play) · [Graduation certificate](#boji-graduation-certificate) · [Run locally](#run-locally) · [Podcast configuration](#change-the-podcast-and-chapters) · [Credits](#credits-and-open-source)

</div>

---

## What is this?

A browser slingshot game made by **刘瑞克 (Liu Ruike)**. Watch or listen to Shao Allen's interview with Justin Sun on the left, and launch Justin-faced walnuts at structures on the right.

Pull, aim, release. Stop interacting when the conversation gets interesting; take another shot when you feel like it. No registration or backend is needed, and progress stays on your device.

**The interface switches between Chinese and English (button at the top right). The podcast itself is in Mandarin; chapter titles are translated.**

### Features

- **Listen and play together:** an embedded Bilibili or YouTube player alongside the game; restarting, changing levels, and switching appearances never interrupt the video.
- **Chinese and English:** switch the whole interface live from the top-right button without interrupting the video or the level; the certificate has an English version too.
- **30 levels:** glass huts and wood/stone structures, cleared with ordinary shots and unlocked progressively.
- **Two Justin appearances:** standard walnut and muscular walnut; the muscular appearance unlocks upon entering level 3. Both share identical physics.
- **Graduate after completion:** clear every level, enter your nickname, and download your certificate.
- **Pause anytime:** backgrounding the tab automatically pauses the game; click `继续` (Continue) to resume.
- **Independent audio:** game effects start muted and play at low volume when enabled; no looping background music.
- **Touch controls:** the layout stacks on narrow screens and supports dragging to launch.

## How to play

1. Start the player on the left, or select a chapter to jump to a topic.
2. Drag the walnut in the slingshot to adjust angle and force; release to launch.
3. Use impacts and collapsing structures to eliminate the targets.
4. Clear a level to unlock the next. Open `选关` (Level selection) to review stars, best scores, and replay levels.
5. Complete all 30 levels to graduate. Keep playing for maximum stars and an `优秀毕业生` (Outstanding Graduate) badge.

Switch appearances only while a walnut is ready in the slingshot. Switching costs no shot and does not change an airborne walnut. Refreshing starts the latest unlocked level from its initial state; live physics state is not saved.

## Boji graduation certificate

> This certificate proves your slingshot skills. Train your abs separately.

Issued by the fictional **刘瑞克 · 薄肌学院 (Liu Ruike · Boji Academy)**, this is a game-completion souvenir featuring both Justin walnuts.

- **Eligibility:** all 30 levels must have a won result. Merely unlocking or entering the final level does not qualify. Neither maximum stars nor watching the entire podcast is required.
- **Personalization:** edit your nickname; leaving it empty uses `薄肌同学` (Boji Student).
- **Actual results:** stars reflect your current best scores; the date is the saved first graduation date.
- **Export:** download an 1800 × 1200 PNG. Browsers that do not support direct download can open the image for manual saving.
- **Reopen anytime:** a one-time celebration marks graduation; reopen the certificate from level selection or victory results afterward.
- **Maximum-star reward:** earn the highest rating in every level for the Outstanding Graduate badge.
- **Both languages:** the certificate is drawn in the interface language; the English one is the "Lean Muscle Diploma" (default name "Lean Muscle Graduate").

Nickname, issue date, and stars are stored locally. Certificates have no server-side verification.

## Run locally

Requires **Node.js 20 or newer**.

```bash
git clone https://github.com/rick-mingyu-liu/angry-justin-sun.git
cd angry-justin-sun
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Check TypeScript and build into `dist/` |
| `npm run preview` | Preview the build at <http://localhost:4173> |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | Check code conventions |
| `npm run format:check` | Check source formatting |
| `npm run test:browser:certificate` | Run certificate browser regression checks |

Certificate browser checks require Google Chrome and a running `npm run build && npm run preview`. Exported test images are written to `scripts/browser-checks/output/`.

## Change the podcast and chapters

Edit [`src/podcast/podcastData.ts`](src/podcast/podcastData.ts). The current configuration embeds Shao Allen's [interview with Justin Sun about opportunities in the AI era](https://www.bilibili.com/video/BV1fcHD6cEw3), with 39 chapters.

```ts
export const PODCAST: Podcast | null = {
  id: "episode-1",
  title: { zh: "节目标题", en: "Program title" },
  video: { bvid: "BV1fcHD6cEw3" }, // Replace with the actual target video's BV ID
  youtube: { videoId: "0Z-vhBvBmUY" }, // Optional; add offsetSeconds if the uploads are shifted
  chapters: [
    { id: "intro", title: { zh: "开场", en: "Introduction" }, startSeconds: 0 },
    { id: "topic-1", title: { zh: "第一个话题", en: "First topic" }, startSeconds: 120 },
  ],
};
```

`startSeconds` is measured in seconds on the Bilibili timeline. Without `youtube` there is no platform switch. For multipart videos, set `video.page` (starting at 1). Setting `PODCAST = null` displays `尚未配置节目` (No program configured). Adjust the sample titles and timestamps for the actual video.

The chapter list uses data from [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut/blob/main/assets/chapters.js). Its titles and timestamps match the same episode's YouTube description and player chapters; they were not independently named by the game author. Each timestamp has not been checked against the Bilibili version. Recalibrate when changing videos or using an edited upload.

Which platform a visitor starts on ([`src/podcast/platformChoice.ts`](src/podcast/platformChoice.ts)):

1. The platform they picked with the switch before (stored as `angry-podcast:video-platform`).
2. Bilibili when the browser's first language is Simplified Chinese; no request goes to YouTube.
3. Otherwise a YouTube thumbnail is loaded; if it arrives within 2.5 s the visitor starts on YouTube, else on Bilibili. Automatic choices are not stored.

Both players are official embeds; the app does not download, proxy, or scrape videos:

- **Bilibili:** the official iframe. Chapter selection reloads it to seek; autoplay depends on the browser. Highlighting shows the selected chapter.
- **YouTube:** the official IFrame Player API, player on `youtube-nocookie.com`. Chapters seek without a reload and the highlight follows playback. If the API cannot load, the panel falls back to Bilibili and says so.
- Switching platforms continues from the current position. The "Open on …" link points at the current platform and time.

## Interface language

The top-right button switches between Chinese and English live, without reloading, so the video and the level in progress carry on. The first visit follows the browser language (`zh*` → Chinese, anything else → English); the choice is stored as `angry-podcast:language`.

- Interface text lives in [`src/i18n/messages.ts`](src/i18n/messages.ts); the English catalog is type-checked against the Chinese one, so a missing entry fails the build.
- Level titles and hints, character names and chapter titles carry `{ zh, en }` pairs next to their data. The English chapter titles are this project's translations.

## Deployment

`npm run build` produces a static `dist/` directory. Scripts, fonts, and game assets are bundled without runtime public-CDN dependencies. Bilibili provides the video stream.

On Vercel, import the repository, select Vite, use `npm run build`, and set the output directory to `dist`. To collect traffic statistics, enable Web Analytics and redeploy. Analytics activates only in Vercel builds, not local runs or other hosts. Configuration lives in [`src/app/analytics.ts`](src/app/analytics.ts).

For mainland Chinese users, test actual hosting and playback access. Changing domains alone does not guarantee better loading performance.

## Project structure and customization

Built with **Phaser 3.90 + Matter.js 0.20 + TypeScript + Vite**. The outer page uses HTML/CSS and TypeScript, with no backend.

```text
src/app/                  Page, toolbar, characters, results, certificate dialog
src/podcast/              Podcast panel, Bilibili / YouTube players, platform choice, configuration
src/i18n/                 Interface language and zh/en text
src/game/                 Game adapter, characters, levels, level catalog
src/storage/              Validation, unlocks, graduation rules, local storage
src/certificate/          Certificate copy, Canvas rendering, ornaments
src/styles/               Page styles and responsive layout
src/scenes/ and others    Retained and adapted upstream game code
game-assets/              Bundled images, fonts, audio, shaders
assets/characters-source/ Original character images
scripts/                  Asset preparation and browser checks
tests/                    Unit tests
third_party/              Licenses, provenance, upstream pin, modifications
```

- **Levels:** edit `src/game/levels.ts` and `src/game/levelCatalog.ts`. The first eight levels were made for this project; the remaining 22 adapt upstream layouts.
- **Characters:** change the images under `assets/characters-source/`, then run `node scripts/prepare-characters.mjs`.
- **Certificate:** text is in `src/certificate/model.ts`, drawing in `src/certificate/render.ts`, and the dialog in `src/app/GraduationDialog.ts`. See [FONTS.md](third_party/FONTS.md) for font-subset details.
- **Attribution:** edit `src/app/credits.ts`.

The podcast and game initialize independently once. The storage key remains `podcast-slingshot:progress:v1` to preserve saves from the project's earlier Podcast Slingshot name. If storage fails, the game falls back to memory.

## Credits and open source

Thanks to the authors of the following projects and resources.

| Project / source | Use | License / notes |
| --- | --- | --- |
| [Angry Aliens](https://github.com/feliperyba/angry-aliens-phaser) | Game foundation, physics gameplay, scenes, and some levels | MIT; pinned at `25ee4a531eddbb11a96dab201be623cf424220ec` |
| [Phaser](https://github.com/phaserjs/phaser) | HTML5 game engine | MIT |
| [Matter.js](https://github.com/liabru/matter-js) | 2D physics simulation | MIT |
| [EventEmitter3](https://github.com/primus/eventemitter3) | Event dependency distributed with the engine | MIT; notice retained |
| [Kenney](https://kenney.nl/) | Upstream scene and UI art | Upstream states Kenney / CC0; some assets remain individually unverified |
| [Kenney Fonts](https://kenney.nl/assets/kenney-fonts) | Game fonts | CC BY-SA 3.0 notice retained; metadata and website licensing statements differ |
| [Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc) | Chinese certificate font subsets | SIL Open Font License 1.1 |
| [wolfyxbt/justin-nut](https://github.com/wolfyxbt/justin-nut) | Podcast-plus-game inspiration and chapter data reference | Chapters originate in the program description; code licensing does not cover video or media |
| [Shao Allen](https://www.bilibili.com/video/BV1fcHD6cEw3) | Embedded podcast episode | Content belongs to its author; embedded through the official Bilibili and YouTube players |

Changes include the Chinese page, character replacement, podcast integration, adapted levels, persistence, certificates, and pause/listener cleanup fixes. See [MODIFICATIONS.md](third_party/MODIFICATIONS.md) for details and [third_party/README.md](third_party/README.md) for provenance and license checks.

## Licensing and media

The upstream [MIT License](LICENSE) and third-party notices are retained. Builds emit `licenses.txt`. **Code licensing does not automatically cover character images, podcasts, audio, or fonts.**

Original authorship and likeness permission for character images remain unconfirmed. Upstream audio lacks a documented source, and some art provenance and Kenney font terms remain unresolved. See the [third-party records](third_party/README.md) before reusing or distributing those materials.

This is an unofficial fan project, unaffiliated with Justin Sun, Shao Allen, Rovio, Bilibili, or YouTube. The Boji graduation certificate is a game souvenir, not a real qualification.

---

**Your name on the certificate. His abs in the picture.**
