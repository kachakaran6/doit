import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type SamyuktAppStatus = 'production' | 'published' | 'coming_soon';

export interface SamyuktApp {
  id: string;
  appName: string;
  packageName: string;
  playStoreUrl?: string;
  iconUrl: string;
  status: SamyuktAppStatus;
  category: string;
  tagline: string;
  description: string;
  featured?: boolean;
  year?: string;
  client?: string;
  stack?: string[];
  services?: string[];
  highlights?: string[];
}

export interface SamyuktRegistry {
  version: string;
  updatedAt: string;
  apps: SamyuktApp[];
}

const REGISTRY_URL = 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/app.json';
const ASSET_BASE_URL = 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/';
const CACHE_KEY = 'com.samyukt.doit.apps_registry_cache';
const CURRENT_PACKAGE = 'com.samyukt.doit';

const ALLOWED_STATUSES = new Set<string>(['production', 'published', 'coming_soon']);

export function resolveAssetUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  // Strip leading slash or images/
  const clean = rawUrl.replace(/^\/?(images\/)?/, '');
  return `${ASSET_BASE_URL}${clean}`;
}

export async function fetchSamyuktAppsRegistry(forceRefresh = false): Promise<SamyuktApp[]> {
  // 1. Try reading from local cache first if not forced
  let cachedApps: SamyuktApp[] | null = null;
  try {
    const raw = Platform.OS === 'web'
      ? localStorage.getItem(CACHE_KEY)
      : await SecureStore.getItemAsync(CACHE_KEY).catch(() => null);
    if (raw) {
      cachedApps = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[SamyuktRegistry] Cache read failed:', err);
  }

  // If not forcing refresh and cached apps exist, return cache while refreshing in background
  if (!forceRefresh && cachedApps && cachedApps.length > 0) {
    // Background fetch
    fetchFromRemote().catch(() => {});
    return cachedApps;
  }

  // 2. Fetch fresh registry from GitHub
  try {
    const apps = await fetchFromRemote();
    return apps;
  } catch (err) {
    console.warn('[SamyuktRegistry] Remote fetch failed, falling back to cache:', err);
    if (cachedApps && cachedApps.length > 0) {
      return cachedApps;
    }
    throw err;
  }
}

async function fetchFromRemote(): Promise<SamyuktApp[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(REGISTRY_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.apps)) {
      throw new Error('Invalid registry schema: missing apps array');
    }

    // Strict filtering:
    // - entries from apps[] only (never websites)
    // - status in ['production', 'published', 'coming_soon']
    // - exclude current application (com.samyukt.doit)
    const validApps: SamyuktApp[] = data.apps
      .filter((app: any) => {
        if (!app || typeof app !== 'object') return false;
        if (!app.id || !app.appName) return false;
        if (app.packageName === CURRENT_PACKAGE || app.id === CURRENT_PACKAGE) return false;
        const normalizedStatus = String(app.status || '').toLowerCase().trim();
        return ALLOWED_STATUSES.has(normalizedStatus);
      })
      .map((app: any) => ({
        id: String(app.id),
        appName: String(app.appName),
        packageName: String(app.packageName || app.id),
        playStoreUrl: app.playStoreUrl ? String(app.playStoreUrl) : undefined,
        iconUrl: resolveAssetUrl(String(app.iconUrl || '')),
        status: (String(app.status || '').toLowerCase().trim() as SamyuktAppStatus),
        category: String(app.category || 'Productivity'),
        tagline: String(app.tagline || ''),
        description: String(app.description || ''),
        featured: Boolean(app.featured),
        year: app.year ? String(app.year) : undefined,
        client: app.client ? String(app.client) : undefined,
        stack: Array.isArray(app.stack) ? app.stack.map(String) : [],
        services: Array.isArray(app.services) ? app.services.map(String) : [],
        highlights: Array.isArray(app.highlights) ? app.highlights.map(String) : [],
      }));

    // Cache to persistent storage
    try {
      const serialized = JSON.stringify(validApps);
      if (Platform.OS === 'web') {
        localStorage.setItem(CACHE_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(CACHE_KEY, serialized);
      }
    } catch (saveErr) {
      console.warn('[SamyuktRegistry] Failed to cache apps registry:', saveErr);
    }

    return validApps;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

