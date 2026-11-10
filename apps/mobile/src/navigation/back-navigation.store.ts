import { create } from 'zustand';
import { CommonActions } from '@react-navigation/native';
import { Keyboard } from 'react-native';
import { navigationRef } from './navigationRef';
import { useSheetStore } from '../core/sheets/sheet.store';

export interface BackSubscriber {
  id: string;
  priority: number;
  handler: () => boolean;
}

interface BackNavigationState {
  isExitDialogOpen: boolean;
  subscribers: BackSubscriber[];
  openExitDialog: () => void;
  closeExitDialog: () => void;
  registerBackSubscriber: (id: string, handler: () => boolean, priority?: number) => () => void;
  handleAndroidBack: () => boolean;
}

let isKeyboardOpen = false;
let lastBackActionTime = 0;
let exitDialogOpenTime = 0;

if (typeof Keyboard !== 'undefined' && Keyboard.addListener) {
  Keyboard.addListener('keyboardDidShow', () => {
    isKeyboardOpen = true;
  });
  Keyboard.addListener('keyboardDidHide', () => {
    isKeyboardOpen = false;
  });
}

/**
 * Checks whether the user is currently on the root Home screen
 * using the real navigation state tree.
 */
export function isAtHomeScreen(): boolean {
  if (!navigationRef.isReady()) return true;

  const currentRoute = navigationRef.getCurrentRoute();
  const routeName = currentRoute?.name as string | undefined;

  // Root Auth screen when logged out
  if (routeName === 'Auth') return true;

  // Active screen is Home
  if (routeName === 'Home') return true;

  const rootState = navigationRef.getRootState();
  if (!rootState || !rootState.routes || rootState.routes.length === 0) {
    return routeName === 'Home';
  }

  // If root stack has more than 1 screen (e.g. TaskDetail, BugDetail, Settings, CaptureModal, etc.)
  if (rootState.routes.length > 1) {
    return false;
  }

  const currentRootRoute = rootState.routes[rootState.index ?? 0];
  if (!currentRootRoute || currentRootRoute.name !== 'MainTabs') {
    return false;
  }

  // Check tab state within MainTabs
  const tabState = currentRootRoute.state;
  if (!tabState) {
    return routeName === 'Home';
  }

  const activeTabRoute = tabState.routes?.[tabState.index ?? 0];
  return (activeTabRoute?.name as string | undefined) === 'Home';
}

export const useBackNavigationStore = create<BackNavigationState>((set, get) => ({
  isExitDialogOpen: false,
  subscribers: [],

  openExitDialog: () => {
    exitDialogOpenTime = Date.now();
    set({ isExitDialogOpen: true });
  },
  closeExitDialog: () => set({ isExitDialogOpen: false }),

  registerBackSubscriber: (id: string, handler: () => boolean, priority = 10) => {
    set((state) => ({
      subscribers: [
        ...state.subscribers.filter((s) => s.id !== id),
        { id, priority, handler },
      ].sort((a, b) => b.priority - a.priority),
    }));

    return () => {
      set((state) => ({
        subscribers: state.subscribers.filter((s) => s.id !== id),
      }));
    };
  },

  handleAndroidBack: () => {
    const now = Date.now();
    // Debounce to prevent multiple navigation actions from a single gesture
    if (now - lastBackActionTime < 300) {
      return true;
    }
    lastBackActionTime = now;

    const state = get();

    // Priority 1: If Exit Confirmation Dialog is open:
    // Dismiss only if dialog has been visible for at least 800ms
    // to prevent trailing back gestures from immediately closing the dialog!
    if (state.isExitDialogOpen) {
      if (Date.now() - exitDialogOpenTime > 800) {
        state.closeExitDialog();
      }
      return true;
    }

    // Priority 2: If keyboard is visible, dismiss it first
    if (isKeyboardOpen) {
      Keyboard.dismiss();
      isKeyboardOpen = false;
      return true;
    }

    // Priority 3: Custom registered overlay / modal subscribers (highest priority first)
    for (const sub of state.subscribers) {
      try {
        const handled = sub.handler();
        if (handled) return true;
      } catch (err) {
        console.warn(`[BackHandler] subscriber ${sub.id} threw:`, err);
      }
    }

    // Priority 4: Global bottom sheets (Account Menu, Workspace Switcher, Project Picker)
    const {
      isAccountMenuOpen,
      isWorkspaceSheetOpen,
      isProjectSheetOpen,
      closeAccountMenu,
      closeWorkspaceSheet,
      closeProjectSheet,
    } = useSheetStore.getState();

    if (isAccountMenuOpen || isWorkspaceSheetOpen || isProjectSheetOpen) {
      closeAccountMenu();
      closeWorkspaceSheet();
      closeProjectSheet();
      return true;
    }

    // Ensure navigation container is ready
    if (!navigationRef.isReady()) {
      return true; // Keep app open while navigation initializes
    }

    // Priority 5: If navigation can go back in the current stack, do a smooth native pop!
    if (navigationRef.canGoBack()) {
      try {
        navigationRef.goBack();
        return true;
      } catch (err) {
        console.warn('[BackHandler] goBack failed:', err);
      }
    }

    // Priority 6: If at root of stack, check if active tab is NOT Home
    // If on another tab (Tasks, Bugs, Search), switch to Home tab smoothly
    if (!isAtHomeScreen()) {
      try {
        navigationRef.navigate('MainTabs', { screen: 'Home' } as any);
        return true;
      } catch (err) {
        console.warn('[BackHandler] Navigate to Home tab failed:', err);
      }
    }

    // Priority 7: Already on Home (root) -> Show Exit Confirmation Dialog
    state.openExitDialog();
    return true;
  },
}));
