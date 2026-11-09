import test from 'node:test';
import assert from 'node:assert/strict';

// We can test the priority hierarchy logic cleanly
test('Back Navigation Priority Hierarchy', async (t) => {
  let exitDialogOpen = false;
  let exitAppCalled = false;
  let sheetsOpen = false;
  let customOverlayOpen = false;
  let canGoBackState = true;
  let currentRoute = 'Settings';
  let navigatedTo = null;

  const handleBack = () => {
    // 1. If Exit Dialog is open, dismiss it
    if (exitDialogOpen) {
      exitDialogOpen = false;
      return true;
    }

    // 2. Custom overlays
    if (customOverlayOpen) {
      customOverlayOpen = false;
      return true;
    }

    // 3. Global sheets
    if (sheetsOpen) {
      sheetsOpen = false;
      return true;
    }

    // 4. Stack back
    if (canGoBackState) {
      canGoBackState = false; // Popped
      return true;
    }

    // 5. Secondary tabs
    if (currentRoute !== 'Home' && currentRoute !== 'Auth') {
      currentRoute = 'Home';
      navigatedTo = 'Home';
      return true;
    }

    // 6. Root screen -> open Exit Dialog
    exitDialogOpen = true;
    return true;
  };

  await t.test('Nested screen pops back to previous screen without exiting', () => {
    canGoBackState = true;
    const handled = handleBack();
    assert.equal(handled, true);
    assert.equal(canGoBackState, false);
    assert.equal(exitDialogOpen, false);
  });

  await t.test('Secondary tab navigates back to Home tab without exiting', () => {
    canGoBackState = false;
    currentRoute = 'Tasks';
    const handled = handleBack();
    assert.equal(handled, true);
    assert.equal(currentRoute, 'Home');
    assert.equal(exitDialogOpen, false);
  });

  await t.test('Root Home screen opens Exit Confirmation Dialog instead of closing app', () => {
    canGoBackState = false;
    currentRoute = 'Home';
    exitDialogOpen = false;
    const handled = handleBack();
    assert.equal(handled, true);
    assert.equal(exitDialogOpen, true);
  });

  await t.test('Back press while Exit Confirmation Dialog is open dismisses dialog', () => {
    exitDialogOpen = true;
    const handled = handleBack();
    assert.equal(handled, true);
    assert.equal(exitDialogOpen, false);
  });

  await t.test('Open sheet is dismissed first before navigating', () => {
    sheetsOpen = true;
    canGoBackState = true;
    const handled = handleBack();
    assert.equal(handled, true);
    assert.equal(sheetsOpen, false);
    assert.equal(canGoBackState, true); // Still on same screen
  });
});

