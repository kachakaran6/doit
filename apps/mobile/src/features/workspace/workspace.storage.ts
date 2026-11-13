import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { overlayService } from '../../native/overlay';

const ACTIVE_WORKSPACE_KEY = 'com.samyukt.doit.active_workspace_id';
const ACTIVE_WORKSPACE_BACKUP_KEY = 'com.samyukt.doit.active_workspace_backup';
const ACTIVE_PROJECT_KEY = 'com.samyukt.doit.active_project_id';

let inMemoryActiveWorkspaceId: string | null = null;
let inMemoryActiveProjectId: string | null = null;

export const WorkspaceStorage = {
  getActiveWorkspaceId(): string | null {
    return inMemoryActiveWorkspaceId;
  },

  getActiveProjectId(): string | null {
    return inMemoryActiveProjectId;
  },

  async loadPersisted(): Promise<{ workspaceId: string | null; projectId: string | null }> {
    try {
      if (Platform.OS === 'web') {
        const wsId = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_WORKSPACE_KEY) : null;
        const projId = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_PROJECT_KEY) : null;
        inMemoryActiveWorkspaceId = wsId;
        inMemoryActiveProjectId = projId;
        return { workspaceId: wsId, projectId: projId };
      }

      let wsId: string | null = null;
      let projId: string | null = null;

      try {
        wsId = await SecureStore.getItemAsync(ACTIVE_WORKSPACE_KEY);
      } catch (e) {
        console.warn('[WorkspaceStorage] Primary read error:', e);
      }

      if (!wsId) {
        try {
          wsId = await SecureStore.getItemAsync(ACTIVE_WORKSPACE_BACKUP_KEY);
        } catch {
          // ignore
        }
      }

      try {
        projId = await SecureStore.getItemAsync(ACTIVE_PROJECT_KEY);
      } catch {
        // ignore
      }

      // Secondary fallback to native overlay prefs if SecureStore was empty
      if (!wsId || !projId) {
        try {
          const creds = await overlayService.getCredentials();
          const foundWs = creds?.workspaceId;
          const foundProj = creds?.projectId;
          if (!wsId && foundWs) {
            wsId = foundWs;
            SecureStore.setItemAsync(ACTIVE_WORKSPACE_KEY, foundWs).catch(() => {});
          }
          if (!projId && foundProj) {
            projId = foundProj;
            SecureStore.setItemAsync(ACTIVE_PROJECT_KEY, foundProj).catch(() => {});
          }
        } catch {
          // ignore
        }
      }

      inMemoryActiveWorkspaceId = wsId;
      inMemoryActiveProjectId = projId;
      return { workspaceId: wsId, projectId: projId };
    } catch (e) {
      console.warn('[WorkspaceStorage] loadPersisted error:', e);
      return { workspaceId: inMemoryActiveWorkspaceId, projectId: inMemoryActiveProjectId };
    }
  },

  async saveActiveWorkspaceId(workspaceId: string | null): Promise<void> {
    inMemoryActiveWorkspaceId = workspaceId;
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          if (workspaceId) {
            localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
          } else {
            localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
          }
        }
      } catch {}
      return;
    }

    if (workspaceId) {
      SecureStore.setItemAsync(ACTIVE_WORKSPACE_KEY, workspaceId).catch(() => {});
      SecureStore.setItemAsync(ACTIVE_WORKSPACE_BACKUP_KEY, workspaceId).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(ACTIVE_WORKSPACE_KEY).catch(() => {});
      SecureStore.deleteItemAsync(ACTIVE_WORKSPACE_BACKUP_KEY).catch(() => {});
    }
  },

  async saveActiveProjectId(projectId: string | null): Promise<void> {
    inMemoryActiveProjectId = projectId;
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          if (projectId) {
            localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
          } else {
            localStorage.removeItem(ACTIVE_PROJECT_KEY);
          }
        }
      } catch {}
      return;
    }

    if (projectId) {
      SecureStore.setItemAsync(ACTIVE_PROJECT_KEY, projectId).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(ACTIVE_PROJECT_KEY).catch(() => {});
    }
  },

  async clear(): Promise<void> {
    inMemoryActiveWorkspaceId = null;
    inMemoryActiveProjectId = null;
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
          localStorage.removeItem(ACTIVE_PROJECT_KEY);
        }
      } catch {}
      return;
    }
    await Promise.allSettled([
      SecureStore.deleteItemAsync(ACTIVE_WORKSPACE_KEY),
      SecureStore.deleteItemAsync(ACTIVE_WORKSPACE_BACKUP_KEY),
      SecureStore.deleteItemAsync(ACTIVE_PROJECT_KEY),
    ]);
  },
};

// Initiate immediate pre-fetch of persisted IDs so they are ready as early as possible
WorkspaceStorage.loadPersisted().catch(() => {});