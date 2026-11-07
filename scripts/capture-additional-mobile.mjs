import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots/mobile_full');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (err) {
    return err.stdout ? err.stdout.toString() : err.message;
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function capture(filename) {
  run('adb shell screencap -p /sdcard/scr.png');
  const target = path.join(outDir, filename);
  run(`adb pull /sdcard/scr.png "${target}"`);
  console.log(`Captured: ${filename}`);
}

function openUri(uri) {
  run(`adb shell am start -W -a android.intent.action.VIEW -d "${uri}" com.samyukt.doit`);
  sleep(1500);
}

function tap(x, y) {
  run(`adb shell input tap ${x} ${y}`);
  sleep(1200);
}

function swipe(x1, y1, x2, y2, duration = 300) {
  run(`adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
  sleep(800);
}

function key(code) {
  run(`adb shell input keyevent ${code}`);
  sleep(800);
}

// 1. Capture Project Context Screen
console.log('Capturing Project Context...');
openUri('doit://settings');
tap(560, 1008); // tap Project context
capture('32_Project_Context_Screen.png');
key(4); // back to settings

// 2. Capture Quick Capture Prefs Screen
console.log('Capturing Quick Capture Prefs...');
openUri('doit://settings');
tap(560, 1183); // tap Quick capture
capture('33_Quick_Capture_Prefs_Screen.png');
key(4); // back to settings

// 3. Capture AI Provider Screen
console.log('Capturing AI Provider Screen...');
openUri('doit://settings');
tap(560, 1357); // tap AI provider
capture('34_AI_Provider_Screen.png');
key(4); // back to settings

// 4. Capture Quick Capture Guide Sheet (How it works)
console.log('Capturing Quick Capture Guide Sheet...');
openUri('doit://settings');
tap(924, 2080); // tap How it works
capture('35_Quick_Capture_Guide_Sheet.png');
key(4); // close sheet

// 5. Home Screen scrolled down to Stickies & Stats
console.log('Capturing Home scrolled...');
openUri('doit://home');
swipe(500, 1600, 500, 600, 400);
capture('36_Home_Scrolled_Stickies_Section.png');

// 6. Tasks Board View Scrolled to In Progress / Done columns
console.log('Capturing Tasks Board scrolled...');
openUri('doit://tasks');
tap(980, 180); // switch to board view
swipe(900, 800, 100, 800, 400); // scroll horizontally across columns
capture('37_Tasks_Board_Kanban_Scrolled.png');

// 7. Sticky Board Screen with Sticky Note Opened
console.log('Capturing Sticky Note opened...');
openUri('doit://stickies');
tap(300, 400); // tap first sticky card
capture('38_Sticky_Board_Detail_Sheet.png');
key(4); // close

console.log('Additional mobile captures complete!');

