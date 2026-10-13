# Upstream

Audit date: 2026-10-13.

## Pin

| Item | Value |
| --- | --- |
| Upstream repository | https://github.com/feliperyba/angry-aliens-phaser |
| Upstream default branch | `main` |
| Pinned commit | `25ee4a531eddbb11a96dab201be623cf424220ec` |
| Commit author | feliperyba `<feliperybakovas@hotmail.com>` |
| Commit date (author and committer) | 2026-05-01T09:28:08-03:00 |
| Commit subject | Change game link to GitHub Pages |
| History length at the pin | 8 commits, first dated 2026-03-15 |

How this was checked:

- `git rev-parse HEAD` in the working copy returned the pinned commit.
- `git ls-remote https://github.com/feliperyba/angry-aliens-phaser.git` on 2026-10-13 returned the same hash for both `HEAD` and `refs/heads/main`. The pin therefore equals upstream's default-branch head on the audit date.
- The GitHub API (`https://api.github.com/repos/feliperyba/angry-aliens-phaser`) reports `default_branch: main`, `fork: false`, `pushed_at: 2026-05-01T12:28:09Z`, and a detected licence of `MIT`.

Note on the local remote: in this working copy `origin` points to `https://github.com/rick-mingyu-liu/angry-justin-sun.git`, not to the upstream repository. Its `HEAD` and `refs/heads/main` are also at the pinned commit. That repository is not publicly readable through the unauthenticated GitHub API (HTTP 404), so its visibility and fork relationship were not verified.

## Upstream licence

The file `LICENSE` at the pinned commit (md5 `bf72105a69d303b78352c6a39239bc69`, unmodified in the working copy) reads, verbatim:

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Observations:

- The copyright line gives a year and no holder name. The git history attributes all 8 commits to "feliperyba" / "Felipe Rybakovas"; that is authorship evidence, not a statement in the licence.
- The licence text is the standard MIT text and says nothing about media. It contains no scope clause for the files under `game-assets/`.
- The upstream README shows an MIT badge and, under "Acknowledgments", the line "Kenney - Beautiful game assets and fonts". It gives no per-file origin, no pack names, and no licence for the media. It does not mention the origin of the audio at all.
- The MIT grant can only cover what the upstream author had the right to license. The media under `game-assets/` appears to be third-party material (see `ASSETS.md`), so the repository's MIT label does not by itself establish rights to it.

What we rely on the MIT licence for: the TypeScript source under `src/`, the three GLSL files under `game-assets/shaders/` (no third-party attribution found in them; authorship by upstream is assumed, not proven), configuration files, and level data. The MIT condition applies: keep the copyright notice and permission notice above in copies or substantial portions.

## Modifications

See MODIFICATIONS.md
