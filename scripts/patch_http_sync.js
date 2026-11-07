import fs from 'fs';

// 1. Update index.ts
let idxCode = fs.readFileSync('apps/mobile/src/native/overlay/index.ts', 'utf8').replace(/\r\n/g, '\n');
if (!idxCode.includes('getCredentials(): Promise')) {
  idxCode = idxCode.replace(
    '  syncAuthCredentials(',
    '  getCredentials(): Promise<{ authToken?: string | null; refreshToken?: string | null; baseUrl?: string | null; projectId?: string | null } | null>;\n  syncAuthCredentials('
  );
  idxCode = idxCode.replace(
    '  async syncAuthCredentials(',
    `  async getCredentials(): Promise<{ authToken?: string | null; refreshToken?: string | null; baseUrl?: string | null; projectId?: string | null } | null> {
    if (!this.isAvailable() || !OverlayServiceModule?.getCredentials) return null;
    try {
      return await OverlayServiceModule.getCredentials();
    } catch {
      return null;
    }
  }\n\n  async syncAuthCredentials(`
  );
  fs.writeFileSync('apps/mobile/src/native/overlay/index.ts', idxCode, 'utf8');
}

// 2. Update http.ts
let httpCode = fs.readFileSync('apps/mobile/src/lib/http.ts', 'utf8').replace(/\r\n/g, '\n');
const oldRefresh = `      this.isRefreshing = true;
      try {
        const session = await AuthStorage.getSession();
        if (session && session.refreshToken) {
          const refreshRes = await fetch(\`\${this.baseUrl}/auth/refresh\`, {
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
              overlayService.syncAuthCredentials(newAccessToken, this.baseUrl, this.workspaceId, newRefreshToken);
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
      }`;

const newRefresh = `      this.isRefreshing = true;
      try {
        const session = await AuthStorage.getSession();
        let refreshTokenToUse = session?.refreshToken;
        try {
          const overlayCreds = await overlayService.getCredentials();
          if (overlayCreds?.authToken && session && overlayCreds.authToken !== session.accessToken) {
            this.setAuthToken(overlayCreds.authToken);
            await AuthStorage.setSession({
              ...session,
              accessToken: overlayCreds.authToken,
              refreshToken: overlayCreds.refreshToken || session.refreshToken,
            });
            this.isRefreshing = false;
            return this.request<T>(path, options, true);
          }
          if (overlayCreds?.refreshToken) {
            refreshTokenToUse = overlayCreds.refreshToken;
          }
        } catch {}

        if (refreshTokenToUse) {
          const refreshRes = await fetch(\`\${this.baseUrl}/auth/refresh\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ refreshToken: refreshTokenToUse }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const payload = refreshData.data || refreshData;
            const newAccessToken = payload.accessToken;
            const newRefreshToken = payload.refreshToken || refreshTokenToUse;

            if (newAccessToken && session) {
              this.setAuthToken(newAccessToken);
              await AuthStorage.setSession({
                ...session,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              });
              overlayService.syncAuthCredentials(newAccessToken, this.baseUrl, this.workspaceId, newRefreshToken);
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
      }`;

if (httpCode.includes(oldRefresh)) {
  httpCode = httpCode.replace(oldRefresh, newRefresh);
  fs.writeFileSync('apps/mobile/src/lib/http.ts', httpCode, 'utf8');
}
console.log('Successfully updated sync in index.ts and http.ts');

