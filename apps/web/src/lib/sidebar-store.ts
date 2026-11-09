import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const STORAGE_KEY = 'doit_sidebar_collapsed';

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: localStorage.getItem(STORAGE_KEY) === 'true',

  toggle: () => {
    set((state) => {
      const next = !state.collapsed;
      localStorage.setItem(STORAGE_KEY, String(next));
      return { collapsed: next };
    });
  },

  setCollapsed: (collapsed: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    set({ collapsed });
  },
}));
