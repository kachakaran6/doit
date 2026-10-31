import { create } from 'zustand';
import { WorkspaceItem, ProjectItem } from './types';

interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem | null;
  activeProject: ProjectItem | null;
  setWorkspaces: (workspaces: WorkspaceItem[]) => void;
  setActiveWorkspace: (ws: WorkspaceItem) => void;
  setActiveProject: (p: ProjectItem) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  activeProject: null,
  setWorkspaces: (workspaces) => {
    const currentActive = get().activeWorkspace;
    const activeWorkspace =
      currentActive && workspaces.some((w) => w.id === currentActive.id)
        ? currentActive
        : workspaces[0] || null;

    set({
      workspaces,
      activeWorkspace,
    });
  },
  setActiveWorkspace: (ws) => set({ activeWorkspace: ws }),
  setActiveProject: (p) => set({ activeProject: p }),
}));
