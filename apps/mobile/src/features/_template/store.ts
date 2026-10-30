import { create } from 'zustand';

interface XState {
  selectedId: string | null;
  isCreateOpen: boolean;
  setSelectedId: (id: string | null) => void;
  setCreateOpen: (open: boolean) => void;
}

export const useXStore = create<XState>((set) => ({
  selectedId: null,
  isCreateOpen: false,
  setSelectedId: (id) => set({ selectedId: id }),
  setCreateOpen: (open) => set({ isCreateOpen: open }),
}));
