import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'K:/Doit/screenshots/mobile';
fs.mkdirSync(outDir, { recursive: true });

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function adb(cmd) {
  try {
    return execSync(`adb -s 3086027538000H5 ${cmd}`);
  } catch (e) {
    console.error('adb error:', e.message);
  }
}

function capture(name) {
  const filePath = path.join(outDir, `${name}.png`);
  const buf = execSync('adb -s 3086027538000H5 exec-out screencap -p', { maxBuffer: 20 * 1024 * 1024 });
  fs.writeFileSync(filePath, buf);
  console.log(`Captured: ${name}.png (${buf.length} bytes)`);
}

async function run() {
  console.log('Ensuring app is in foreground on Home tab...');
  adb('shell am start -n com.samyukt.doit/.MainActivity');
  sleep(1500);

  // 1. Home
  adb('shell input tap 130 2220'); // Home tab
  sleep(1000);
  capture('01_Mobile_Home_Screen');

  // 2. Workspace Switcher Sheet
  adb('shell input tap 220 180'); // Tap workspace switcher pill
  sleep(1000);
  capture('02_Mobile_Workspace_Switcher_Sheet');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(500);

  // 3. Project Switcher Sheet
  adb('shell input tap 180 260'); // Tap General project pill
  sleep(1000);
  capture('03_Mobile_Project_Switcher_Sheet');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(500);

  // 4. Tasks Tab
  adb('shell input tap 350 2220'); // Tasks tab
  sleep(1200);
  capture('04_Mobile_Tasks_List_Screen');

  // 5. Task Detail
  adb('shell input tap 540 600'); // Tap first task in list
  sleep(1500);
  capture('05_Mobile_Task_Detail_Screen');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(800);

  // 6. Bugs Tab
  adb('shell input tap 540 2220'); // Bugs tab
  sleep(1200);
  capture('06_Mobile_Bug_Queue_Screen');

  // 7. Bug Detail
  adb('shell input tap 540 600'); // Tap first bug in queue
  sleep(1500);
  capture('07_Mobile_Bug_Detail_Screen');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(800);

  // 8. Search Tab
  adb('shell input tap 690 2220'); // Search tab
  sleep(1000);
  capture('08_Mobile_Search_Screen');

  // 9. Quick Capture Modal
  adb('shell input tap 888 2190'); // Tap '+' FAB
  sleep(1500);
  capture('09_Mobile_Quick_Capture_Modal');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(500);

  // 10. Account / Profile Menu
  adb('shell input tap 130 2220'); // Home tab
  sleep(500);
  adb('shell input tap 900 180'); // Tap user avatar [AS]
  sleep(1000);
  capture('10_Mobile_Account_Profile_Screen');
  adb('shell input keyevent KEYCODE_BACK');
  sleep(500);

  console.log('Mobile screenshots captured successfully!');
}

run();

