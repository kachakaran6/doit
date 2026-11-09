import { create } from 'zustand';

interface SheetState {
  isWorkspaceSheetOpen: boolean;
  isProjectSheetOpen: boolean;
  isAccountMenuOpen: boolean;
  openWorkspaceSheet: () => void;
  closeWorkspaceSheet: () => void;
  openProjectSheet: () => void;
  closeProjectSheet: () => void;
  openAccountMenu: () => void;
  closeAccountMenu: () => void;
}

export const useSheetStore = create<SheetState>((set) => ({
  isWorkspaceSheetOpen: false,
  isProjectSheetOpen: false,
  isAccountMenuOpen: false,
  openWorkspaceSheet: () => {
    console.log('[SheetStore] openWorkspaceSheet triggered');
    set({ isWorkspaceSheetOpen: true });
  },
  closeWorkspaceSheet: () => {
    console.log('[SheetStore] closeWorkspaceSheet triggered');
    set({ isWorkspaceSheetOpen: false });
  },
  openProjectSheet: () => {
    console.log('[SheetStore] openProjectSheet triggered');
    set({ isProjectSheetOpen: true });
  },
  closeProjectSheet: () => {
    console.log('[SheetStore] closeProjectSheet triggered');
    set({ isProjectSheetOpen: false });
  },
  openAccountMenu: () => {
    console.log('[SheetStore] openAccountMenu triggered');
    set({ isAccountMenuOpen: true });
  },
  closeAccountMenu: () => {
    console.log('[SheetStore] closeAccountMenu triggered');
    set({ isAccountMenuOpen: false });
  },
}));

