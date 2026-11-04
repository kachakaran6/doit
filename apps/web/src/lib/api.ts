const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('doit-auth-token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('doit-auth-token', token);
  } else {
    localStorage.removeItem('doit-auth-token');
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg =
      (data && (data.message || data.error)) || `Request failed with status ${res.status}`;
    const error: any = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    login: (body: { email: string; passwordHash?: string; password?: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    register: (body: { email: string; password?: string; name: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    me: () => apiRequest('/auth/me'),
  },

  workspaces: {
    list: () => apiRequest('/workspaces'),
    get: (id: string) => apiRequest(`/workspaces/${id}`),
    members: (workspaceId: string) => apiRequest(`/workspaces/${workspaceId}/members`),
    invitations: (workspaceId: string) => apiRequest(`/workspaces/${workspaceId}/invitations`),
    invite: (
      workspaceId: string,
      data: {
        email?: string | null;
        role: 'ADMIN' | 'TESTER' | 'VIEWER';
        maxUses?: number;
        expiresInDays?: number;
      },
    ) =>
      apiRequest(`/workspaces/${workspaceId}/invitations`, {
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
    updateRole: (workspaceId: string, memberId: string, role: string) =>
      apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    removeMember: (workspaceId: string, memberId: string) =>
      apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      }),
  },

  invitations: {
    validate: (token: string) => apiRequest(`/invitations/validate/${token}`),
    accept: (token: string) =>
      apiRequest('/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  smtp: {
    get: () => apiRequest('/admin/smtp'),
    save: (data: any) =>
      apiRequest('/admin/smtp', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    testConnection: (data?: any) =>
      apiRequest('/admin/smtp/test-connection', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    sendTest: (to: string, smtp?: any) =>
      apiRequest('/admin/smtp/send-test', {
        method: 'POST',
        body: JSON.stringify({ to, smtp }),
      }),
  },
};
