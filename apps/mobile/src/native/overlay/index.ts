import { Platform, NativeModules, Linking } from 'react-native';

const { OverlayServiceModule } = NativeModules;

export interface CleanScreenshotResult {
  uri: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export interface GalleryImageResult {
  uri: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface OverlayService {
  isAvailable(): boolean;
  hasPermission(): Promise<boolean>;
  hasMiuiPopupPermission(): Promise<boolean>;
  requestPermission(): Promise<void>;
  openOverlaySettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  openDeviceSpecificSettings(): Promise<void>;
  isXiaomiDevice(): Promise<boolean>;
  startBubble(): Promise<boolean>;
  stopBubble(): Promise<boolean>;
  isBubbleRunning(): Promise<boolean>;
  getRunningState(): boolean;
  syncAuthCredentials(token: string | null, baseUrl?: string, projectId?: string | null): Promise<void>;
  setShakeEnabled(enabled: boolean, sensitivity?: string): Promise<void>;
  hasScreenshotPermission(): Promise<boolean>;
  requestScreenshotPermission(): Promise<boolean>;
  captureCleanScreenshot(): Promise<CleanScreenshotResult>;
  pickImageFromGallery(): Promise<GalleryImageResult>;
  uploadFile(filePath: string, url: string, contentType: string): Promise<boolean>;
}

class OverlayServiceImpl implements OverlayService {
  private isRunning: boolean = false;

  isAvailable(): boolean {
    return Platform.OS === 'android';
  }

  async hasPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.hasPermission) {
        return await OverlayServiceModule.hasPermission();
      }
    } catch {
      // Ignore
    }
    return false;
  }

  async hasMiuiPopupPermission(): Promise<boolean> {
    if (!this.isAvailable()) return true;
    try {
      if (OverlayServiceModule?.hasMiuiPopupPermission) {
        return await OverlayServiceModule.hasMiuiPopupPermission();
      }
    } catch {
      // Ignore
    }
    return true;
  }

  async requestPermission(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (OverlayServiceModule?.requestPermission) {
        await OverlayServiceModule.requestPermission();
        return;
      }
    } catch {
      // Ignore and fallback
    }
    Linking.openSettings();
  }

  async openOverlaySettings(): Promise<void> {
    return this.requestPermission();
  }

  async openAppSettings(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (OverlayServiceModule?.openAppSettings) {
        await OverlayServiceModule.openAppSettings();
        return;
      }
    } catch {
      // Ignore
    }
    Linking.openSettings();
  }

  async openDeviceSpecificSettings(): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (OverlayServiceModule?.openDeviceSpecificSettings) {
        await OverlayServiceModule.openDeviceSpecificSettings();
        return;
      }
    } catch {
      // Ignore
    }
    Linking.openSettings();
  }

  async isXiaomiDevice(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.isDeviceXiaomi) {
        return await OverlayServiceModule.isDeviceXiaomi();
      }
    } catch {
      // Ignore
    }
    return false;
  }

  async startBubble(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.startBubble) {
        const success = await OverlayServiceModule.startBubble();
        this.isRunning = success;
        return success;
      }
    } catch (e: any) {
      if (e?.code === 'PERMISSION_DENIED') {
        throw new Error('SYSTEM_ALERT_WINDOW permission is required');
      }
      return false;
    }
    return false;
  }

  async stopBubble(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.stopBubble) {
        await OverlayServiceModule.stopBubble();
      }
      this.isRunning = false;
      return true;
    } catch {
      return false;
    }
  }

  async isBubbleRunning(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.isBubbleRunning) {
        const running = await OverlayServiceModule.isBubbleRunning();
        this.isRunning = running;
        return running;
      }
    } catch {
      // Ignore
    }
    return this.isRunning;
  }

  getRunningState(): boolean {
    return this.isRunning;
  }

  async syncAuthCredentials(token: string | null, baseUrl: string = 'https://doit.samyukt.pro/api/v1', projectId: string | null = null): Promise<void> {
    if (!this.isAvailable() || !OverlayServiceModule?.syncAuthCredentials) return;
    try {
      await OverlayServiceModule.syncAuthCredentials(token, baseUrl, projectId);
    } catch (e) {
      console.warn('[OverlayService] Failed to sync auth credentials:', e);
    }
  }

  async setShakeEnabled(enabled: boolean, sensitivity: string = 'medium'): Promise<void> {
    if (!this.isAvailable() || !OverlayServiceModule?.setShakeEnabled) return;
    try {
      await OverlayServiceModule.setShakeEnabled(enabled, sensitivity);
    } catch (e) {
      console.warn('[OverlayService] Failed to set shake config:', e);
    }
  }

  async hasScreenshotPermission(): Promise<boolean> {
    if (!this.isAvailable() || !OverlayServiceModule?.hasScreenshotPermission) return false;
    try {
      return await OverlayServiceModule.hasScreenshotPermission();
    } catch {
      return false;
    }
  }

  async requestScreenshotPermission(): Promise<boolean> {
    if (!this.isAvailable() || !OverlayServiceModule?.requestScreenshotPermission) return false;
    try {
      return await OverlayServiceModule.requestScreenshotPermission();
    } catch {
      return false;
    }
  }

  async captureCleanScreenshot(): Promise<CleanScreenshotResult> {
    if (!this.isAvailable() || !OverlayServiceModule?.captureCleanScreenshot) {
      throw new Error('Screenshot service not available on this platform');
    }
    return await OverlayServiceModule.captureCleanScreenshot();
  }

  async pickImageFromGallery(): Promise<GalleryImageResult> {
    if (!this.isAvailable() || !OverlayServiceModule?.pickImageFromGallery) {
      throw new Error('Gallery picker not available on this platform');
    }
    return await OverlayServiceModule.pickImageFromGallery();
  }

  async uploadFile(filePath: string, url: string, contentType: string = 'image/jpeg'): Promise<boolean> {
    if (!this.isAvailable() || !OverlayServiceModule?.uploadFile) {
      // Fallback
      const resp = await fetch(filePath);
      const blob = await resp.blob();
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      return res.ok;
    }
    return await OverlayServiceModule.uploadFile(filePath, url, contentType);
  }
}

export const overlayService = new OverlayServiceImpl();
