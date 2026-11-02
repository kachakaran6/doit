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

    const currentProject = get().activeProject;
    const activeProject =
      currentProject && activeWorkspace?.projects?.some((p) => p.id === currentProject.id)
        ? currentProject
        : activeWorkspace?.projects?.[0] || null;

    set({
      workspaces,
      activeWorkspace,
      activeProject,
    });
  },
  setActiveWorkspace: (ws) =>
    set({
      activeWorkspace: ws,
      activeProject: ws.projects?.[0] || null,
    }),
  setActiveProject: (p) => set({ activeProject: p }),
}));
