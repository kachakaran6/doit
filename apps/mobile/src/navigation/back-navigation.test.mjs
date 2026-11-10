import test from 'node:test';
import assert from 'node:assert/strict';

test('DoIt Global Android Back Navigation & Exit Handling', async (t) => {
  let isExitDialogOpen = false;
  let isKeyboardOpen = false;
  let isSheetOpen = false;
  let isCustomModalOpen = false;
  let currentScreen = 'TaskDetail';
  let isAtHome = false;
  let lastActionTime = 0;
  let resetToHomeCalled = false;

  const handleAndroidBack = (now = 1000) => {
    // Debounce rapid calls
    if (now - lastActionTime < 300) {
      return true;
    }
    lastActionTime = now;

    // 1. If Exit Confirmation Dialog is open, dismiss it
    if (isExitDialogOpen) {
      isExitDialogOpen = false;
      return true;
    }

    // 2. If keyboard is open, dismiss it
    if (isKeyboardOpen) {
      isKeyboardOpen = false;
      return true;
    }

    // 3. If custom modal is open, dismiss it
    if (isCustomModalOpen) {
      isCustomModalOpen = false;
      return true;
    }

    // 4. If global bottom sheet is open, dismiss it
    if (isSheetOpen) {
      isSheetOpen = false;
      return true;
    }

    // 5. If user is already on Home Screen, show Exit Confirmation Dialog
    if (isAtHome) {
      isExitDialogOpen = true;
      return true;
    }

    // 6. User is anywhere else inside the app (Task Details, Bug Details, Settings, Tabs, etc.)
    // Directly navigate to Home and reset navigation state!
    resetToHomeCalled = true;
    currentScreen = 'Home';
    isAtHome = true;
    return true;
  };

  await t.test('Scenario A: User in Task Details -> Navigates directly to Home and resets history', () => {
    currentScreen = 'TaskDetail';
    isAtHome = false;
    resetToHomeCalled = false;
    isExitDialogOpen = false;

    const handled = handleAndroidBack(1000);
    assert.equal(handled, true);
    assert.equal(resetToHomeCalled, true);
    assert.equal(currentScreen, 'Home');
    assert.equal(isAtHome, true);
    assert.equal(isExitDialogOpen, false);
  });

  await t.test('Scenario B: User on Home Screen -> Opens Exit Confirmation Dialog instead of closing', () => {
    isAtHome = true;
    currentScreen = 'Home';
    isExitDialogOpen = false;

    const handled = handleAndroidBack(2000);
    assert.equal(handled, true);
    assert.equal(isExitDialogOpen, true);
  });

  await t.test('Scenario B2: Back press while Exit Confirmation Dialog is open dismisses dialog', () => {
    isAtHome = true;
    isExitDialogOpen = true;

    const handled = handleAndroidBack(3000);
    assert.equal(handled, true);
    assert.equal(isExitDialogOpen, false);
    assert.equal(isAtHome, true);
  });

  await t.test('Scenario C: User opens a nested screen again (Tasks -> Task Details) -> Back goes directly to Home', () => {
    isAtHome = false;
    currentScreen = 'TaskDetail';
    resetToHomeCalled = false;

    const handled = handleAndroidBack(4000);
    assert.equal(handled, true);
    assert.equal(resetToHomeCalled, true);
    assert.equal(currentScreen, 'Home');
    assert.equal(isAtHome, true);
  });

  await t.test('Scenario D: Bottom sheet or modal open -> Closes sheet first before navigating', () => {
    isAtHome = false;
    currentScreen = 'TaskDetail';
    isSheetOpen = true;
    resetToHomeCalled = false;

    const handled = handleAndroidBack(5000);
    assert.equal(handled, true);
    assert.equal(isSheetOpen, false);
    // User is still on TaskDetail because the sheet was dismissed
    assert.equal(currentScreen, 'TaskDetail');

    // Next back action will now navigate to Home
    const nextHandled = handleAndroidBack(5500);
    assert.equal(nextHandled, true);
    assert.equal(currentScreen, 'Home');
    assert.equal(isAtHome, true);
  });

  await t.test('Scenario E: Keyboard open -> Dismisses keyboard first', () => {
    isAtHome = false;
    currentScreen = 'TaskDetail';
    isKeyboardOpen = true;

    const handled = handleAndroidBack(6000);
    assert.equal(handled, true);
    assert.equal(isKeyboardOpen, false);
    assert.equal(currentScreen, 'TaskDetail');
  });

  await t.test('Scenario F: Rapid back gestures are debounced within 300ms', () => {
    isAtHome = true;
    isExitDialogOpen = false;

    // First call at t=7000 opens dialog
    handleAndroidBack(7000);
    assert.equal(isExitDialogOpen, true);

    // Immediate rapid second call at t=7100 should be debounced and not toggle dialog
    handleAndroidBack(7100);
    assert.equal(isExitDialogOpen, true);
  });
});
