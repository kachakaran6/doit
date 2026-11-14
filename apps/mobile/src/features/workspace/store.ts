import { create } from 'zustand';
import { WorkspaceItem, ProjectItem } from './types';
import { overlayService } from '../../native/overlay';
import { useAuthStore } from '../auth';
import { http } from '../../lib/http';
import { WorkspaceStorage } from './workspace.storage';

interface WorkspaceState {
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem | null;
  activeProject: ProjectItem | null;
  setWorkspaces: (workspaces: WorkspaceItem[]) => void;
  setActiveWorkspace: (ws: WorkspaceItem) => void;
  setActiveProject: (p: ProjectItem | null) => void;
  updateWorkspaceProjects: (workspaceId: string, projects: ProjectItem[]) => void;
  fetchAndInitializeWorkspaces: () => Promise<void>;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  activeProject: null,
  setWorkspaces: (workspaces) => {
    const currentActive = get().activeWorkspace;
    const persistedWsId = WorkspaceStorage.getActiveWorkspaceId();
    const persistedProjId = WorkspaceStorage.getActiveProjectId();

    // Determine target active workspace:
    // 1. Current active in memory (if valid in new list)
    // 2. Persisted workspace ID (if valid in new list)
    // 3. Fallback to workspaces[0]
    let activeWorkspace: WorkspaceItem | null = null;
    if (currentActive && workspaces.some((w) => w.id === currentActive.id)) {
      activeWorkspace = workspaces.find((w) => w.id === currentActive.id)!;
    } else if (persistedWsId && workspaces.some((w) => w.id === persistedWsId)) {
      activeWorkspace = workspaces.find((w) => w.id === persistedWsId)!;
    } else {
      activeWorkspace = workspaces[0] || null;
    }

    // Determine target active project:
    const currentProject = get().activeProject;
    let activeProject: ProjectItem | null = null;
    if (persistedProjId === 'ALL') {
      activeProject = null;
    } else if (currentProject && activeWorkspace?.projects?.some((p) => p.id === currentProject.id)) {
      activeProject = activeWorkspace.projects.find((p) => p.id === currentProject.id)!;
    } else if (persistedProjId && activeWorkspace?.projects?.some((p) => p.id === persistedProjId)) {
      activeProject = activeWorkspace.projects.find((p) => p.id === persistedProjId)!;
    } else if (currentProject === null && !persistedProjId) {
      // User or state has selected All Projects
      activeProject = null;
    } else {
      activeProject = activeWorkspace?.projects?.[0] || null;
    }

    // Persist selected workspace and project
    WorkspaceStorage.saveActiveWorkspaceId(activeWorkspace?.id || null);
    WorkspaceStorage.saveActiveProjectId(activeProject?.id || null);

    // Keep http workspaceId in sync with active workspace
    http.setWorkspaceId(activeWorkspace?.id || null);

    const token = useAuthStore.getState().accessToken;
    const refreshToken = useAuthStore.getState().refreshToken;
    overlayService.syncAuthCredentials(
      token,
      'https://doit.samyukt.pro/api/v1',
      activeProject?.id || null,
      refreshToken,
      activeWorkspace?.id || null
    );

    set({
      workspaces,
      activeWorkspace,
      activeProject,
    });
  },
  setActiveWorkspace: (ws) => {
    const persistedProjId = WorkspaceStorage.getActiveProjectId();
    let proj: ProjectItem | null = null;
    if (persistedProjId === 'ALL') {
      proj = null;
    } else if (persistedProjId && ws.projects?.some((p) => p.id === persistedProjId)) {
      proj = ws.projects.find((p) => p.id === persistedProjId)!;
    } else {
      proj = ws.projects?.[0] || null;
    }

    WorkspaceStorage.saveActiveWorkspaceId(ws?.id || null);
    WorkspaceStorage.saveActiveProjectId(proj?.id || null);

    http.setWorkspaceId(ws?.id || null);

    const token = useAuthStore.getState().accessToken;
    const refreshToken = useAuthStore.getState().refreshToken;
    overlayService.syncAuthCredentials(
      token,
      'https://doit.samyukt.pro/api/v1',
      proj?.id || null,
      refreshToken,
      ws?.id || null
    );

    set({
      activeWorkspace: ws,
      activeProject: proj,
    });
  },
  setActiveProject: (p) => {
    WorkspaceStorage.saveActiveProjectId(p?.id || null);

    const token = useAuthStore.getState().accessToken;
    const refreshToken = useAuthStore.getState().refreshToken;
    const currentWs = get().activeWorkspace;
    overlayService.syncAuthCredentials(
      token,
      'https://doit.samyukt.pro/api/v1',
      p?.id || null,
      refreshToken,
      currentWs?.id || null
    );
    set({ activeProject: p });
  },
  updateWorkspaceProjects: (workspaceId: string, projects: ProjectItem[]) => {
    set((state) => {
      const updatedWorkspaces = state.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, projects } : w
      );
      let updatedActiveWs = state.activeWorkspace;
      let updatedActiveProj = state.activeProject;

      if (state.activeWorkspace?.id === workspaceId) {
        updatedActiveWs = { ...state.activeWorkspace, projects };
        // If current active project is no longer valid in updated project list, reset it.
        // If updatedActiveProj is null, it represents "All Projects" and shouldn't be overridden.
        if (updatedActiveProj && !projects.some((p) => p.id === updatedActiveProj?.id)) {
          updatedActiveProj = projects[0] || null;
          WorkspaceStorage.saveActiveProjectId(updatedActiveProj?.id || null);
        }
      }

      return {
        workspaces: updatedWorkspaces,
        activeWorkspace: updatedActiveWs,
        activeProject: updatedActiveProj,
      };
    });
  },
  fetchAndInitializeWorkspaces: async () => {
    try {
      // Ensure persisted storage is read from disk/keychain before setting workspaces
      await WorkspaceStorage.loadPersisted();
      const res = await http.get<WorkspaceItem[]>('/workspaces');
      if (Array.isArray(res) && res.length > 0) {
        get().setWorkspaces(res);
      }
    } catch (e) {
      console.warn('Failed to prefetch workspaces:', e);
    }
  },
  reset: () => {
    WorkspaceStorage.clear().catch(() => {});
    http.setWorkspaceId(null);
    set({
      workspaces: [],
      activeWorkspace: null,
      activeProject: null,
    });
  },
}));
