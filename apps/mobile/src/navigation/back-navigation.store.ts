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

  openExitDialog: () => set({ isExitDialogOpen: true }),
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

    // Priority 1: If Exit Confirmation Dialog is open, dismiss it and stay on Home
    if (state.isExitDialogOpen) {
      state.closeExitDialog();
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

    // Priority 5: Home Screen Detection
    // If the user is already on the Home screen (or Auth root), show Exit Confirmation Dialog
    if (isAtHomeScreen()) {
      state.openExitDialog();
      return true;
    }

    // Priority 6: Any other screen (Task Details, Bug Details, Sticky Notes, Settings, other tabs)
    // Directly navigate to Home and RESET the navigation state so history does not retain old screens!
    try {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [{ name: 'Home' }],
                index: 0,
              },
            },
          ],
        })
      );
      return true;
    } catch (e) {
      console.warn('[BackHandler] Reset to Home failed, falling back to navigate:', e);
      try {
        navigationRef.navigate('MainTabs', { screen: 'Home' } as any);
        return true;
      } catch (err) {
        console.warn('[BackHandler] Navigation fallback failed:', err);
      }
    }

    // Fallback safeguard: Never allow the app to exit unexpectedly
    state.openExitDialog();
    return true;
  },
}));
