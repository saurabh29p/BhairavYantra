#!/usr/bin/env python3
"""Rebuild the self-hosted font files in src/assets/fonts/.

Sources are the OFL-licensed Fontsource packages in node_modules (see package.json).
Devanagari files are copied unchanged: they are already Fontsource's Devanagari subset, and
cutting them further risks breaking conjunct shaping. The Noto Serif Latin-Extended file is
cut down to the characters IAST needs, which saves about 400 KB per weight/style pair.

Usage:  pip install fonttools brotli && python3 scripts/subset-fonts.py
"""
import shutil
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules"
OUT = ROOT / "src" / "assets" / "fonts"

# Characters for IAST and common transliteration, beyond Basic Latin / Latin-1
# (which the separate "latin" file already covers). Keep in sync with fonts.css.
IAST_RANGES = [
    (0x0100, 0x017F),  # Latin Extended-A: ā ī ū ś and capitals
    (0x0300, 0x036F),  # combining diacritics (decomposed input)
    (0x1E00, 0x1EFF),  # Latin Extended Additional: ṛ ṝ ḷ ḹ ṅ ṭ ḍ ṇ ṣ ṃ ṁ ḥ
]

COPY = {
    "@fontsource-variable/noto-serif/files/noto-serif-latin-wght-normal.woff2": "noto-serif-latin-wght-normal.woff2",
    "@fontsource-variable/noto-serif/files/noto-serif-latin-wght-italic.woff2": "noto-serif-latin-wght-italic.woff2",
    "@fontsource-variable/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-wght-normal.woff2": "noto-serif-devanagari-wght-normal.woff2",
    "@fontsource/tiro-devanagari-sanskrit/files/tiro-devanagari-sanskrit-devanagari-400-normal.woff2": "tiro-devanagari-sanskrit-400-normal.woff2",
}

SUBSET = {
    "@fontsource-variable/noto-serif/files/noto-serif-latin-ext-wght-normal.woff2": "noto-serif-iast-wght-normal.woff2",
    "@fontsource-variable/noto-serif/files/noto-serif-latin-ext-wght-italic.woff2": "noto-serif-iast-wght-italic.woff2",
}

LICENCES = {
    "@fontsource-variable/noto-serif/LICENSE": "OFL-noto-serif.txt",
    "@fontsource-variable/noto-serif-devanagari/LICENSE": "OFL-noto-serif-devanagari.txt",
    "@fontsource/tiro-devanagari-sanskrit/LICENSE": "OFL-tiro-devanagari-sanskrit.txt",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, dst in {**COPY, **LICENCES}.items():
        shutil.copyfile(NM / src, OUT / dst)
    unicodes = [cp for lo, hi in IAST_RANGES for cp in range(lo, hi + 1)]
    for src, dst in SUBSET.items():
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        font = subset.load_font(str(NM / src), opts)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=unicodes)
        sub.subset(font)
        subset.save_font(font, str(OUT / dst), opts)
    for f in sorted(OUT.iterdir()):
        print(f"{f.stat().st_size:>8}  {f.name}")


if __name__ == "__main__":
    main()
