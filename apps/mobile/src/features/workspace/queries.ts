import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../lib/http';
import { WorkspaceItem, ProjectItem } from './types';
import { useWorkspaceStore } from './store';

export function useWorkspacesQuery() {
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);

  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<WorkspaceItem[]> => {
      const res = await http.get<WorkspaceItem[]>('/workspaces');
      return Array.isArray(res) ? res : [];
    },
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      setWorkspaces(query.data);
    }
  }, [query.data, setWorkspaces]);

  return query;
}

export function useProjectsQuery(workspaceId?: string) {
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const activeProject = useWorkspaceStore((s) => s.activeProject);

  const query = useQuery({
    queryKey: ['workspaces', workspaceId, 'projects'],
    queryFn: async (): Promise<ProjectItem[]> => {
      if (!workspaceId) return [];
      const res = await http.get<ProjectItem[]>(`/workspaces/${workspaceId}/projects`);
      return Array.isArray(res) ? res : [];
    },
    enabled: Boolean(workspaceId),
  });

  useEffect(() => {
    if (query.data && workspaceId) {
      useWorkspaceStore.getState().updateWorkspaceProjects(workspaceId, query.data);
      if (query.data.length > 0) {
        // Only reset if an active project was selected and it no longer exists in query.data.
        // If activeProject is null, it represents "All Projects" which is a valid selection.
        if (activeProject && !query.data.some((p) => p.id === activeProject.id)) {
          setActiveProject(query.data[0] || null);
        }
      } else {
        if (activeProject) {
          setActiveProject(null);
        }
      }
    }
  }, [query.data, workspaceId, activeProject, setActiveProject]);

  return query;
}
