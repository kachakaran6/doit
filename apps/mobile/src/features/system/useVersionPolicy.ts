import { useEffect, useState } from 'react';
import { http } from '../../lib/http';

export const CURRENT_APP_VERSION = '0.2.4';

export function isVersionLower(current: string, required: string): boolean {
  const c = current.split('.').map((p) => parseInt(p, 10) || 0);
  const r = required.split('.').map((p) => parseInt(p, 10) || 0);
  for (let i = 0; i < Math.max(c.length, r.length); i++) {
    const cv = c[i] || 0;
    const rv = r[i] || 0;
    if (cv < rv) return true;
    if (cv > rv) return false;
  }
  return false;
}

export interface VersionPolicy {
  checked: boolean;
  needsUpdate: boolean;
  minAppVersion: string;
  downloadUrl: string;
}

interface ConfigPayload {
  minAppVersion?: string;
  downloadUrl?: string;
}

export function useVersionPolicy(): VersionPolicy {
  const [policy, setPolicy] = useState<VersionPolicy>({
    checked: false,
    needsUpdate: false,
    minAppVersion: CURRENT_APP_VERSION,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.samyukt.doit',
  });

  useEffect(() => {
    let isMounted = true;
    http
      .get<ConfigPayload>('/config')
      .then((res) => {
        if (!isMounted || !res) return;
        const minVersion = res.minAppVersion || CURRENT_APP_VERSION;
        const downloadUrl =
          res.downloadUrl || 'https://play.google.com/store/apps/details?id=com.samyukt.doit';
        const needsUpdate = isVersionLower(CURRENT_APP_VERSION, minVersion);

        setPolicy({
          checked: true,
          needsUpdate,
          minAppVersion: minVersion,
          downloadUrl,
        });
      })
      .catch(() => {
        if (isMounted) {
          setPolicy((prev) => ({ ...prev, checked: true }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return policy;
}
