#!/bin/sh
# Rebuilds the PDF fonts in public/typst/fonts/ (Latin Extended) and public/typst/fonts/wide/ (plus Greek, Cyrillic, combining marks).
# usage: scripts/fonts/subset-pdf-fonts.sh <Inter-4.1 folder> <JetBrainsMono-2.304 folder>   (needs Python with fonttools)
# Sources: https://github.com/rsms/inter (extras/ttf) and https://github.com/JetBrains/JetBrainsMono (fonts/ttf), both OFL-1.1.
set -e
INTER=$1
JB=$2
LATIN="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2122,U+2212,U+2190-2193,U+2713"
EXT="$LATIN,U+0100-024F,U+1E00-1EFF,U+2C60-2C7F,U+A720-A7FF"
WIDE="$EXT,U+0300-036F,U+0370-03FF,U+0400-052F,U+1C80-1C8F,U+2DE0-2DFF,U+A640-A69F,U+1F00-1FFF"
mkdir -p public/typst/fonts/wide
for src in "$INTER/extras/ttf/Inter-Regular.ttf" "$INTER/extras/ttf/Inter-Medium.ttf" "$INTER/extras/ttf/Inter-Bold.ttf" "$JB/fonts/ttf/JetBrainsMono-Regular.ttf" "$JB/fonts/ttf/JetBrainsMono-Bold.ttf"; do
  n=$(basename "$src")
  python -I -m fontTools.subset "$src" --unicodes="$EXT" --layout-features='*' --output-file="public/typst/fonts/$n"
  python -I -m fontTools.subset "$src" --unicodes="$WIDE" --layout-features='*' --output-file="public/typst/fonts/wide/$n"
done
