#!/usr/bin/env python3
"""Find near-duplicate screenshots (a sign the capture flow did not actually reach the screen).
Usage: python3 scripts/dedupe_check.py shots/after [--threshold 6]
Masks the status bar (top 5%) and gesture bar (bottom 3%) and compares 16x16 difference hashes.
Exit code 1 if duplicates are found — a capture run is invalid until each screenshot proves its screen (assertVisible before takeScreenshot)."""
import sys, os, glob, itertools
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

def dhash(path, n=16):
    im = Image.open(path).convert("L"); w, h = im.size
    im = im.crop((0, int(h*0.05), w, int(h*0.97))).resize((n+1, n), Image.LANCZOS)
    px = list(im.tobytes()); bits = []
    for r in range(n):
        for c in range(n):
            bits.append(px[r*(n+1)+c] > px[r*(n+1)+c+1])
    return bits

def main():
    d = sys.argv[1] if len(sys.argv) > 1 else "."
    thr = int(sys.argv[sys.argv.index("--threshold")+1]) if "--threshold" in sys.argv else 6
    files = sorted(glob.glob(os.path.join(d, "*.png")) + glob.glob(os.path.join(d, "*.jpg")))
    hs = {f: dhash(f) for f in files}; dup = []
    for a, b in itertools.combinations(files, 2):
        dist = sum(x != y for x, y in zip(hs[a], hs[b]))
        if dist <= thr: dup.append((dist, os.path.basename(a), os.path.basename(b)))
    for dist, a, b in sorted(dup): print(f"DUPLICATE (distance {dist}): {a}  ==  {b}")
    print(f"{len(files)} screenshots, {len(dup)} near-duplicate pair(s)")
    sys.exit(1 if dup else 0)
main()
