import {
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  Project,
  Task,
  Bug,
  Sticky,
  Label,
  UserSession,
  SmtpConfig,
} from './types';

// Detect whether running in development with proxy or production
const ENV_API_URL = (import.meta as any).env?.VITE_API_URL as string;
export const API_BASE = ENV_API_URL || 'https://doit.samyukt.pro/api/v1';

/**
 * Resolves static attachment URLs to the real backend host serving files.
 * Handles relative /static/... paths, legacy localhost, and wrong frontend hostnames.
 */
export function resolveAttachmentUrl(url?: string | null): string {
  if (!url) return '';
  try {
    const apiOrigin = new URL(API_BASE).origin;
    if (url.startsWith('/')) {
      return `${apiOrigin}${url}`;
    }
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/static/')) {
      return `${apiOrigin}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    const staticIdx = url.indexOf('/static/');
    if (staticIdx !== -1) {
      try {
        const apiOrigin = new URL(API_BASE).origin;
        return `${apiOrigin}${url.substring(staticIdx)}`;
      } catch {
        // fallback
      }
    }
  }
  return url;
}

const TOKEN_KEY = 'doit_access_token';
const REFRESH_TOKEN_KEY = 'doit_refresh_token';
const ACTIVE_WORKSPACE_KEY = 'doit_active_workspace_id';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else if (accessToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getStoredWorkspaceId(): string | null {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setStoredWorkspaceId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const token = getAuthToken();
  const activeWorkspaceId = getStoredWorkspaceId();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (activeWorkspaceId && !headers.has('x-workspace-id')) {
    headers.set('x-workspace-id', activeWorkspaceId);
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${API_BASE}${normalizedPath}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(`Cannot connect to server at ${API_BASE}. ${err.message || 'Network error'}`);
  }

  // Handle 401 Unauthorized with silent token rotation
  if (res.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const payload = data.data || data;
            const newAccess = payload.accessToken;
            const newRefresh = payload.refreshToken;
            setTokens(newAccess, newRefresh);
            isRefreshing = false;
            onTokenRefreshed(newAccess);
            return apiRequest<T>(path, options, true);
          } else {
            setTokens(null, null);
            isRefreshing = false;
          }
        } catch {
          setTokens(null, null);
          isRefreshing = false;
        }
      } else {
        // Wait for active refresh
        return new Promise<T>((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            apiRequest<T>(path, { ...options, headers }, true)
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorObj = data?.error || data;
    const msg = errorObj?.message || data?.message || `Request failed with status ${res.status}`;
    const error: any = new Error(msg);
    error.status = res.status;
    error.code = errorObj?.code;
    error.details = errorObj?.details;
    error.requestId = errorObj?.requestId;
    throw error;
  }

  if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
    return data.data as T;
  }

  return (data?.data ?? data) as T;
}

export const api = {
  auth: {
    login: async (credentials: { email: string; password?: string; passwordHash?: string }) => {
      const res = await apiRequest<{ user: User; accessToken: string; refreshToken?: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );
      if (res.accessToken) {
        setTokens(res.accessToken, res.refreshToken);
      }
      return res;
    },
    register: async (data: { email: string; password?: string; name: string }) => {
      const res = await apiRequest<{ user: User; accessToken: string; refreshToken?: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      if (res.accessToken) {
        setTokens(res.accessToken, res.refreshToken);
      }
      return res;
    },
    me: async () => {
      const res = await apiRequest<any>('/auth/me');
      const raw = res?.user?.email ? res.user : res;
      const name = String(raw?.name || raw?.fullName || '').trim();
      return {
        id: raw.id,
        email: raw.email,
        name,
        locale: raw.locale,
        avatarUrl: raw.avatarUrl ?? null,
        prefs: raw.prefs,
        memberships: Array.isArray(res?.memberships) ? res.memberships : [],
      } as User;
    },
    forgotPassword: (email: string) =>
      apiRequest<{ success: boolean; message?: string }>('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, newPassword: string, token?: string) =>
      apiRequest<{ success: boolean; message: string }>('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword: newPassword.trim(), token }),
      }),
    logoutAll: () => apiRequest('/auth/logout-all', { method: 'POST' }),
    logout: async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        setTokens(null, null);
      }
    },
    getSessions: () => apiRequest<UserSession[]>('/auth/sessions'),
    revokeSession: (sessionId: string) =>
      apiRequest(`/auth/sessions/${sessionId}`, { method: 'DELETE' }),
  },

  workspaces: {
    list: () => apiRequest<Workspace[]>('/workspaces'),
    get: (id: string) => apiRequest<Workspace>(`/workspaces/${id}`),
    create: (data: { name: string; slug?: string }) =>
      apiRequest<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; slug?: string }) =>
      apiRequest<Workspace>(`/workspaces/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    members: (workspaceId: string) =>
      apiRequest<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),
    updateRole: (workspaceId: string, memberId: string, role: string) =>
      apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    removeMember: (workspaceId: string, memberId: string) =>
      apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      }),
    invitations: (workspaceId: string) =>
      apiRequest<WorkspaceInvitation[]>(`/workspaces/${workspaceId}/invitations`),
    invite: (
      workspaceId: string,
      data: {
        email?: string | null;
        role: 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
        maxUses?: number;
        expiresInDays?: number;
      }
    ) =>
      apiRequest<WorkspaceInvitation>(`/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    inviteMember: (
      workspaceId: string,
      data: {
        email?: string | null;
        role: 'ADMIN' | 'MEMBER' | 'TESTER' | 'VIEWER';
        maxUses?: number;
        expiresInDays?: number;
      }
    ) =>
      apiRequest<WorkspaceInvitation>(`/workspaces/${workspaceId}/members/invite`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    revokeInvitation: (workspaceId: string, invitationId: string) =>
      apiRequest(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
        method: 'DELETE',
      }),
    resendInvitation: (workspaceId: string, invitationId: string) =>
      apiRequest(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {
        method: 'POST',
      }),
    labels: (workspaceId: string) =>
      apiRequest<Label[]>(`/workspaces/${workspaceId}/labels`),
    getLabel: (id: string) =>
      apiRequest<Label>(`/labels/${id}`),
    createLabel: (workspaceId: string, data: { name: string; color: string }) =>
      apiRequest<Label>(`/workspaces/${workspaceId}/labels`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateLabel: (id: string, data: { name?: string; color?: string }) =>
      apiRequest<Label>(`/labels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteLabel: (id: string) => apiRequest(`/labels/${id}`, { method: 'DELETE' }),
  },

  projects: {
    list: (workspaceId: string) =>
      apiRequest<Project[]>(`/workspaces/${workspaceId}/projects`),
    get: (id: string) => apiRequest<Project>(`/projects/${id}`),
    create: (workspaceId: string, data: { name: string; key: string; description?: string; defaultAssigneeId?: string | null }) =>
      apiRequest<Project>(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Project> & { archived?: boolean }) =>
      apiRequest<Project>(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),
    members: (projectId: string) =>
      apiRequest<{
        projectId: string;
        projectName: string;
        defaultAssigneeId: string | null;
        defaultAssignee: { id: string; name: string; email: string; avatarUrl?: string | null } | null;
        members: Array<{ id: string; name: string; email: string; avatarUrl?: string | null; role: string }>;
      }>(`/projects/${projectId}/members`),
  },

  tasks: {
    list: async (projectId: string, query?: Record<string, any>): Promise<Task[]> => {
      const q = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            q.append(k, String(v));
          }
        });
      }
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await apiRequest<{ items: Task[] } | Task[]>(`/projects/${projectId}/tasks${qs}`);
      if (Array.isArray(res)) return res;
      return (res as any)?.items || [];
    },
    listWorkspace: async (workspaceId: string, query?: Record<string, any>): Promise<Task[]> => {
      const q = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            q.append(k, String(v));
          }
        });
      }
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await apiRequest<{ items: Task[] } | Task[]>(`/workspaces/${workspaceId}/tasks${qs}`);
      if (Array.isArray(res)) return res;
      return (res as any)?.items || [];
    },
    myDay: (workspaceId: string) =>
      apiRequest<Task[]>(`/workspaces/${workspaceId}/tasks/my-day`),
    inbox: (workspaceId: string) =>
      apiRequest<Task[]>(`/workspaces/${workspaceId}/tasks/inbox`),
    get: (id: string) => apiRequest<Task>(`/tasks/${id}`),
    create: (
      projectId: string,
      data: {
        title: string;
        description?: string;
        priority?: string;
        type?: string;
        dueAt?: string;
        labelIds?: string[];
        assigneeId?: string;
      }
    ) =>
      apiRequest<Task>(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Task>) =>
      apiRequest<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      apiRequest<Task>(`/tasks/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    reorder: (id: string, data: { targetOrder: number; previousOrder?: number; nextOrder?: number }) =>
      apiRequest<Task>(`/tasks/${id}/reorder`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/tasks/${id}`, {
        method: 'DELETE',
      }),
    assign: (id: string, assigneeId: string | null) =>
      apiRequest(`/tasks/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assigneeId }),
      }),
    setLabels: (id: string, labelIds: string[]) =>
      apiRequest(`/tasks/${id}/labels`, {
        method: 'POST',
        body: JSON.stringify({ labelIds }),
      }),
    addChecklist: (id: string, title: string) =>
      apiRequest<{ id: string; title: string; isCompleted: boolean }>(`/tasks/${id}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    updateChecklist: (itemId: string, data: { title?: string; isCompleted?: boolean }) =>
      apiRequest<{ id: string; title: string; isCompleted: boolean }>(`/checklist/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    deleteChecklist: (itemId: string) =>
      apiRequest(`/checklist/${itemId}`, {
        method: 'DELETE',
      }),
  },

  bugs: {
    list: async (projectId: string, query?: Record<string, any>): Promise<Bug[]> => {
      const q = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            q.append(k, String(v));
          }
        });
      }
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await apiRequest<{ items: Bug[] } | Bug[]>(`/projects/${projectId}/bugs${qs}`);
      if (Array.isArray(res)) return res;
      return (res as any)?.items || [];
    },
    get: (id: string) => apiRequest<Bug>(`/bugs/${id}`),
    create: (
      projectId: string,
      data: {
        title: string;
        description?: string;
        severity?: string;
        labelIds?: string[];
        assigneeId?: string;
      }
    ) =>
      apiRequest<Bug>(`/projects/${projectId}/bugs`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<Bug>(`/bugs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  stickies: {
    list: async (projectId: string, pinned?: boolean): Promise<Sticky[]> => {
      const q = pinned !== undefined ? `?pinned=${pinned}` : '';
      const res = await apiRequest<Sticky[]>(`/projects/${projectId}/stickies${q}`);
      return Array.isArray(res) ? res : [];
    },
    get: (id: string) =>
      apiRequest<Sticky>(`/stickies/${id}`),
    create: (projectId: string, data: { body: string; color?: string; isPinned?: boolean }) =>
      apiRequest<Sticky>(`/projects/${projectId}/stickies`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { body?: string; color?: string; isPinned?: boolean }) =>
      apiRequest<Sticky>(`/stickies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    reorder: (id: string, targetOrder: number) =>
      apiRequest(`/stickies/${id}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ targetOrder }),
      }),
    delete: (id: string) =>
      apiRequest(`/stickies/${id}`, {
        method: 'DELETE',
      }),
    convert: (id: string) =>
      apiRequest<Task>(`/stickies/${id}/convert`, {
        method: 'POST',
      }),
  },

  notifications: {
    list: () => apiRequest<any[]>('/notifications'),
    markRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  system: {
    health: () => apiRequest<any>('/health'),
    config: () => apiRequest<any>('/config'),
  },

  search: {
    global: (query: string, workspaceId?: string) => {
      const q = new URLSearchParams({ q: query });
      if (workspaceId) q.append('workspaceId', workspaceId);
      return apiRequest<any>(`/search?${q.toString()}`);
    },
  },

  invitations: {
    validate: (token: string) =>
      apiRequest<{
        valid: boolean;
        workspace?: Workspace;
        email?: string;
        allowedEmail?: string;
        role?: string;
        invitedBy?: string;
        reason?: string;
      }>(`/invitations/validate/${token}`),
    accept: (token: string) =>
      apiRequest('/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  smtp: {
    get: () => apiRequest<SmtpConfig>('/admin/smtp'),
    save: (data: Partial<SmtpConfig>) =>
      apiRequest<{ success: boolean; config: SmtpConfig }>('/admin/smtp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    testConnection: (data?: any) =>
      apiRequest<{ success: boolean; message: string }>('/admin/smtp/test-connection', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    sendTest: (to: string, smtp?: any) =>
      apiRequest<{ success: boolean; message: string }>('/admin/smtp/send-test', {
        method: 'POST',
        body: JSON.stringify({ to, smtp }),
      }),
  },

  context: {
    get: (projectId: string) => apiRequest<any>(`/projects/${projectId}/context`),
    save: (projectId: string, markdown: string, version?: number) =>
      apiRequest<any>(`/projects/${projectId}/context`, {
        method: 'PUT',
        body: JSON.stringify({ markdown, version }),
      }),
  },

  quickCapture: {
    get: (workspaceId: string) =>
      apiRequest<any>(`/me/quick-capture-preferences?workspaceId=${workspaceId}`),
    save: (data: Record<string, unknown>) =>
      apiRequest<any>('/me/quick-capture-preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  ai: {
    list: () => apiRequest<any>('/me/ai-providers'),
    save: (model: string, apiKey?: string, enabled = true, provider = 'openrouter') =>
      apiRequest<any>(`/me/ai-providers/${provider}`, {
        method: 'PUT',
        body: JSON.stringify({ model, enabled, ...(apiKey ? { apiKey } : {}) }),
      }),
    test: (provider = 'openrouter') =>
      apiRequest<any>(`/me/ai-providers/${provider}/test`, { method: 'POST', body: '{}' }),
    remove: (provider = 'openrouter') =>
      apiRequest<any>(`/me/ai-providers/${provider}`, { method: 'DELETE' }),
    prompts: (taskId: string) => apiRequest<any>(`/tasks/${taskId}/solution-prompts`),
    generate: (taskId: string, body: Record<string, unknown>) =>
      apiRequest<any>(`/tasks/${taskId}/solution-prompts/generate`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updatePrompt: (promptId: string, promptMarkdown: string) =>
      apiRequest<any>(`/solution-prompts/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ promptMarkdown }),
      }),
    regenerate: (promptId: string) =>
      apiRequest<any>(`/solution-prompts/${promptId}/regenerate`, {
        method: 'POST',
      }),
  },

  uploads: {
    init: (data: { filename: string; mimeType: string; sizeBytes: number }) =>
      apiRequest<{ id: string; uploadUrl: string; key: string }>('/uploads/init', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    complete: (id: string) =>
      apiRequest<{ success: boolean; attachment: any }>(`/uploads/${id}/complete`, {
        method: 'POST',
      }),
  },

  attachments: {
    get: (id: string) => apiRequest<any>(`/attachments/${id}`),
    delete: (id: string) => apiRequest(`/attachments/${id}`, { method: 'DELETE' }),
  },

  voice: {
    upload: (formData: FormData) =>
      apiRequest<{ id: string; status: string }>('/voice', {
        method: 'POST',
        body: formData,
      }),
    get: (id: string) => apiRequest<any>(`/voice/${id}`),
    update: (id: string, transcript: string) =>
      apiRequest<any>(`/voice/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ transcript }),
      }),
    retry: (id: string) =>
      apiRequest<any>(`/voice/${id}/retry`, {
        method: 'POST',
      }),
    structure: (id: string) =>
      apiRequest<any>(`/voice/${id}/structure`, {
        method: 'POST',
      }),
    attach: (id: string, taskId: string) =>
      apiRequest<any>(`/voice/${id}/attach`, {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      }),
  },
};
