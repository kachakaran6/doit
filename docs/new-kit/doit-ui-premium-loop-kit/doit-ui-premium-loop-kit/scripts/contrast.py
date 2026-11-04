#!/usr/bin/env python3
"""WCAG contrast check for the token file. Usage: python3 scripts/contrast.py templates/premium-tokens.json
Exit code 1 if any pair fails. Re-run after every palette change."""
import json, sys

def lum(h):
    h = h.lstrip('#'); r, g, b = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    f = lambda c: c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a, b):
    la, lb = lum(a), lum(b); hi, lo = max(la, lb), min(la, lb); return (hi+0.05)/(lo+0.05)
def get(t, path):
    cur = t
    for p in path.split('.'): cur = cur[p]
    return cur

t = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "templates/premium-tokens.json"))
fails = 0
def check(name, fg, bg, need):
    global fails
    r = cr(fg, bg); ok = r >= need
    fails += (not ok)
    print(f"{'PASS' if ok else 'FAIL'}  {r:5.2f} (need {need})  {name}: {fg} on {bg}")
for fg, bg, need in t["contrastPairs"]:
    check(f"{fg} / {bg}", get(t, fg), get(t, bg), need)
for name, a in t["accents"].items():
    check(f"accent.{name} white on fillLight", "#FFFFFF", a["fillLight"], 4.5)
    check(f"accent.{name} white on fillDark", "#FFFFFF", a["fillDark"], 4.5)
    check(f"accent.{name} textLight on light.surface1", a["textLight"], t["light"]["surface1"], 4.5)
    check(f"accent.{name} textDark on dark.surface1", a["textDark"], t["dark"]["surface1"], 4.5)
for mode in ("dark", "light"):
    for k in ("success", "warning", "danger"):
        check(f"{mode}.{k} white on fill", "#FFFFFF", t[mode][k]["fill"], 4.5)
print(f"\n{fails} failing pair(s)")
sys.exit(1 if fails else 0)
