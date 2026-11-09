export interface User {
  id: string;
  email: string;
  name: string;
  locale?: string;
  avatarUrl?: string | null;
  memberships?: Array<{
    workspaceId: string;
    workspaceName?: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
  }>;
  prefs?: {
    theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
    accent?: string;
    density?: 'comfortable' | 'compact';
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
  createdAt?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email?: string | null;
  role: 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
  tokenHash: string;
  inviteLink?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedBy?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string | null;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  taskId?: string | null;
  bugId?: string | null;
  kind: 'IMAGE' | 'AUDIO' | 'FILE';
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  url?: string;
  thumbUrl?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  humanId: string;
  projectId: string;
  type: 'TASK' | 'BUG';
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  severity?: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
  deviceContext?: {
    platform?: string;
    osVersion?: string;
    deviceModel?: string;
    appVersion?: string;
    batteryLevel?: number;
    networkType?: string;
  } | null;
  dueAt?: string | null;
  dueHasTime?: boolean;
  order: string;
  source: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  labels?: Array<{
    id: string;
    label: Label;
  }>;
  attachments?: TaskAttachment[];
  attachmentCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bug extends Task {
  severity?: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
  deviceContext?: {
    platform?: string;
    osVersion?: string;
    deviceModel?: string;
    appVersion?: string;
    batteryLevel?: number;
    networkType?: string;
  } | null;
}

export interface Sticky {
  id: string;
  projectId: string;
  body: string;
  color?: string | null;
  isPinned: boolean;
  order: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  device?: string | null;
  platform?: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  fromAddress?: string;
  senderName?: string;
  configured: boolean;
  hasPassword?: boolean;
}
