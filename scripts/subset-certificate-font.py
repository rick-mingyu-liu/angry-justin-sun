# Builds the two certificate fonts from the original Noto Serif SC variable font.
# Needs fontTools and brotli, which are not project dependencies; use a throwaway venv:
#   python3 -m venv /tmp/font-venv && /tmp/font-venv/bin/pip install fonttools==4.66.1 brotli
#   /tmp/font-venv/bin/python -I scripts/subset-certificate-font.py "path/to/NotoSerifSC[wght].ttf"
# Source, licence and checksums are recorded in third_party/FONTS.md.
import argparse
import hashlib
import string
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE_SHA256 = "050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9"

# The fixed copy drawn on the certificate. Player nicknames are not covered and
# fall back to the system serif.
COPY = """
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
"""
EXTRA = string.digits + string.ascii_letters + " ./·，。：:-—()（）　"
CHARS = sorted({c for c in COPY + EXTRA if c != "\n"})

# fontTools' default features plus the ones that space CJK punctuation.
FEATURES = subset.Options().layout_features + ["chws", "halt", "palt"]
# Copyright, trademark, designer and licence strings stay in the subset.
NAME_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17]

OUTPUTS = [(700, "certificate-serif-700.woff2"), (900, "certificate-serif-900.woff2")]


def build(source: Path, weight: int, target: Path) -> None:
    font = TTFont(source)

    options = subset.Options()
    options.layout_features = FEATURES
    options.name_IDs = NAME_IDS
    options.name_languages = [0x409]
    options.hinting = False
    options.glyph_names = False
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=[ord(c) for c in CHARS])
    subsetter.subset(font)

    # Subsetting first keeps the instancer fast: it only has a few hundred glyphs to move.
    font = instancer.instantiateVariableFont(font, {"wght": weight}, updateFontNames=True)
    font["OS/2"].usWeightClass = weight

    # Keep the source's modification time so a re-run gives byte-identical files.
    font.recalcTimestamp = False
    font.flavor = "woff2"
    target.parent.mkdir(parents=True, exist_ok=True)
    font.save(target)


def check(target: Path, weight: int) -> None:
    font = TTFont(target)
    cmap = font.getBestCmap()
    missing = [c for c in CHARS if ord(c) not in cmap]
    if missing:
        sys.exit(f"{target.name}: missing {missing}")
    if ord("的") in cmap:
        sys.exit(f"{target.name}: not a subset, U+7684 is present")
    if "fvar" in font or font["OS/2"].usWeightClass != weight:
        sys.exit(f"{target.name}: not a static {weight} instance")
    name = font["name"]
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    print(
        f"{target.name}: {target.stat().st_size} bytes, {len(cmap)} code points, "
        f"{font['maxp'].numGlyphs} glyphs, family {name.getBestFamilyName()!r}, "
        f"style {name.getBestSubFamilyName()!r}, usWeightClass {font['OS/2'].usWeightClass}, "
        f"sha256 {digest}"
    )


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="the downloaded NotoSerifSC[wght].ttf")
    parser.add_argument("--out-dir", type=Path, default=root / "game-assets" / "fonts")
    args = parser.parse_args()

    digest = hashlib.sha256(args.source.read_bytes()).hexdigest()
    if digest != SOURCE_SHA256:
        sys.exit(f"{args.source} has sha256 {digest}, expected {SOURCE_SHA256} (see third_party/FONTS.md)")

    print(f"{len(CHARS)} characters: {''.join(CHARS)}")
    for weight, filename in OUTPUTS:
        build(args.source, weight, args.out_dir / filename)
        check(args.out_dir / filename, weight)


if __name__ == "__main__":
    main()
