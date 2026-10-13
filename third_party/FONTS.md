# Certificate font: Noto Serif SC subset

Recorded 2026-10-13. This file covers only the two fonts under `game-assets/fonts/`. The game's other fonts (Kenney) are covered in `ASSETS.md` and are not touched here.

## What the files are

| File | Weight | Size | sha256 |
| --- | --- | --- | --- |
| `game-assets/fonts/certificate-serif-700.woff2` | Bold, `usWeightClass` 700 | 20,840 bytes | `32c5af59f5451daed83da4b74c4904a1a82af4e07d5f4547c6b343ccdf8d9cc6` |
| `game-assets/fonts/certificate-serif-900.woff2` | Black, `usWeightClass` 900 | 20,800 bytes | `a35f4ab81ee1c37bfafe6582a9bb87c91e34aed4d0a02e26bcb2254878c10f5e` |

Both are static instances of the Noto Serif SC variable font, cut down to the 134 characters the graduation certificate draws. Each has 163 glyphs: the 134 mapped characters, `.notdef`, and 28 unmapped alternates that the kept layout features point to. They are a Modified Version in the licence's terms. Anything outside the glyph list, such as a player's nickname, is drawn by the browser's own serif.

Internal names, unchanged from the original apart from the weight: family `Noto Serif SC`, styles `Bold` and `Black`, PostScript names `NotoSerifSC-Bold` and `NotoSerifSC-Black`. The app loads the files through the FontFace API under its own family name, "Boji Certificate Serif"; that name exists only in the app's code, not in the font files.

## Source

| | |
| --- | --- |
| Font | Noto Serif SC, variable, `wght` 200 to 900 |
| File | `NotoSerifSC[wght].ttf`, 25,125,512 bytes |
| Download URL | https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf |
| Repository | `google/fonts`, directory `ofl/notoserifsc`, commit `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5` (the newest commit touching that directory on 2026-10-13) |
| sha256 | `050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9` |
| git blob sha1 | `eab063faf229160a52d3760f5555150e4eb9e5bf`, equal to the value the GitHub API lists for the file |
| Version (name ID 5) | `Version 2.003-H1;hotconv 1.1.1;makeotfexe 2.6.0` |
| Copyright (name ID 0) | `(c) 2017-2024 Adobe (http://www.adobe.com/).` |
| Trademark (name ID 7) | `Noto is a trademark of Google Inc.` |
| Licence file | https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/OFL.txt, sha256 `5e0da210fb04058a8c0087985d2d456b931c2579811a49655721d3cf0c36b6d6`, copied unchanged to `licenses/NotoSerifSC-OFL.txt` |

`METADATA.pb` in the same directory says the file was taken from `notofonts/noto-cjk` at commit `985fa52c81c1d6692ccdd82bc3656e8fb932fd89`, path `google-fonts/NotoSerifSC[wght].ttf`. That file exists at that commit, but it was not downloaded and compared with the Google Fonts copy.

The original font is not kept in this repository.

## How the files were made

`scripts/subset-certificate-font.py` holds the whole procedure and the glyph list. It refuses a source file whose sha256 differs from the one above, and it exits with an error if an output is missing a character, contains U+7684 (的), or is not a static instance of the right weight. Run on 2026-10-13 with Python 3.14.7, fontTools 4.66.1 and brotli, installed in a throwaway virtual environment outside the repository:

```sh
python3 -m venv /tmp/font-venv
/tmp/font-venv/bin/pip install fonttools==4.66.1 brotli
/tmp/font-venv/bin/python -I scripts/subset-certificate-font.py "path/to/NotoSerifSC[wght].ttf"
```

Two runs in a row gave byte-identical files. A different fontTools or brotli version may give different bytes for the same glyphs.

What the script does, for each of 700 and 900:

1. Subsets the variable font to the glyph list with `fontTools.subset`: hinting dropped, glyph names dropped, English name records only.
2. Keeps fontTools' default layout features plus `chws`, `halt` and `palt`, which space CJK punctuation. The outputs end up with GSUB `ccmp`, `liga`, `locl`, `vert`, `vrt2` and GPOS `chws`, `halt`, `kern`, `palt`, `vchw`, `vhal`, `vpal`.
3. Pins `wght` with `fontTools.varLib.instancer` (`updateFontNames=True`), sets `usWeightClass`, and saves as WOFF2.

The copyright, trademark, designer and licence name records (name IDs 0, 7 to 14) are kept in both outputs.

## Glyph list

134 characters, the same in both files:

```
 ()-./0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz·—　。业书了予今从以优你修克全关准刘发另可同哥喜天孙学完射已平弓弹总恭成数日明星期本毕水炼独瑞生秀立肌腹薄行证请起通部院（），：
```

That is: space (U+0020), ideographic space (U+3000), digits, A-Z, a-z, the punctuation `( ) - . / :` `·` (U+00B7) `—` (U+2014) `。` `（` `）` `，` `：`, and these 57 Han characters:

```
业书了予今从以优你修克全关准刘发另可同哥喜天孙学完射已平弓弹总恭成数日明星期本毕水炼独瑞生秀立肌腹薄行证请起通部院
```

They come from this fixed certificate copy:

```
刘瑞克 · 薄肌学院
LIU RUIKE · BOJI ACADEMY
薄肌毕业证书
CERTIFICATE OF COMPLETION
薄肌同学
已完成全部 30 关
从今天起，你可以独立发射孙哥了。
通关 30 / 30
总星数 72 / 90
毕业日期 2026.10.13
准予毕业
优秀毕业生
本证书证明弹弓水平，腹肌请另行修炼。
恭喜毕业
```

If the certificate copy changes, add the new text to `COPY` in the script and rebuild; a character that is not in the list is drawn in the system serif and will look different from its neighbours.

## Licence

SIL Open Font License, Version 1.1. Full text as shipped with the font: `licenses/NotoSerifSC-OFL.txt`.

What it requires of us:

- **Keep the copyright notice and the licence with every copy** (condition 2). This is met twice: the licence text is in `licenses/NotoSerifSC-OFL.txt`, and the copyright and licence records are still inside both font files. `game-assets/` is Vite's public directory and `third_party/` is not, so the deployed site carries the notice only inside the font files. The licence allows that ("in the appropriate machine-readable metadata fields within text or binary files"). Shipping the text file too would be the more cautious choice and is not done here.
- **Do not sell the fonts by themselves** (condition 1). Bundling them with the game is allowed.
- **The subsets stay under the OFL** (condition 5). They cannot be relicensed. This does not extend to the game's code or to the certificate images drawn with the font.
- **Do not use the names of the copyright holders or authors to promote the game** (condition 4).

Reserved Font Name (condition 3): the licence defines a Reserved Font Name as a name "specified as such after the copyright statement(s)". The `OFL.txt` shipped with this font has one copyright line, `Copyright 2012 Google Inc. All Rights Reserved.`, and no "with Reserved Font Name" statement. The font's own copyright record has none either. So this font declares no Reserved Font Name, the OFL does not require a modified version to be renamed, and the subsets keep the internal family name `Noto Serif SC`.

Two things the licence file does not settle:

- "Noto" is a trademark of Google, as the font's own trademark record says. The OFL grants no trademark rights. The name is not shown to players: the app registers the files under "Boji Certificate Serif". If keeping a trademarked internal name in a modified file is unwanted, the script can set name IDs 1, 4, 6 and 16 to "Boji Certificate Serif"; that is not done here because the licence does not require it.
- The licence file names Google as copyright holder (2012) and the font's name table names Adobe (2017-2024). Both notices are kept as found. The difference comes from upstream and was not resolved here.
