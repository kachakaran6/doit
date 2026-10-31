export interface ProjectItem {
  id: string;
  name: string;
  key: string;
  color?: string;
  workspaceId: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  projects?: ProjectItem[];
}

