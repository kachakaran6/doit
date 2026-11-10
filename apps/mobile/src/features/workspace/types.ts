export interface ProjectItem {
  id: string;
  name: string;
  key: string;
  color?: string;
  workspaceId: string;
  defaultAssigneeId?: string | null;
  defaultAssignee?: {
    id: string;
    name: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  projects?: ProjectItem[];
}

