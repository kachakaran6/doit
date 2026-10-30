import { create } from 'zustand';
import { TaskViewMode } from './types';

interface TaskUiState {
  viewMode: TaskViewMode;
  setViewMode: (mode: TaskViewMode) => void;
  isCreateSheetOpen: boolean;
  setCreateSheetOpen: (open: boolean) => void;
}

export const useTaskStore = create<TaskUiState>((set) => ({
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  isCreateSheetOpen: false,
  setCreateSheetOpen: (open) => set({ isCreateSheetOpen: open }),
}));
