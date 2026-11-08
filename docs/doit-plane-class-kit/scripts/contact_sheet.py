#!/usr/bin/env python3
"""Side-by-side review sheet. Usage: python3 scripts/contact_sheet.py before_dir after_dir out.png
Pairs files by name, renders [before | after] rows so a human (and the agent) can judge the change."""
import sys, os
from PIL import Image, ImageDraw
b, a, out = sys.argv[1:4]
names = sorted(set(f for f in os.listdir(b) if f.endswith(".png")) & set(f for f in os.listdir(a) if f.endswith(".png")))
H = 900; cells = []
for n in names:
    ims = []
    for d in (b, a):
        im = Image.open(os.path.join(d, n)).convert("RGB"); im = im.resize((int(im.width*H/im.height), H)); ims.append(im)
    cells.append((n, ims))
if not cells: sys.exit("no matching png names")
pw = max(c[1][0].width for c in cells); W = (pw*2 + 40) ; cols = 3
rows = (len(cells)+cols-1)//cols
sheet = Image.new("RGB", (cols*W, rows*(H+50)), "#1a1a1a"); dr = ImageDraw.Draw(sheet)
for i, (n, (x, y)) in enumerate(cells):
    cx, cy = (i % cols)*W, (i//cols)*(H+50)
    sheet.paste(x, (cx+10, cy+40)); sheet.paste(y, (cx+20+pw, cy+40))
    dr.text((cx+10, cy+10), f"{n}   BEFORE | AFTER", fill="white")
sheet.save(out); print("wrote", out)
