import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DEVICE = '3086027538000H5';
const SCREENSHOT_DIR = path.resolve('screenshots/mobile_qa');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export function runAdb(cmd) {
  try {
    return execSync(`adb -s ${DEVICE} ${cmd}`, { stdio: 'pipe' }).toString();
  } catch (err) {
    if (err.stdout) return err.stdout.toString();
    throw err;
  }
}

export function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function dumpScreen() {
  runAdb('shell uiautomator dump /sdcard/dump.xml');
  const xml = runAdb('shell cat /sdcard/dump.xml');
  const nodes = [];
  const regex = /<node\s+([^>]+?)\s*\/?>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const attrsStr = match[1];
    const attrs = {};
    const attrRegex = /([a-zA-Z-]+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      let val = attrMatch[2];
      val = val
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      attrs[attrMatch[1]] = val;
    }
    if (attrs.bounds) {
      const boundsMatch = attrs.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
      if (boundsMatch) {
        const left = parseInt(boundsMatch[1], 10);
        const top = parseInt(boundsMatch[2], 10);
        const right = parseInt(boundsMatch[3], 10);
        const bottom = parseInt(boundsMatch[4], 10);
        attrs.rect = { left, top, right, bottom };
        attrs.center = {
          x: Math.round((left + right) / 2),
          y: Math.round((top + bottom) / 2),
        };
      }
    }
    nodes.push(attrs);
  }
  return { xml, nodes };
}

export function getVisibleElements() {
  const { nodes } = dumpScreen();
  return nodes.filter(
    (n) =>
      (n.text || n['content-desc']) &&
      n.rect &&
      n.rect.right > 0 &&
      n.rect.bottom > 0 &&
      n.rect.top < 2400
  );
}

export function printScreenSummary() {
  const elements = getVisibleElements();
  console.log('=== VISIBLE SCREEN ELEMENTS ===');
  for (const el of elements) {
    const desc = el['content-desc'] ? ` [desc: "${el['content-desc']}"]` : '';
    const click = el.clickable === 'true' ? ' (clickable)' : '';
    console.log(
      `- "${el.text || ''}"${desc}${click} at [${el.rect.left},${el.rect.top}]->[${el.rect.right},${el.rect.bottom}] center=(${el.center.x},${el.center.y})`
    );
  }
  console.log('===============================');
  return elements;
}

export function tap(x, y) {
  console.log(`Tapping (${x}, ${y})`);
  runAdb(`shell input tap ${x} ${y}`);
  sleep(600);
}

export function tapElement(predicate, label = 'element') {
  const { nodes } = dumpScreen();
  const el = nodes.find(predicate);
  if (!el || !el.center) {
    throw new Error(`Could not find ${label} to tap`);
  }
  console.log(`Tapping ${label} at (${el.center.x}, ${el.center.y})`);
  tap(el.center.x, el.center.y);
  return el;
}

export function tapText(text, exact = false) {
  return tapElement((n) => {
    if (!n.text) return false;
    if (exact) return n.text === text;
    return n.text.toLowerCase().includes(text.toLowerCase());
  }, `text "${text}"`);
}

export function tapDesc(desc, exact = false) {
  return tapElement((n) => {
    const cd = n['content-desc'];
    if (!cd) return false;
    if (exact) return cd === desc;
    return cd.toLowerCase().includes(desc.toLowerCase());
  }, `content-desc "${desc}"`);
}

export function swipe(x1, y1, x2, y2, duration = 300) {
  console.log(`Swiping (${x1},${y1}) -> (${x2},${y2}) in ${duration}ms`);
  runAdb(`shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
  sleep(700);
}

export function scrollDown() {
  swipe(540, 1600, 540, 500, 350);
}

export function scrollUp() {
  swipe(540, 600, 540, 1600, 350);
}

export function typeText(text) {
  // Replace spaces with %s for adb input
  const sanitized = text.replace(/ /g, '%s');
  runAdb(`shell input text "${sanitized}"`);
  sleep(500);
}

export function pressBack() {
  console.log('Pressing Back key (event 4)');
  runAdb('shell input keyevent 4');
  sleep(700);
}

export function openUri(uri) {
  console.log(`Opening URI: ${uri}`);
  runAdb(`shell am start -W -a android.intent.action.VIEW -d "${uri}" com.samyukt.doit`);
  sleep(1500);
}

export function takeScreenshot(name) {
  runAdb('shell screencap -p /sdcard/qa_scr.png');
  const target = path.join(SCREENSHOT_DIR, `${name}.png`);
  runAdb(`pull /sdcard/qa_scr.png "${target}"`);
  console.log(`Saved screenshot: ${name}.png`);
  return target;
}

export function checkLogcatErrors(sinceSeconds = 10) {
  const logs = runAdb(`logcat -d -s ReactNativeJS:E AndroidRuntime:E *:F`);
  const lines = logs.split('\n').filter((l) => l.trim().length > 0);
  return lines;
}
