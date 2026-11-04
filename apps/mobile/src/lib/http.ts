/**
 * Core HTTP Client for Mobile Application
 * Automatically unwraps standard { data, meta } envelopes,
 * supports silent token rotation via /auth/refresh,
 * and extracts typed ApiError with server error codes, details, and request IDs.
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthStorage } from '../features/auth/auth.storage';
import { overlayService } from '../native/overlay';

const API_URL_KEY = 'com.samyukt.doit.api_url';

export const PRODUCTION_API_URL = 'https://doit.samyukt.pro/api/v1';

function getDefaultBaseUrl(): string {
  // In release / production builds, always strictly use the live production API URL
  if (!__DEV__) {
    return PRODUCTION_API_URL;
  }

  // In local development, use EXPO_PUBLIC_API_URL or local backend fallback
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('example.com') && !envUrl.includes('staging-api')) {
    return envUrl;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }
  return 'http://192.168.1.67:3000/api/v1';
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
  private isRefreshing: boolean = false;

  constructor() {
    this.loadPersistedBaseUrl();
  }

  private async loadPersistedBaseUrl() {
    try {
      if (!__DEV__) {
        // Enforce the production live API URL for all release builds
        this.baseUrl = PRODUCTION_API_URL;
        return;
      }
      if (Platform.OS === 'web') {
        const saved = localStorage.getItem(API_URL_KEY);
        if (saved && !saved.includes('example.com') && !saved.includes('staging-api')) {
          this.baseUrl = saved;
        }
        return;
      }
      const saved = await SecureStore.getItemAsync(API_URL_KEY).catch(() => null);
      if (saved && !saved.includes('example.com') && !saved.includes('staging-api')) {
        this.baseUrl = saved;
      }
    } catch {
      // Keep default
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(API_URL_KEY, this.baseUrl);
      } else {
        SecureStore.setItemAsync(API_URL_KEY, this.baseUrl).catch(() => {});
      }
    } catch {
      // ignore
    }
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
    if (this.failedRequests.length > 50) {
      this.failedRequests.pop();
    }
  }

  async request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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

    // Handle 401 Unauthorized with silent token rotation
    if (response.status === 401 && !isRetry && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const session = await AuthStorage.getSession();
        if (session && session.refreshToken) {
          const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ refreshToken: session.refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const payload = refreshData.data || refreshData;
            const newAccessToken = payload.accessToken;
            const newRefreshToken = payload.refreshToken || session.refreshToken;

            if (newAccessToken) {
              this.setAuthToken(newAccessToken);
              await AuthStorage.setSession({
                ...session,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              });
              overlayService.syncAuthCredentials(newAccessToken, this.baseUrl, this.workspaceId);
              this.isRefreshing = false;
              // Retry original request with fresh token
              return this.request<T>(path, options, true);
            }
          }
        }
      } catch (refreshErr) {
        console.warn('[HttpClient] Automatic refresh failed:', refreshErr);
      } finally {
        this.isRefreshing = false;
      }
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
    if (json && typeof json === 'object' && 'data' in json && 'meta' in json) {
      return json.data as T;
    }

    return json as T;
  }

  async get<T>(path: string, optionsOrHeaders?: RequestInit | Record<string, string>): Promise<T> {
    const opts: RequestInit =
      optionsOrHeaders && ('headers' in optionsOrHeaders || 'method' in optionsOrHeaders)
        ? (optionsOrHeaders as RequestInit)
        : { headers: optionsOrHeaders as Record<string, string> };
    return this.request<T>(path, { ...opts, method: 'GET' });
  }

  async post<T>(path: string, body?: any, optionsOrHeaders?: RequestInit | Record<string, string>): Promise<T> {
    const opts: RequestInit =
      optionsOrHeaders && ('headers' in optionsOrHeaders || 'method' in optionsOrHeaders)
        ? (optionsOrHeaders as RequestInit)
        : { headers: optionsOrHeaders as Record<string, string> };
    return this.request<T>(path, {
      ...opts,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: any, optionsOrHeaders?: RequestInit | Record<string, string>): Promise<T> {
    const opts: RequestInit =
      optionsOrHeaders && ('headers' in optionsOrHeaders || 'method' in optionsOrHeaders)
        ? (optionsOrHeaders as RequestInit)
        : { headers: optionsOrHeaders as Record<string, string> };
    return this.request<T>(path, {
      ...opts,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: any, optionsOrHeaders?: RequestInit | Record<string, string>): Promise<T> {
    const opts: RequestInit =
      optionsOrHeaders && ('headers' in optionsOrHeaders || 'method' in optionsOrHeaders)
        ? (optionsOrHeaders as RequestInit)
        : { headers: optionsOrHeaders as Record<string, string> };
    return this.request<T>(path, {
      ...opts,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, optionsOrHeaders?: RequestInit | Record<string, string>): Promise<T> {
    const opts: RequestInit =
      optionsOrHeaders && ('headers' in optionsOrHeaders || 'method' in optionsOrHeaders)
        ? (optionsOrHeaders as RequestInit)
        : { headers: optionsOrHeaders as Record<string, string> };
    return this.request<T>(path, { ...opts, method: 'DELETE' });
  }
}

export const http = new HttpClient();
