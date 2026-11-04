#!/usr/bin/env python3
"""
Milestone M1 Empirical Contrast Challenger Script
Tests WCAG AA standards (>= 4.5:1 body text, >= 3:1 components/large text).
"""

def lum(h):
    h = h.lstrip('#')
    r, g, b = [int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def cr(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

accents = {
    'blue':   {'fillLight': '#2F5BEA', 'fillDark': '#3A66F2', 'textLight': '#2750D8', 'textDark': '#8FAEFF'},
    'violet': {'fillLight': '#7B54E8', 'fillDark': '#7B54E8', 'textLight': '#6A3FD6', 'textDark': '#B9A3FF'},
    'green':  {'fillLight': '#0E8550', 'fillDark': '#0E8550', 'textLight': '#18794E', 'textDark': '#5FD38D'},
    'orange': {'fillLight': '#C24E07', 'fillDark': '#C24E07', 'textLight': '#B24400', 'textDark': '#FFA066'},
    'rose':   {'fillLight': '#D6305A', 'fillDark': '#D6305A', 'textLight': '#C1234B', 'textDark': '#FF8BA7'},
}

surfaces_light = {
    'canvas': '#F4F4F7',
    'surface1': '#FFFFFF',
    'surface2': '#F0F0F4',
    'surface3': '#E8E8EE',
}

surfaces_dark = {
    'canvas': '#0B0B0E',
    'surface1': '#141418',
    'surface2': '#1C1C22',
    'surface3': '#25252C',
}

text_light = {
    'text.primary': '#16161A',
    'text.secondary': '#5B5B66',
    'text.tertiary': '#6B6B77',
}

text_dark = {
    'text.primary': '#F5F5F7',
    'text.secondary': '#A3A3AD',
    'text.tertiary': '#868691',
}

semantics_light = {
    'success.fill': '#0E8550',
    'success.text': '#18794E',
    'warning.fill': '#A15E00',
    'warning.text': '#9A5B00',
    'danger.fill': '#C93C35',
    'danger.text': '#C8322B',
    'info.fill': '#2563EB',
    'info.text': '#2563EB',
}

semantics_dark = {
    'success.fill': '#0E8550',
    'success.text': '#5FD38D',
    'warning.fill': '#A15E00',
    'warning.text': '#FFB84D',
    'danger.fill': '#C93C35',
    'danger.text': '#FF7A72',
    'info.fill': '#3B82F6',
    'info.text': '#60A5FA',
}

print("=" * 80)
print("CHALLENGE 1: WHITE TEXT (#FFFFFF) ON fillLight AND fillDark FOR 5 ACCENTS")
print("Target: >= 4.5:1 (WCAG AA normal text)")
print("=" * 80)
for name, a in accents.items():
    cr_fl = cr('#FFFFFF', a['fillLight'])
    cr_fd = cr('#FFFFFF', a['fillDark'])
    fl_pass = "PASS" if cr_fl >= 4.5 else "FAIL"
    fd_pass = "PASS" if cr_fd >= 4.5 else "FAIL"
    print(f"[{fl_pass}] {name:6s} #FFFFFF on fillLight ({a['fillLight']}): {cr_fl:.2f}:1")
    print(f"[{fd_pass}] {name:6s} #FFFFFF on fillDark  ({a['fillDark']}):  {cr_fd:.2f}:1")

print("\n" + "=" * 80)
print("CHALLENGE 2: textLight ON LIGHT SURFACES (canvas #F4F4F7, surface1 #FFFFFF, etc.)")
print("Target: >= 4.5:1 (WCAG AA normal text)")
print("=" * 80)
for name, a in accents.items():
    for sname, sval in surfaces_light.items():
        c = cr(a['textLight'], sval)
        res = "PASS" if c >= 4.5 else "FAIL"
        print(f"[{res}] {name:6s} textLight ({a['textLight']}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n" + "=" * 80)
print("CHALLENGE 3: textDark ON DARK SURFACES (canvas #0B0B0E, surface1 #141418, etc.)")
print("Target: >= 4.5:1 (WCAG AA normal text)")
print("=" * 80)
for name, a in accents.items():
    for sname, sval in surfaces_dark.items():
        c = cr(a['textDark'], sval)
        res = "PASS" if c >= 4.5 else "FAIL"
        print(f"[{res}] {name:6s} textDark  ({a['textDark']}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n" + "=" * 80)
print("CHALLENGE 4: TEXT HIERARCHY (primary, secondary, tertiary) ON ALL SURFACES")
print("Target: primary >= 4.5:1, secondary >= 4.5:1, tertiary >= 4.5:1 (or >= 3:1 for large/disabled)")
print("=" * 80)
print("--- Light Mode Text Levels ---")
for tname, tval in text_light.items():
    for sname, sval in surfaces_light.items():
        c = cr(tval, sval)
        res_45 = "PASS(4.5)" if c >= 4.5 else ("PASS(3.0)" if c >= 3.0 else "FAIL")
        print(f"[{res_45:9s}] {tname:14s} ({tval}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n--- Dark Mode Text Levels ---")
for tname, tval in text_dark.items():
    for sname, sval in surfaces_dark.items():
        c = cr(tval, sval)
        res_45 = "PASS(4.5)" if c >= 4.5 else ("PASS(3.0)" if c >= 3.0 else "FAIL")
        print(f"[{res_45:9s}] {tname:14s} ({tval}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n" + "=" * 80)
print("CHALLENGE 5: SEMANTICS CONTRAST (White on Fill, and Text on Surfaces)")
print("Target: >= 4.5:1")
print("=" * 80)
print("--- Light Semantics: White on Fill ---")
for k in ['success', 'warning', 'danger', 'info']:
    fill = semantics_light[f'{k}.fill']
    c = cr('#FFFFFF', fill)
    res = "PASS" if c >= 4.5 else "FAIL"
    print(f"[{res}] light {k:7s} #FFFFFF on fill ({fill}): {c:.2f}:1")

print("\n--- Light Semantics: Text on Surfaces ---")
for k in ['success', 'warning', 'danger', 'info']:
    txt = semantics_light[f'{k}.text']
    for sname, sval in surfaces_light.items():
        c = cr(txt, sval)
        res = "PASS" if c >= 4.5 else "FAIL"
        print(f"[{res}] light {k:7s} text ({txt}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n--- Dark Semantics: White on Fill ---")
for k in ['success', 'warning', 'danger', 'info']:
    fill = semantics_dark[f'{k}.fill']
    c = cr('#FFFFFF', fill)
    res = "PASS" if c >= 4.5 else "FAIL"
    print(f"[{res}] dark  {k:7s} #FFFFFF on fill ({fill}): {c:.2f}:1")

print("\n--- Dark Semantics: Text on Surfaces ---")
for k in ['success', 'warning', 'danger', 'info']:
    txt = semantics_dark[f'{k}.text']
    for sname, sval in surfaces_dark.items():
        c = cr(txt, sval)
        res = "PASS" if c >= 4.5 else "FAIL"
        print(f"[{res}] dark  {k:7s} text ({txt}) on {sname:8s} ({sval}): {c:.2f}:1")

print("\n" + "=" * 80)
print("CHALLENGE 6: SURFACE LUMINANCE RAMP (8% LADDER VALIDATION)")
print("=" * 80)
print("Light Mode relative luminance:")
for sname, sval in surfaces_light.items():
    print(f"  {sname:8s} ({sval}): lum = {lum(sval):.4f}")
print("Dark Mode relative luminance:")
for sname, sval in surfaces_dark.items():
    print(f"  {sname:8s} ({sval}): lum = {lum(sval):.4f}")
