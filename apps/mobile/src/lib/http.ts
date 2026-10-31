/**
 * Core HTTP Client for Mobile Application
 * Automatically unwraps standard { data, meta } envelopes
 * and extracts typed ApiError with server error codes, details, and request IDs.
 */

import Constants from 'expo-constants';

function getDefaultBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }
  return 'http://10.0.2.2:3000/api/v1';
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: any,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FailedRequestLog {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  code: string;
  message: string;
  requestId?: string;
}

class HttpClient {
  private baseUrl: string = getDefaultBaseUrl();
  private authToken: string | null = null;
  private workspaceId: string | null = null;
  public readonly failedRequests: FailedRequestLog[] = [];

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  setWorkspaceId(id: string | null) {
    this.workspaceId = id;
  }

  getWorkspaceId(): string | null {
    return this.workspaceId;
  }

  private logFailedRequest(entry: FailedRequestLog) {
    this.failedRequests.unshift(entry);
    if (this.failedRequests.length > 20) {
      this.failedRequests.pop();
    }
  }

  async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const url = path.startsWith('http')
      ? path
      : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.workspaceId && !headers['x-workspace-id']) {
      headers['x-workspace-id'] = this.workspaceId;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (netErr: any) {
      const failedEntry: FailedRequestLog = {
        timestamp: new Date().toISOString(),
        method: options.method || 'GET',
        url,
        status: 0,
        code: 'NETWORK_ERROR',
        message: `Cannot reach server at ${this.baseUrl}: ${netErr.message || 'Network unreachable'}`,
      };
      this.logFailedRequest(failedEntry);
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        `Cannot reach API server at ${this.baseUrl}. Check network or ADB reverse.`
      );
    }

    if (!response.ok) {
      let errorBody: any = {};
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }

      const err = errorBody?.error || errorBody;
      const code = err?.code || `HTTP_${response.status}`;
      const message =
        err?.message ||
        (response.status === 401
          ? 'Session expired. Please log in again.'
          : response.status === 403
            ? 'Access denied. You lack permissions for this workspace.'
            : response.status === 404
              ? 'Requested resource not found.'
              : `Request failed with status ${response.status}`);
      const requestId =
        err?.requestId || response.headers.get('x-request-id') || undefined;

      const failedEntry: FailedRequestLog = {
        timestamp: new Date().toISOString(),
        method: options.method || 'GET',
        url,
        status: response.status,
        code,
        message,
        requestId,
      };
      this.logFailedRequest(failedEntry);

      throw new ApiError(response.status, code, message, err?.details, requestId);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const json = await response.json();
    // Automatically unwrap standard { data, meta } envelopes
    if (json && typeof json === 'object' && 'data' in json && 'meta' in json) {
      return json.data as T;
    }

    return json as T;
  }

  get<T = any>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const http = new HttpClient();
