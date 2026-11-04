#!/usr/bin/env python3
"""Programmatic layout audit from an Android uiautomator dump.
Usage: python3 scripts/ui_audit.py shots/home.xml --density 420 [--min-pad 16] [--out shots/home.audit.json]
Finds the bugs visible in the screenshots: text flush to the screen edge, clipped/overflowing text,
touch targets < 48dp, overlapping tappable elements. Exit code 1 if any ERROR."""
import argparse, json, re, sys
import xml.etree.ElementTree as ET

B = re.compile(r"\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]")
def bounds(n):
    m = B.match(n.get("bounds", "")); return tuple(map(int, m.groups())) if m else None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xml"); ap.add_argument("--density", type=float, default=420, help="dpi from `adb shell wm density`")
    ap.add_argument("--min-pad", type=float, default=16, help="min horizontal padding (dp) for text")
    ap.add_argument("--out")
    a = ap.parse_args()
    dp = a.density/160.0
    root = ET.parse(a.xml).getroot()
    nodes = [(n, bounds(n)) for n in root.iter("node") if bounds(n)]
    W, H = nodes[0][1][2], nodes[0][1][3]   # root node = screen
    issues = []
    def add(sev, code, n, b, msg): issues.append(dict(sev=sev, code=code, text=(n.get("text") or n.get("content-desc") or n.get("resource-id") or n.get("class")), bounds=b, msg=msg))

    clickables = []
    for n, b in nodes:
        l, t, r, bt = b; w, h = r-l, bt-t
        text = (n.get("text") or "").strip(); clickable = n.get("clickable") == "true"
        if w <= 0 or h <= 0: continue
        if text:
            if l < a.min_pad*dp*0.5 or (W-r) < a.min_pad*dp*0.5 and r <= W:
                add("ERROR", "EDGE_FLUSH", n, b, f"text hugs the screen edge ({l/dp:.0f}dp left / {(W-r)/dp:.0f}dp right)")
            if r > W + 2 or l < -2:
                add("WARN", "OVERFLOW", n, b, "text extends beyond the screen (ok only inside an intentional horizontal scroller)")
        if clickable:
            clickables.append((n, b))
            if (w/dp < 48 or h/dp < 48) and n.get("class", "").find("ScrollView") < 0:
                add("WARN", "SMALL_TARGET", n, b, f"touch target {w/dp:.0f}x{h/dp:.0f}dp (< 48dp)")
    for i in range(len(clickables)):
        for j in range(i+1, len(clickables)):
            (n1, b1), (n2, b2) = clickables[i], clickables[j]
            ix = max(0, min(b1[2], b2[2]) - max(b1[0], b2[0])); iy = max(0, min(b1[3], b2[3]) - max(b1[1], b2[1]))
            inter = ix*iy; a1 = (b1[2]-b1[0])*(b1[3]-b1[1]); a2 = (b2[2]-b2[0])*(b2[3]-b2[1])
            contained = (b1[0] <= b2[0] and b1[1] <= b2[1] and b1[2] >= b2[2] and b1[3] >= b2[3]) or (b2[0] <= b1[0] and b2[1] <= b1[1] and b2[2] >= b1[2] and b2[3] >= b1[3])
            if inter and not contained and inter/min(a1, a2) > 0.3:
                add("ERROR", "OVERLAP", n1, b1, f"overlaps another tappable element: {n2.get('text') or n2.get('content-desc') or n2.get('class')}")
    errs = [i for i in issues if i["sev"] == "ERROR"]
    print(f"screen {W}x{H}px ({W/dp:.0f}x{H/dp:.0f}dp)  errors={len(errs)}  warnings={len(issues)-len(errs)}")
    for i in issues: print(f"[{i['sev']}] {i['code']:12s} {str(i['text'])[:40]!r:44s} {i['bounds']}  {i['msg']}")
    if a.out: json.dump(issues, open(a.out, "w"), indent=2)
    sys.exit(1 if errs else 0)
main()
