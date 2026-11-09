import { create } from 'zustand';
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
    const state = get();

    // Priority 1: If Exit Confirmation Dialog is currently open, dismiss it
    if (state.isExitDialogOpen) {
      state.closeExitDialog();
      return true;
    }

    // Priority 1 (continued): Custom registered overlay / modal subscribers (highest priority first)
    for (const sub of state.subscribers) {
      try {
        const handled = sub.handler();
        if (handled) return true;
      } catch (err) {
        console.warn(`[BackHandler] subscriber ${sub.id} threw:`, err);
      }
    }

    // Priority 1 (continued): Global bottom sheets (Account Menu, Workspace Switcher, Project Picker)
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
      return true; // Keep application open while navigation initializes
    }

    // Priority 2 & 3: If root stack or nested stack has history, go back
    try {
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
    } catch (e) {
      console.warn('[BackHandler] goBack failed:', e);
    }

    // Priority 4: Secondary tabs in MainTabs (Tasks, Bugs, Search) -> return to Home
    const currentRoute = navigationRef.getCurrentRoute();
    const routeName = currentRoute?.name as string | undefined;
    if (routeName && routeName !== 'Home' && routeName !== 'Auth') {
      try {
        navigationRef.navigate('MainTabs', { screen: 'Home' } as any);
        return true;
      } catch (e) {
        console.warn('[BackHandler] tab navigation to Home failed:', e);
      }
    }

    // Priority 5: On root Home (or logged-out Auth root), prompt user with Exit Confirmation Dialog
    // Never unexpectedly close the app on gesture or back press
    state.openExitDialog();
    return true;
  },
}));

