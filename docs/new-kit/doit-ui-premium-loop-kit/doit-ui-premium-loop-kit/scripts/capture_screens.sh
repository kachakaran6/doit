#!/usr/bin/env bash
# Capture PNG + uiautomator XML for every screen in scripts/routes.txt using deep links.
# Usage: scripts/capture_screens.sh <out_dir>      (device/emulator connected, app installed, logged in)
# routes.txt lines:  name|deeplink     e.g.  home|doit://home   (add the deep links to the app, or use Maestro instead)
set -euo pipefail
OUT="${1:-shots/$(date +%Y%m%d-%H%M%S)}"; mkdir -p "$OUT"
PKG="com.samyukt.doit"
DENS=$(adb shell wm density | grep -oE '[0-9]+' | tail -1); echo "density=$DENS" > "$OUT/meta.txt"
while IFS='|' read -r NAME LINK; do
  [[ -z "${NAME}" || "${NAME}" =~ ^# ]] && continue
  adb shell am start -a android.intent.action.VIEW -d "$LINK" "$PKG" >/dev/null
  sleep 2.5
  adb exec-out screencap -p > "$OUT/$NAME.png"
  adb shell uiautomator dump /sdcard/ui.xml >/dev/null && adb pull -q /sdcard/ui.xml "$OUT/$NAME.xml"
  python3 "$(dirname "$0")/ui_audit.py" "$OUT/$NAME.xml" --density "$DENS" --out "$OUT/$NAME.audit.json" || true
done < "$(dirname "$0")/routes.txt"
echo "Saved to $OUT"
