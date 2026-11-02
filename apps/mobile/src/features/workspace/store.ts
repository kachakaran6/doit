import { create } from 'zustand';
import { WorkspaceItem, ProjectItem } from './types';
import { overlayService } from '../../native/overlay';
import { useAuthStore } from '../auth';

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

    if (activeProject) {
      const token = useAuthStore.getState().accessToken;
      overlayService.syncAuthCredentials(token, 'https://doit.samyukt.pro/api/v1', activeProject.id);
    }

    set({
      workspaces,
      activeWorkspace,
      activeProject,
    });
  },
  setActiveWorkspace: (ws) => {
    const proj = ws.projects?.[0] || null;
    if (proj) {
      const token = useAuthStore.getState().accessToken;
      overlayService.syncAuthCredentials(token, 'https://doit.samyukt.pro/api/v1', proj.id);
    }
    set({
      activeWorkspace: ws,
      activeProject: proj,
    });
  },
  setActiveProject: (p) => {
    const token = useAuthStore.getState().accessToken;
    overlayService.syncAuthCredentials(token, 'https://doit.samyukt.pro/api/v1', p.id);
    set({ activeProject: p });
  },
}));
