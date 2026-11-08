import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots/mobile_full');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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
  sleep(1000);
}

function swipe(x1, y1, x2, y2, duration = 300) {
  run(`adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
  sleep(800);
}

function key(code) {
  run(`adb shell input keyevent ${code}`);
  sleep(800);
}

console.log('Starting full mobile screen capture...');

// 1. Home Dashboard
openUri('doit://home');
capture('01_Home_Dashboard.png');

// 2. Workspace Switcher Sheet (tap workspace chip at top left ~180, 140)
tap(180, 140);
capture('02_Home_Workspace_Switcher_Sheet.png');
key(4); // back

// 3. Account Menu Sheet (tap avatar at top right ~980, 140)
tap(980, 140);
capture('03_Home_Account_Menu_Sheet.png');
key(4); // back

// 4. Tasks List View
openUri('doit://tasks');
capture('04_Tasks_List_View.png');

// 5. Tasks Filtered - Today
tap(310, 290); // tap Today filter chip
capture('05_Tasks_Filtered_Today.png');

// 6. Tasks Board View (tap Columns3 icon at top right ~980, 180)
tap(980, 180);
capture('06_Tasks_Board_Kanban_View.png');
// Switch back to list view
tap(880, 180);

// 7. Tasks Project Switcher Sheet (tap project subtitle ~300, 230)
tap(300, 230);
capture('07_Tasks_Project_Switcher_Sheet.png');
key(4); // back

// 8. Task Create Sheet (tap FAB or + button ~950, 2050 or in tasks)
// In tasks, check if there's a create button or navigate to detail
// 9. Task Detail Screen
openUri('doit://tasks');
sleep(1000);
// tap first task in list ~500, 480
tap(500, 480);
sleep(1000);
capture('08_Task_Detail_Screen.png');
// scroll down task detail to see telemetry/solution prompt
swipe(500, 1500, 500, 500, 400);
capture('09_Task_Detail_Scrolled_Telemetry.png');
key(4); // back

// 10. Bug Queue Screen
openUri('doit://bugs');
capture('10_Bug_Queue_Screen.png');

// 11. Bug Queue Filtered by Severity (e.g. Critical / High)
tap(350, 280);
capture('11_Bug_Queue_Filtered.png');

// 12. Bug Detail Screen
openUri('doit://bug/GEN-3');
sleep(1500);
capture('12_Bug_Detail_Screen.png');
// scroll down bug detail
swipe(500, 1500, 500, 500, 400);
capture('13_Bug_Detail_Telemetry_Section.png');
key(4); // back

// 14. Sticky Board Screen
openUri('doit://stickies');
capture('14_Sticky_Board_Screen.png');

// 15. Search Screen - Initial State
openUri('doit://search');
capture('15_Search_Initial_Screen.png');

// 16. Search Screen - Query Typed
run('adb shell input text "task"');
sleep(1000);
capture('16_Search_With_Results.png');

// 17. Notifications / Activity Feed
openUri('doit://notifications');
capture('17_Notifications_Inbox_Screen.png');

// 18. Pending Sync / Offline Outbox
openUri('doit://sync');
capture('18_Pending_Sync_Outbox_Screen.png');

// 19. Team & Members Screen
openUri('doit://team');
capture('19_Team_Members_Screen.png');

// 20. Quick Capture Modal - Task Mode
openUri('doit://capture');
capture('20_Quick_Capture_Task_Mode.png');

// 21. Quick Capture Modal - Bug Mode (tap Bug tab ~380, 250)
tap(380, 250);
capture('21_Quick_Capture_Bug_Mode.png');

// 22. Quick Capture Modal - Voice Mode (tap Voice tab ~640, 250)
tap(640, 250);
capture('22_Quick_Capture_Voice_Mode.png');

// 23. Quick Capture Modal - Sticky Mode (tap Sticky tab ~900, 250)
tap(900, 250);
capture('23_Quick_Capture_Sticky_Mode.png');
key(4); // close capture modal

// 24. Settings Main Screen
openUri('doit://settings');
capture('24_Settings_Main_Screen.png');

// Scroll down settings to see server ping, cache, and about
swipe(500, 1600, 500, 400, 400);
capture('25_Settings_Scrolled_Appearance_Cache.png');

// Scroll more to bottom of settings
swipe(500, 1600, 500, 400, 400);
capture('26_Settings_About_Diagnostics.png');

// 27. Settings Sub-Screens:
// Go back up in settings
swipe(500, 400, 500, 1600, 400);
swipe(500, 400, 500, 1600, 400);
sleep(500);

// Let's tap AI Provider in Settings (it's in the Workspace section)
// Let's check text on screen using uiautomator to find exact coordinates
// 28. Component Dev Gallery
openUri('doit://dev/gallery');
capture('27_Dev_Component_Gallery.png');
swipe(500, 1600, 500, 400, 400);
capture('28_Dev_Component_Gallery_Scrolled.png');

// 29. Foundation Dev Gallery (Tokens, colors, elevation)
openUri('doit://dev/foundation');
capture('29_Dev_Foundation_Design_Tokens.png');
swipe(500, 1600, 500, 400, 400);
capture('30_Dev_Foundation_Tokens_Scrolled.png');

// 30. Invite Accept Screen
openUri('doit://invite/tok_test_preview_12345');
capture('31_Invite_Accept_Screen.png');

console.log('Mobile screens capture finished!');

