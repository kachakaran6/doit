/**
 * Core HTTP Client for Mobile Application
 * Robust JWT authorization interceptor, mutex-guarded silent token rotation,
 * resilient network error handling, safe GET retries, and strict session preservation.
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
  if (envUrl && !envUrl.includes('example.com') && !envUrl.includes('staging-api') && !envUrl.includes('192.168.')) {
    return envUrl;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }
  return PRODUCTION_API_URL;
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
  private onUnauthorizedCallback: (() => void) | null = null;

  // Mutex promise to prevent concurrent refresh requests
  private refreshPromise: Promise<string | null> | null = null;
  // Deduplicate simultaneous in-flight GET requests
  private inFlightGetRequests: Map<string, Promise<any>> = new Map();

  setOnUnauthorized(callback: (() => void) | null) {
    this.onUnauthorizedCallback = callback;
  }

  constructor() {
    this.loadPersistedBaseUrl();
  }

  private async loadPersistedBaseUrl() {
    if (!__DEV__) {
      this.baseUrl = PRODUCTION_API_URL;
      return;
    }
    try {
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
    if (!__DEV__) {
      this.baseUrl = PRODUCTION_API_URL;
      return;
    }
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

  /**
   * Mutex-guarded Token Refresh
   * Guarantees only one /auth/refresh network call executes at a time.
   * All concurrent requests queue behind this promise.
   */
  private async executeTokenRefresh(): Promise<string | null> {
    try {
      const session = await AuthStorage.getSession();
      let refreshTokenToUse = session?.refreshToken;

      // Check native overlay credentials if available
      try {
        const overlayCreds = await overlayService.getCredentials();
        if (overlayCreds?.refreshToken) {
          refreshTokenToUse = overlayCreds.refreshToken;
        }
      } catch {}

      if (!refreshTokenToUse) {
        return null;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenToUse }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const payload = refreshData.data || refreshData;
        const newAccessToken = payload.accessToken;
        const newRefreshToken = payload.refreshToken || refreshTokenToUse;

        if (newAccessToken && session) {
          this.setAuthToken(newAccessToken);
          const updatedSession = {
            ...session,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          await AuthStorage.setSession(updatedSession);
          overlayService.syncAuthCredentials(newAccessToken, this.baseUrl, this.workspaceId, newRefreshToken);
          return newAccessToken;
        }
      } else if (refreshRes.status === 401 || refreshRes.status === 403) {
        // Refresh token is genuinely invalid, revoked, or expired
        console.warn('[HttpClient] Refresh token expired or revoked. Logging out.');
        this.onUnauthorizedCallback?.();
        return null;
      }
    } catch (err: any) {
      // Network error or timeout during refresh - DO NOT log out user!
      console.warn('[HttpClient] Refresh network error (session preserved):', err.message);
    }
    return null;
  }

  async request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const method = (options.method || 'GET').toUpperCase();
    const isGet = method === 'GET';

    // Deduplicate concurrent identical GET requests across components
    if (isGet && !isRetry) {
      const cacheKey = `${url}|${this.authToken || ''}|${this.workspaceId || ''}`;
      const inFlight = this.inFlightGetRequests.get(cacheKey);
      if (inFlight) {
        return inFlight as Promise<T>;
      }
      const promise = this.executeRequest<T>(url, path, method, isGet, options, isRetry)
        .finally(() => {
          this.inFlightGetRequests.delete(cacheKey);
        });
      this.inFlightGetRequests.set(cacheKey, promise);
      return promise;
    }

    return this.executeRequest<T>(url, path, method, isGet, options, isRetry);
  }

  private async executeRequest<T>(
    url: string,
    path: string,
    method: string,
    isGet: boolean,
    options: RequestInit,
    isRetry: boolean
  ): Promise<T> {
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

    // 10-second request timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (netErr: any) {
      clearTimeout(timeoutId);

      // Safe retry once for transient GET network errors
      if (isGet && !isRetry) {
        await new Promise((r) => setTimeout(r, 600));
        return this.request<T>(path, options, true);
      }

      const failedEntry: FailedRequestLog = {
        timestamp: new Date().toISOString(),
        method,
        url,
        status: 0,
        code: 'NETWORK_ERROR',
        message: `Cannot reach server: ${netErr.message || 'Network unreachable'}`,
      };
      this.logFailedRequest(failedEntry);
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        `Network error connecting to API. Please check your connection.`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle 401 with synchronized mutex token refresh
    if (response.status === 401 && !isRetry && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.executeTokenRefresh().finally(() => {
          this.refreshPromise = null;
        });
      }

      const freshToken = await this.refreshPromise;
      if (freshToken) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${freshToken}`,
        };
        return this.request<T>(path, { ...options, headers: retryHeaders }, true);
      }
    }

    if (!response.ok) {
      // If 401 and refresh explicitly returned invalid/revoked or we already retried and still 401
      if (response.status === 401 && !url.includes('/auth/login')) {
        const session = await AuthStorage.getSession();
        if (!session?.refreshToken) {
          this.onUnauthorizedCallback?.();
        }
      }

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
        method,
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

    let json: any;
    try {
      json = await response.json();
    } catch {
      throw new ApiError(response.status, 'INVALID_RESPONSE', 'Invalid response format from server.');
    }

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
