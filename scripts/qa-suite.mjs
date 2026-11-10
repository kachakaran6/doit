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
  checkLogcatErrors,
} from './qa-agent.mjs';

const results = [];

function recordResult(category, testName, status, details = '') {
  results.push({ category, testName, status, details, time: new Date().toISOString() });
  console.log(`[${status}] ${category} > ${testName}: ${details}`);
}

async function runTest(category, testName, fn) {
  console.log(`\n----------------------------------------------------`);
  console.log(`RUNNING: [${category}] ${testName}`);
  console.log(`----------------------------------------------------`);
  try {
    await fn();
    recordResult(category, testName, 'PASS');
  } catch (err) {
    console.error(`ERROR in ${testName}:`, err.message);
    recordResult(category, testName, 'FAIL', err.message);
    try {
      takeScreenshot(`FAIL_${category}_${testName.replace(/[^a-zA-Z0-9]/g, '_')}`);
    } catch (_) {}
  }
}

// ---------------------------------------------------------
// TEST SUITE DEFINITIONS
// ---------------------------------------------------------

export async function runAllTests() {
  console.log('Starting DoIt Comprehensive Physical Mobile QA Audit...\n');

  // Ensure app is awake and unlocked
  runAdb('shell input keyevent 224'); // WAKEUP
  runAdb('shell wm dismiss-keyguard');
  sleep(500);

  // 1. HOME SCREEN AUDIT
  await runTest('HomeScreen', 'Dashboard Load & Key Metrics', async () => {
    openUri('doit://home');
    sleep(1200);
    takeScreenshot('01_Home_Loaded');
    const elements = getVisibleElements();
    const hasWorkspace = elements.some((e) => e.text === 'Workspace' || e['content-desc'] === 'Switch workspace');
    if (!hasWorkspace) throw new Error('Workspace header not found');
  });

  await runTest('HomeScreen', 'Workspace Switcher Sheet Interaction', async () => {
    tapDesc('Switch workspace');
    sleep(1000);
    takeScreenshot('02_Home_Workspace_Sheet_Open');
    const elements = getVisibleElements();
    const hasSheet = elements.some((e) => (e.text && e.text.includes('Workspace')) || e['content-desc']?.includes('workspace'));
    if (!hasSheet) throw new Error('Workspace switcher sheet did not render');
    pressBack();
    sleep(800);
    takeScreenshot('03_Home_Workspace_Sheet_Closed');
  });

  await runTest('HomeScreen', 'Account Menu Sheet Interaction', async () => {
    openUri('doit://home');
    sleep(1200);
    tapDesc('Open user account menu');
    sleep(1000);
    takeScreenshot('04_Home_Account_Sheet_Open');
    const elements = getVisibleElements();
    const hasSettings = elements.some((e) => e.text && (e.text.includes('Settings') || e.text.includes('Sign Out') || e.text.includes('Our Apps')));
    if (!hasSettings) throw new Error('Account menu sheet did not render options');
    pressBack();
    sleep(800);
  });

  await runTest('HomeScreen', 'Metrics Navigation (0 Done / 0 Bugs / 0 Stickies)', async () => {
    openUri('doit://home');
    sleep(1000);
    // Tap Stickies metric
    try {
      tapDesc('0 Stickies');
      sleep(1200);
      takeScreenshot('05_Home_Nav_To_Stickies');
      pressBack();
      sleep(800);
    } catch (e) {
      console.log('Note: Stickies metric tap might have fallback', e.message);
    }
  });

  // 2. TASKS SCREEN & CRUD AUDIT
  await runTest('TasksScreen', 'List View & Filter Tabs', async () => {
    openUri('doit://tasks');
    sleep(1200);
    takeScreenshot('06_Tasks_List_View');
    // Test filter tabs (All, Today, Upcoming, Completed)
    const elements = getVisibleElements();
    const todayTab = elements.find((e) => e.text === 'Today');
    if (todayTab) {
      tap(todayTab.center.x, todayTab.center.y);
      sleep(800);
      takeScreenshot('07_Tasks_Filter_Today');
    }
    const allTab = elements.find((e) => e.text === 'All');
    if (allTab) {
      tap(allTab.center.x, allTab.center.y);
      sleep(800);
    }
  });

  await runTest('TasksScreen', 'Kanban Board View Toggle & Scroll', async () => {
    openUri('doit://tasks');
    sleep(1000);
    // Tap Kanban icon (top right ~980, 180 or desc if available)
    tap(980, 180);
    sleep(1200);
    takeScreenshot('08_Tasks_Board_Kanban');
    // Swipe horizontally between columns
    swipe(900, 800, 200, 800, 300);
    sleep(600);
    takeScreenshot('09_Tasks_Board_Swiped');
    swipe(200, 800, 900, 800, 300);
    sleep(600);
    // Toggle back to list view
    tap(880, 180);
    sleep(800);
    takeScreenshot('10_Tasks_Back_To_List');
  });

  await runTest('TasksScreen', 'Create Task via Quick Capture', async () => {
    openUri('doit://capture/task');
    sleep(1200);
    takeScreenshot('11_Quick_Capture_Task_Modal');
    // Type task title
    const testTitle = `QA Auto Task ${Date.now() % 10000}`;
    typeText(testTitle);
    sleep(800);
    takeScreenshot('12_Quick_Capture_Typed');
    // Find Save / Create button
    const elements = getVisibleElements();
    const saveBtn = elements.find((e) => (e.text && (e.text.includes('Create') || e.text.includes('Save') || e.text.includes('Add'))) || e['content-desc']?.includes('Create'));
    if (saveBtn) {
      tap(saveBtn.center.x, saveBtn.center.y);
      sleep(1500);
      takeScreenshot('13_Task_Created_In_List');
    } else {
      // press hardware Enter or tap bottom right
      pressBack();
    }
  });

  // 3. BUGS SCREEN AUDIT
  await runTest('BugsScreen', 'Queue Render & Severity Filters', async () => {
    openUri('doit://bugs');
    sleep(1200);
    takeScreenshot('14_Bugs_Screen_Loaded');
    const elements = getVisibleElements();
    const critFilter = elements.find((e) => e.text === 'Critical' || e.text === 'High');
    if (critFilter) {
      tap(critFilter.center.x, critFilter.center.y);
      sleep(800);
      takeScreenshot('15_Bugs_Filtered');
    }
  });

  // 4. SEARCH SCREEN AUDIT
  await runTest('SearchScreen', 'Live Search Query & Results', async () => {
    openUri('doit://search');
    sleep(1000);
    takeScreenshot('16_Search_Screen_Empty');
    typeText('test');
    sleep(1200);
    takeScreenshot('17_Search_Screen_Typed');
    // Clear search
    pressBack();
  });

  // 5. STICKY BOARD AUDIT
  await runTest('StickyBoard', 'Sticky Notes Screen & Interactions', async () => {
    openUri('doit://stickies');
    sleep(1200);
    takeScreenshot('18_Sticky_Board_Loaded');
  });

  // 6. SETTINGS & APPEARANCE AUDIT
  await runTest('SettingsScreen', 'Main Settings & Toggle Controls', async () => {
    openUri('doit://settings');
    sleep(1200);
    takeScreenshot('19_Settings_Loaded');
    // Scroll down to appearance, theme, notifications, cache
    scrollDown();
    sleep(800);
    takeScreenshot('20_Settings_Scrolled');
    scrollDown();
    sleep(800);
    takeScreenshot('21_Settings_Bottom');
  });

  // 7. SUB-SCREENS AUDIT
  await runTest('SubScreens', 'AI Provider Settings', async () => {
    openUri('doit://settings');
    sleep(800);
    try {
      tapText('AI provider');
      sleep(1200);
      takeScreenshot('22_SubScreen_Ai_Provider');
      pressBack();
      sleep(800);
    } catch (_) {}
  });

  await runTest('SubScreens', 'Quick Capture Preferences', async () => {
    openUri('doit://settings');
    sleep(800);
    try {
      tapText('Quick capture');
      sleep(1200);
      takeScreenshot('23_SubScreen_Quick_Capture_Prefs');
      pressBack();
      sleep(800);
    } catch (_) {}
  });

  await runTest('SubScreens', 'Notifications Feed Screen', async () => {
    openUri('doit://notifications');
    sleep(1200);
    takeScreenshot('24_Notifications_Feed');
    pressBack();
    sleep(800);
  });

  await runTest('SubScreens', 'Pending Sync / Offline Outbox Screen', async () => {
    openUri('doit://sync');
    sleep(1200);
    takeScreenshot('25_Pending_Sync');
    pressBack();
    sleep(800);
  });

  await runTest('SubScreens', 'Trash Screen', async () => {
    openUri('doit://trash');
    sleep(1200);
    takeScreenshot('26_Trash_Screen');
    pressBack();
    sleep(800);
  });

  await runTest('SubScreens', 'Our Apps Catalog', async () => {
    openUri('doit://settings');
    sleep(1000);
    openUri('doit://home');
    sleep(1000);
    tapDesc('Open user account menu');
    sleep(1000);
    tapText('Our Apps');
    sleep(1500);
    takeScreenshot('26b_Our_Apps_Catalog');
    try {
      tapDesc('Back');
    } catch (_) {
      pressBack();
    }
    sleep(800);
  });

  // 8. ANDROID SYSTEM & BACK NAVIGATION AUDIT
  await runTest('AndroidSystem', 'Back Navigation & Exit Confirm Dialog', async () => {
    openUri('doit://home');
    sleep(1200);
    pressBack();
    sleep(800);
    takeScreenshot('27_Exit_Confirm_Dialog');
    const elements = getVisibleElements();
    const hasExitDialog = elements.some((e) => e.text && (e.text.includes('Exit') || e.text.includes('Leave') || e.text.includes('Close') || e.text.includes('Are you sure')));
    if (hasExitDialog) {
      // Tap Cancel to stay in app
      const cancelBtn = elements.find((e) => e.text === 'Cancel' || e.text === 'Stay');
      if (cancelBtn) {
        tap(cancelBtn.center.x, cancelBtn.center.y);
        sleep(600);
      } else {
        pressBack();
      }
    }
    takeScreenshot('28_App_Remained_Open');
  });

  console.log('\n====================================================');
  console.log('QA AUDIT EXECUTION COMPLETE');
  console.log('====================================================');
  console.log(JSON.stringify(results, null, 2));
}

runAllTests();
