import { Platform, NativeModules, Linking } from 'react-native';

const { OverlayServiceModule } = NativeModules;

export interface OverlayService {
  isAvailable(): boolean;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<void>;
  openDeviceSpecificSettings(): Promise<void>;
  isXiaomiDevice(): Promise<boolean>;
  startBubble(): Promise<boolean>;
  stopBubble(): Promise<boolean>;
  isBubbleRunning(): Promise<boolean>;
  getRunningState(): boolean;
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
    // Fallback to application settings
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
}

export const overlayService = new OverlayServiceImpl();
