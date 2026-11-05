import { create } from 'zustand';
import { Workspace, Project, Label } from './types';
import { api, getStoredWorkspaceId, setStoredWorkspaceId } from './api';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  projects: Project[];
  activeProject: Project | null;
  labels: Label[];
  isLoading: boolean;
  loadWorkspaces: () => Promise<void>;
  setActiveWorkspace: (ws: Workspace) => Promise<void>;
  loadProjects: (workspaceId: string) => Promise<void>;
  setActiveProject: (p: Project) => void;
  loadLabels: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  labels: [],
  isLoading: true,

  loadWorkspaces: async () => {
    try {
      set({ isLoading: true });
      const list = await api.workspaces.list();
      const storedId = getStoredWorkspaceId();
      let active = list.find((w) => w.id === storedId) || list[0] || null;

      set({ workspaces: list, activeWorkspace: active, isLoading: false });

      if (active) {
        setStoredWorkspaceId(active.id);
        await Promise.all([
          get().loadProjects(active.id),
          get().loadLabels(active.id),
        ]);
      }
    } catch (err) {
      console.warn('[useWorkspaceStore] Failed to load workspaces:', err);
      set({ isLoading: false });
    }
  },

  setActiveWorkspace: async (ws: Workspace) => {
    setStoredWorkspaceId(ws.id);
    set({ activeWorkspace: ws, activeProject: null });
    await Promise.all([
      get().loadProjects(ws.id),
      get().loadLabels(ws.id),
    ]);
  },

  loadProjects: async (workspaceId: string) => {
    try {
      const list = await api.projects.list(workspaceId);
      const active = list[0] || null;
      set({ projects: list, activeProject: active });
    } catch (err) {
      console.warn('[useWorkspaceStore] Failed to load projects:', err);
      set({ projects: [] });
    }
  },

  setActiveProject: (p: Project) => {
    set({ activeProject: p });
  },

  loadLabels: async (workspaceId: string) => {
    try {
      const list = await api.workspaces.labels(workspaceId);
      set({ labels: list });
    } catch (err) {
      console.warn('[useWorkspaceStore] Failed to load labels:', err);
      set({ labels: [] });
    }
  },
}));
