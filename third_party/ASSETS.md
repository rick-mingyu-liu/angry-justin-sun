# Media assets: provenance and licence findings

Audit date: 2026-10-13. Upstream pin: `25ee4a531eddbb11a96dab201be623cf424220ec` (see `UPSTREAM.md`).

Status words used here:

- **Verified**: checked directly against a primary source in this audit.
- **Stated by upstream, not independently verified**: the upstream repository says so and nothing contradicts it, but the files were not matched against the claimed source.
- **Not verified**: no reliable statement of origin or rights was found.

Method limits that apply to every section:

- No Kenney pack archive was downloaded, so no file in this repository was compared byte-for-byte or pixel-for-pixel with a Kenney original. Where this document says a group "matches" a Kenney pack, the match is on frame or sprite names and is an inference.
- Pack identification from names relies partly on the auditor's prior knowledge of Kenney file naming. kenney.nl asset pages do not list individual file names.
- Web pages were read on 2026-10-13 and may change.

Build fact relevant to all groups: `vite.config.ts` sets `publicDir: "game-assets"`, so every file under `game-assets/` is copied into the shipped build whether or not the game uses it.

## What the upstream repository says about its media

The complete set of origin statements found in the repository at the pin:

- `README.md`, "Acknowledgments": "Kenney - Beautiful game assets and fonts" with a link to https://www.kenney.nl/.
- Font file names and the font family names `Kenney Bold` used in `src/` (`src/scenes/BootScene.ts`, `src/config/DesignTokens.ts`, and others).

Nothing else was found. A case-insensitive search of `src/`, `index.html`, the shaders, the atlas JSON files, the audio sprite JSON, `.github/` and `vite.config.ts` for `kenney`, `cc0`, `creative commons`, `license`, `credit`, `attribution`, `freesound`, `opengameart`, `pixabay`, `incompetech`, `itch.io` and `copyright` returned only the font references above. There is no credits file, no per-asset source list, and no licence file for media.

## Atlases (`game-assets/atlases/`)

| File                                              | md5                                | Size        |
| ------------------------------------------------- | ---------------------------------- | ----------- |
| `level.png` (+ `level.json`, 255 frames)          | `919d7ab39f0cc1fb0e10631e7168b706` | 2004 x 2268 |
| `background.png` (+ `background.json`, 13 frames) | `8494854e186b13ca9e178e0f5e3ec878` | 1026 x 5244 |
| `UI.png` (+ `UI.json`, 68 frames)                 | `d3005025b1920ab983a8945dff3844c9` | 464 x 412   |
| `vfx.png` (+ `vfx.json`, 61 frames)               | `5bba682c5997eaf9d3ae975e903a7b64` | 4096 x 4096 |

Evidence inside the files:

- Each JSON has `meta: {"app": "http://free-tex-packer.com", "version": "0.6.7"}`. This identifies the packing tool only. There is no source, author or licence field.
- The PNG files contain no text, EXIF or provenance chunks.

Frame names and the Kenney packs they are consistent with:

| Atlas      | Frame names (examples)                                                                                                                            | Consistent with                                                                                                                                  | Licence stated on that page |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| level      | `alienBeige_round`, `alienGreen_suit`, `alienPink_square`, `coinBronze`, `starDiamond`, `grass`, `sand`, `snow`, `dirt`                           | Physics Assets, https://kenney.nl/assets/physics-assets                                                                                          | Creative Commons CC0        |
| level      | 225 block frames named `<material>_<shape>_<state>_<WxH>` for wood, glass, stone, metal, explosive; `slingshot`, `slingshot_base`, `grass-purple` | Naming is upstream's own scheme. Origin cannot be inferred from names. Could be renamed or recomposed Physics Assets elements, or upstream-made. | Not established             |
| background | `hills`, `hillsLarge`, `mountains`, `mountainA`-`C`, `cloudLayer1`, `cloudLayerB1`, `groundLayer1`, `backgroundForest`                            | Background Elements, https://kenney.nl/assets/background-elements                                                                                | Creative Commons CC0        |
| UI         | `panel_brown_damaged_dark`, `panel_grey_bolts`, `hexagon_brown`, `button_brown_close`, `checkbox_grey_checked`, `progress_blue_border`            | UI Pack - Adventure, https://kenney.nl/assets/ui-pack-adventure                                                                                  | Creative Commons CC0        |
| UI         | 42 `icon_*` frames (`icon_sword`, `icon_steering_wheel`, `icon_pedal_brake`, `icon_button_a`, ...)                                                | Source pack not identified                                                                                                                       | Not established             |
| vfx        | `star_01`-`05`, `twirl_01`, `spark_01`-`05`, `scorch_02`, `trace_01`-`03`, `smoke_01`, `flare_01`, `flame_03`, `dirt_01`, `light_01`, `circle_01` | Particle Pack, https://kenney.nl/assets/particle-pack                                                                                            | Creative Commons CC0        |
| vfx        | `pattern_01` ... `pattern_84` (23 frames)                                                                                                         | Pattern Pack, https://kenney.nl/assets/pattern-pack                                                                                              | Creative Commons CC0        |
| vfx        | `splat02`, `splat10`-`12`, `splat32`, `splat33`                                                                                                   | Splat Pack, https://kenney.nl/assets/splat-pack                                                                                                  | Creative Commons CC0        |

One inconsistency in the name match: the Pattern Pack page shows a file count of 80, while the atlas uses frame numbers up to `pattern_84`. This was not resolved.

Kenney's general statement (https://kenney.nl/support): "all game assets on the asset pages are public domain licensed (CC0). You're free to use them, even in commercial projects." Full quotation in `licenses/KENNEY-CC0-STATEMENT.md`.

**Status: Stated by upstream, not independently verified.** Upstream credits Kenney in general terms; frame names for most groups are consistent with specific CC0 Kenney packs; the licence of those packs is verified on kenney.nl. What is not verified: that these pixels actually are the Kenney originals, the origin of the block, slingshot and `icon_*` frames, and whether upstream drew or modified any of them.

What would settle it: download the packs listed above from kenney.nl, read their included licence files, and compare sprites against the atlas frames; or obtain a written per-file source list from the upstream author.

## Audio (`game-assets/audio/sprites/sfx-master.ogg` + `.json`)

| Property                               | Value                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| md5 of `sfx-master.ogg`                | `b0807df2b0f23c99cc69559a0d2101a7`                                                           |
| Format                                 | Ogg Vorbis, stereo, 44100 Hz, about 128 kbps, 1,566,428 bytes, 109.8 s                       |
| Vorbis vendor / comments               | vendor `Lavf60.16.100`; one comment, `encoder=Lavc60.31.102 libvorbis` (an FFmpeg re-encode) |
| Title, artist, copyright, licence tags | None present                                                                                 |

Contents according to the sprite map (`sfx-master.json`), which has only `resources` and `spritemap` keys and no origin or licence fields:

| Range            | Sprite names                                                                                                     | Kind                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 0.00 - 4.81 s    | `impactWood{Light,Medium,Heavy}`, `impactGlass...`, `impactStone...`, `impactMetal...` (12)                      | Sound effects                                 |
| 4.81 - 9.84 s    | `pigDestroy01` - `pigDestroy10`                                                                                  | Sound effects                                 |
| 9.84 - 10.27 s   | `click`, `select`, `back`, `drop`, `pluck`                                                                       | UI sounds                                     |
| 10.27 - 11.47 s  | `birdLaunch`, `birdImpact`, `explosion`, `birdSplit`                                                             | Sound effects                                 |
| 11.47 - 13.64 s  | `jingleWin`, `jingleLose`                                                                                        | Jingles                                       |
| 13.64 - 109.81 s | `musicMenu` (31.8 s), `musicForest` (8.0 s), `musicDesert` (29.5 s), `musicCastle` (12.0 s), `musicIce` (14.8 s) | Music, about 96 s, 88% of the file's duration |

Findings:

- **The repository does not document where the music or the sound effects came from.** The README's single credit line names Kenney for "game assets and fonts" and does not mention audio, music, a composer, or a sound library. The "Adding New Themes" section says only "Add music to audio sprite". No source file names survive: everything was concatenated and re-encoded into one file with FFmpeg and the sprite names are upstream's own.
- Some sprite names resemble Kenney audio pack naming: `impactWood*`, `impactGlass*`, `impactMetal*` resemble Impact Sounds (https://kenney.nl/assets/impact-sounds, CC0), and `click`, `select`, `back`, `drop`, `pluck` resemble Interface Sounds (https://kenney.nl/assets/interface-sounds, CC0). This is an inference from names and prior knowledge; kenney.nl pages do not list file names and no audio was compared. It does not extend to `pigDestroy*`, `birdLaunch`, `birdImpact`, `explosion`, `birdSplit`, or `impactStone*`, for which no candidate source was identified.
- No candidate source was identified for the five music tracks. Kenney publishes Music Jingles (https://kenney.nl/assets/music-jingles, CC0), but that page does not describe multi-second looping tracks, and nothing ties the 8 - 32 s tracks here to it.

**Status: Not verified.** This is the weakest item in the audit. For the music in particular there is no stated origin at all.

Shipping note: the project plan (`architecture.md`, sections 3 and 6) is to disable looping background music. Disabling playback does not remove the music from the distribution. The music is inside the single `sfx-master.ogg`, which the game loads (`src/scenes/BootScene.ts`, `this.load.audioSprite("sfx-master", ...)`) and which is copied into the build. As long as that file ships unchanged, we redistribute the music regardless of whether it plays. Whether the current build actually disables playback was not checked in this audit.

What would settle it: a written statement from the upstream author giving the source and licence of each track and effect; or replacing the file. A lower-risk interim step is to rebuild the audio sprite without the 13.64 - 109.81 s music range (and update the JSON), which removes the least-documented material from what we ship. That still leaves the sound effects unverified.

## Fonts (`game-assets/UI/fonts/`)

| File                                 | md5                                |
| ------------------------------------ | ---------------------------------- |
| `kenney_bold-webfont.woff`           | `57509c32069a52120654d1f133b5dbfa` |
| `kenney_bold-webfont.woff2`          | `503470d06d9e4b3c40a12cf06b87d00a` |
| `kenney_future_narrow-webfont.woff`  | `5835829120408fad2b20903fac68c76e` |
| `kenney_future_narrow-webfont.woff2` | `93824392513666de3d8eab17a3835abf` |

Embedded `name` table, read from the two `.woff` files (the `.woff2` files were not decoded; they are assumed to be the same fonts):

| nameID                   | Kenney Bold                                                                     | Kenney Future Narrow                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 0 Copyright              | `Copyright Kenney 2014`                                                         | `Copyright Kenney 2013` (followed by truncated text)                                                 |
| 1 / 4 Family / Full name | `Kenney Bold` / `Kenney Bold Regular`                                           | `Kenney Future Narrow` / `Kenney Future Narrow Regular`                                              |
| 7 Trademark              | `FontStruct is a trademark of FontStruct.com`                                   | same                                                                                                 |
| 9 Designer               | `Kenney`                                                                        | `Kenney`                                                                                             |
| 10 Description           | `"Kenney Bold" was built with FontStruct. Designer description: KenVector Bold` | `"Kenney Future Narrow" was built with FontStruct. Designer description: Clone of KenVector Future.` |
| 11 Vendor URL            | https://fontstruct.com/fontstructions/show/1093328/kenney-bold                  | https://fontstruct.com/fontstructions/show/904448/kenney-future-narrow                               |
| 13 Licence description   | `Creative Commons Attribution Share Alike`                                      | `Creative Commons Attribution Share Alike`                                                           |
| 14 Licence URL           | http://creativecommons.org/licenses/by-sa/3.0/                                  | http://creativecommons.org/licenses/by-sa/3.0/                                                       |
| 200-203, 55555           | `Webfont 1.0`, generated 2023-09-19, `Font Squirrel`                            | same, 2023-09-19, `Font Squirrel`                                                                    |

Findings:

- Origin with Kenney is supported by the fonts' own metadata (designer and copyright fields), by the file and family names, and by upstream's credit line.
- **Licence conflict.** The licence recorded inside the font files is CC BY-SA 3.0, not CC0. kenney.nl lists a pack "Kenney Fonts" (https://kenney.nl/assets/kenney-fonts, 11 files, version 1.0, 2014) with licence "Creative Commons CC0". The files shipped here are Font Squirrel web conversions of what the metadata identifies as the FontStruct-published versions, which carry the CC BY-SA 3.0 notice. The two statements were not reconciled in this audit.
- The FontStruct pages named in the metadata could not be read (the site returned a sign-in page), so the licence shown there was not confirmed.
- It was not confirmed that the kenney.nl pack contains fonts with these two names; the page does not list its contents.

Consequence: if CC0 applies, no obligations follow. If CC BY-SA 3.0 applies, redistribution requires attribution to Kenney, a licence notice, and share-alike for adaptations of the font. Until this is resolved, the conservative reading is CC BY-SA 3.0, because that is what the shipped files themselves declare.

**Status: origin Verified from file metadata; licence Not verified (conflicting statements: CC BY-SA 3.0 in the files, CC0 on kenney.nl).**

What would settle it: download Kenney Fonts from kenney.nl, read its licence file, and replace the four web font files with conversions made from those CC0 originals (then re-check the embedded name table); or drop the fonts. These fonts were not checked for Chinese glyph coverage; given file sizes of 4 - 10 KB they cannot contain a CJK set, so the product's Chinese text will be rendered with a fallback font in any case.

## Shaders (`game-assets/shaders/`)

`cloudGlow.frag` (989 bytes), `explosion.frag` (1520 bytes), `transition.frag` (2572 bytes).

- No author, source URL or licence comment appears in any of the three files. `transition.frag` begins with a Phaser shader front-matter block (`name: TransitionShader`).
- The uniform names follow Phaser pipeline conventions (`uMainSampler`, `outTexCoord`) and project-specific parameters, which is consistent with code written for this game.
- They were not compared against public shader collections (for example Shadertoy), so third-party origin is not excluded.

**Status: Stated by upstream, not independently verified.** Treated as upstream source code under the repository's MIT licence, on the assumption that the upstream author wrote them.

## Our additions: character images

| File                                                           | md5                                | Dimensions         | Role                                             |
| -------------------------------------------------------------- | ---------------------------------- | ------------------ | ------------------------------------------------ |
| `assets/characters-source/justin-nut-transparent.png`          | `186f1c973f9b687d6820ca684fe78447` | 1377 x 1142 RGBA   | Source, kept byte-identical                      |
| `assets/characters-source/justin-nut-upgraded-transparent.png` | `6c85814403beb0dfab955f455b52f186` | 1254 x 1254 RGBA   | Source, kept byte-identical                      |
| `game-assets/characters/nut-standard.png`                      | `c36e61bcb499bb7d2ed6918c3b1991dc` | 256 x 256 RGBA     | Derived, shipped                                 |
| `game-assets/characters/nut-muscle.png`                        | `4fe74e1c52baeccf1c099f3af38d99e3` | 256 x 256 RGBA     | Derived, shipped                                 |
| `game-assets/favicon.ico`, `game-assets/icons/*.png`           | not recorded                       | 16/32/48, 192, 180 | Derived site icons (standard character), shipped |

The source md5 values were recomputed in this audit and match the values supplied by the project. The derived md5 values are as found on 2026-10-13 and will change if the script is re-run with different settings.

### Provenance as stated by the project owner

- `architecture.md` section 6: both character PNGs "have alpha channels and were produced by editing user-supplied references".
- `architecture.md` section 12 names the original reference project: https://github.com/wolfyxbt/justin-nut
- Correction from the project owner (2026-10-13, later): the face-on-walnut images were taken from comments on X, and the owner does not know who made them originally. The page therefore does not credit justin-nut for the characters. The justin-nut notes below remain because that repository is still the source of the chapter list (see `src/podcast/podcastData.ts`).
- `architecture.md` section 1: the characters use "the supplied face-on-walnut images". They depict the face of a real public figure (Justin Sun) on a walnut.
- The derived files are produced by `scripts/prepare-characters.mjs`, which trims transparent margins (`trim`, threshold 8), resizes to fit 216 px (standard) or 248 px (muscle) with a Lanczos3 kernel, and pads to a 256 x 256 transparent canvas. No other edit is made.

### What the files themselves show

- Both source PNGs contain a C2PA content-credentials manifest (`caBX` chunk, 23,654 bytes). Readable fields in it: claim generator name `ChatGPT`, version `gpt-image`; actions `c2pa.created` and `c2pa.converted`; digital source type `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia`; signer strings `OpenAI Media Service` / `OpenAI OpCo, LLC`; timestamps `2026-10-13T19:08:00Z` and `2026-10-13T19:09:44Z`. This indicates the two source files were output by an OpenAI image-generation service on the audit date. The manifest's cryptographic signature was not validated; the strings were read, not verified.
- The derived PNGs contain no such chunk. The resize step drops the content credentials, so the shipped files no longer carry the AI-generation marker.
- Our standard source image is not a byte copy of the reference project's `assets/justin-nut.png` (that file is 1378 x 1141, md5 `8227ec9639163eba2fee753bc09b5277`). The images were not compared visually in this audit.

### What the reference project states (https://github.com/wolfyxbt/justin-nut, read 2026-10-13)

- Its `LICENSE` is MIT, "Copyright (c) 2026 Justin Nut contributors", with an added scope paragraph: "this license covers the project's original source code, tools, tests and documentation. It does not grant rights to third-party artwork, audio, animations, character likenesses, trademarks, or derivative media in assets/." GitHub reports the licence as `NOASSERTION` because of this added text.
- Its `README.md` states that game images, animations, audio and derived material are not covered by the MIT licence, and that a source link does not imply permission to redistribute publicly.
- Its `THIRD_PARTY_NOTICES.md` describes the nut images as a "project character design" made with AI image editing, states that the MIT licence does not cover third-party art, animation, audio, original names or portraits of persons, and states that the project does not claim to hold independent redistribution permission for the original material or for portraits of persons.
- Its `assets/sources.json` lists `justin-nut.png`, `justin-nut-crack1.png` and `justin-nut-crack2.png` with `"reference": "Project character design"` and `"tool": "AI-assisted image editing"`.
- No document in that repository names the photograph the face was taken from, its photographer, or any permission from the person depicted.

### Rights position

- **The rights to the underlying photograph and to the depicted person's likeness have NOT been verified by us.** We do not know which photograph was used, who owns its copyright, or whether the person depicted has consented to this use.
- The reference project grants no rights in its character images. Its licence expressly excludes character likenesses and media in `assets/`. If our images are derived from that project's images, that derivation is not licensed by it.
- These images are **not** MIT-licensed, **not** CC0, and **not** freely licensed assets of this project. They must not be described as such in any notice, README or store listing.
- The copyright status of AI-generated or AI-edited output differs by jurisdiction and was not assessed.
- Use of a real person's face in a public product can raise portrait, publicity, personality and defamation issues independently of copyright, including under the law of mainland China, the stated target market. This was not assessed. This document is a record of facts, not legal advice.
- **Clearing these rights before any public release is the product owner's responsibility.**

**Status: Not verified.** Provenance is recorded as stated by the project owner, with the file metadata above as partial corroboration of the tool used.

What would settle it: the product owner identifying the original photograph and its licence, and obtaining either the depicted person's consent or qualified legal advice for the release jurisdictions; and written permission from the reference project's author if their images were used as input.

## External embed: Bilibili player

Not an asset we ship. Recorded here because it is third-party content shown in the product.

Source read: https://player.bilibili.com/ on 2026-10-13 (page title "哔哩哔哩外链播放器 - 使用说明", heading "站外(外链)播放器使用文档").

What the page documents:

- Reference address: `https://player.bilibili.com/player.html`
- Example given on the page: `<iframe src="//player.bilibili.com/player.html?bvid=BV1B7411m7LV" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`
- Query-string parameters (booleans may be written as 0 or 1):

| Parameter   | Type    | Marked required | Description on the page                                                                     |
| ----------- | ------- | --------------- | ------------------------------------------------------------------------------------------- |
| `aid`       | number  |                 | UGC video ID; use either `aid` or `bvid`                                                    |
| `cid`       | number  |                 | UGC video ID                                                                                |
| `bvid`      | string  | yes             | UGC video ID; use either `aid` or `bvid`                                                    |
| `seasonId`  | number  |                 | OGV video ID                                                                                |
| `episodeId` | number  | yes             | OGV video ID; takes priority over `aid` and `bvid`                                          |
| `poster`    | boolean |                 | Show the cover image                                                                        |
| `autoplay`  | boolean |                 | Autoplay                                                                                    |
| `muted`     | boolean |                 | Mute                                                                                        |
| `t`         | number  |                 | Initial playback position, in seconds                                                       |
| `danmaku`   | boolean |                 | `false` turns danmaku off; other values use the default                                     |
| `kind`      | number  |                 | Group kind; only for non-general business use                                               |
| `refer`     | boolean |                 | Carry the current Referrer on link-out, so partners can count jumps from the embedding site |
| `p`         | number  |                 | Part number for multi-part videos, from 1; ignored if `cid` is given                        |

What the page does not contain:

- **No usage terms, licence, rate limits, commercial-use conditions or embedding policy appear on the page.** The only other text is a link to the Bilibili home page.
- No JavaScript or postMessage control API is documented there.

Position: we embed the official iframe player only. We do not download, proxy, re-host or scrape video, audio, subtitles, thumbnails or metadata. The page documents how to embed; it is not a grant of rights. Bilibili's general user agreement and any terms that govern embedding on third-party or commercial sites were not located or read in this audit, and the rights of each video's uploader are separate again.

**Status: embed mechanism Verified against the page; applicable terms of use Not verified.**

What would settle it: reading Bilibili's current user agreement and any open-platform or embedding terms, and confirming for each configured video that the uploader permits external embedding (the player itself enforces some of this at runtime).
