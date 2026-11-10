import {
  openUri,
  dumpScreen,
  getVisibleElements,
  tap,
  tapText,
  tapDesc,
  swipe,
  scrollDown,
  scrollUp,
  typeText,
  pressBack,
  takeScreenshot,
  sleep,
  runAdb,
} from './qa-agent.mjs';

async function main() {
  console.log('=== STARTING DEEP FEATURE & CRUD QA ===\n');

  // 1. CREATE A REAL TASK & VERIFY PERSISTENCE
  console.log('--- 1. Testing Task Creation ---');
  openUri('doit://capture/task');
  sleep(1500);
  takeScreenshot('deep_01_capture_task_modal');

  const taskTitle = `Verified Task ${Date.now() % 100000}`;
  console.log(`Typing task title: "${taskTitle}"`);
  typeText(taskTitle);
  sleep(1000);
  takeScreenshot('deep_02_task_title_typed');

  // Submit via Create Task button
  const els = getVisibleElements();
  const createBtn = els.find((e) => (e.text && e.text.toLowerCase().includes('create')) || e['content-desc']?.toLowerCase().includes('create'));
  if (createBtn) {
    console.log(`Tapping create button at (${createBtn.center.x}, ${createBtn.center.y})`);
    tap(createBtn.center.x, createBtn.center.y);
  } else {
    // tap bottom right area of modal
    tap(950, 1200);
  }
  sleep(2000);
  takeScreenshot('deep_03_task_created_home');

  // 2. NAVIGATE TO TASKS TAB & VERIFY TASK APPEARS
  console.log('--- 2. Verifying Task in Tasks Screen ---');
  openUri('doit://tasks');
  sleep(1500);
  takeScreenshot('deep_04_tasks_screen_list');
  const tasksEls = getVisibleElements();
  console.log('Visible elements in Tasks Screen:');
  const foundTask = tasksEls.find((e) => e.text && e.text.includes(taskTitle));
  console.log('Found newly created task on screen:', Boolean(foundTask));

  // 3. TEST TASK COMPLETION CHECKBOX
  console.log('--- 3. Testing Task Completion Checkbox ---');
  // If foundTask, tap checkbox near it
  if (foundTask) {
    tap(foundTask.center.x - 300, foundTask.center.y); // checkbox is to the left
    sleep(1200);
    takeScreenshot('deep_05_task_checkbox_toggled');
  }

  // 4. TEST STICKY NOTE CREATION & EDITING
  console.log('--- 4. Testing Sticky Note Creation ---');
  openUri('doit://capture/sticky');
  sleep(1500);
  takeScreenshot('deep_06_capture_sticky_modal');
  const stickyContent = `Auto note ${Date.now() % 10000}`;
  typeText(stickyContent);
  sleep(800);
  // Tap Create sticky
  const stickyEls = getVisibleElements();
  const createStickyBtn = stickyEls.find((e) => (e.text && e.text.toLowerCase().includes('create')) || e['content-desc']?.toLowerCase().includes('create'));
  if (createStickyBtn) {
    tap(createStickyBtn.center.x, createStickyBtn.center.y);
  }
  sleep(1500);
  takeScreenshot('deep_07_sticky_created');

  // Navigate to Sticky Board
  openUri('doit://stickies');
  sleep(1500);
  takeScreenshot('deep_08_stickies_board_view');

  // 5. TEST BUG CREATION WITH TELEMETRY
  console.log('--- 5. Testing Bug Capture with Telemetry ---');
  openUri('doit://capture/bug');
  sleep(1500);
  takeScreenshot('deep_09_capture_bug_modal');
  const bugTitle = `QA Auto Bug ${Date.now() % 10000}`;
  typeText(bugTitle);
  sleep(800);
  const bugEls = getVisibleElements();
  const createBugBtn = bugEls.find((e) => (e.text && e.text.toLowerCase().includes('create')) || e['content-desc']?.toLowerCase().includes('create'));
  if (createBugBtn) {
    tap(createBugBtn.center.x, createBugBtn.center.y);
  }
  sleep(2000);
  takeScreenshot('deep_10_bug_created');

  // Navigate to Bugs Screen
  openUri('doit://bugs');
  sleep(1500);
  takeScreenshot('deep_11_bugs_queue_view');

  // 6. TEST THEME SWITCHING (LIGHT <-> DARK)
  console.log('--- 6. Testing Theme Switching ---');
  openUri('doit://settings');
  sleep(1500);
  takeScreenshot('deep_12_settings_appearance_before');
  // Scroll to Appearance section
  scrollDown();
  sleep(800);
  takeScreenshot('deep_13_settings_appearance_scrolled');
  const settingEls = getVisibleElements();
  const lightOption = settingEls.find((e) => e.text === 'Light' || e['content-desc'] === 'Light');
  const darkOption = settingEls.find((e) => e.text === 'Dark' || e['content-desc'] === 'Dark');
  if (lightOption) {
    console.log('Switching to Light Theme...');
    tap(lightOption.center.x, lightOption.center.y);
    sleep(1200);
    takeScreenshot('deep_14_light_theme_applied');
    // Switch back to Dark Theme
    if (darkOption) {
      console.log('Switching back to Dark Theme...');
      tap(darkOption.center.x, darkOption.center.y);
      sleep(1200);
      takeScreenshot('deep_15_dark_theme_restored');
    }
  }

  // 7. TEST OUR APPS SCREEN
  console.log('--- 7. Testing Our Apps Screen ---');
  openUri('doit://settings');
  sleep(1000);
  // Open account menu
  openUri('doit://home');
  sleep(1000);
  tapDesc('Open user account menu');
  sleep(1000);
  takeScreenshot('deep_16_account_menu');
  const menuEls = getVisibleElements();
  const ourAppsItem = menuEls.find((e) => e.text && e.text.includes('Our Apps'));
  if (ourAppsItem) {
    tap(ourAppsItem.center.x, ourAppsItem.center.y);
    sleep(1500);
    takeScreenshot('deep_17_our_apps_screen');
    pressBack();
    sleep(800);
  }

  console.log('\n=== ALL DEEP FEATURE QA TESTS COMPLETED ===');
}

main().catch(console.error);
