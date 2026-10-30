import { Platform, NativeModules, Linking } from 'react-native';

const { OverlayServiceModule } = NativeModules;

export interface OverlayService {
  isAvailable(): boolean;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<void>;
  startBubble(): Promise<boolean>;
  stopBubble(): Promise<boolean>;
}

class OverlayServiceImpl implements OverlayService {
  private isRunning: boolean = false;

  isAvailable(): boolean {
    // Only available on Android; returns false on iOS per specification
    return Platform.OS === 'android';
  }

  async hasPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    if (OverlayServiceModule?.hasPermission) {
      return OverlayServiceModule.hasPermission();
    }
    return false;
  }

  async requestPermission(): Promise<void> {
    if (!this.isAvailable()) return;
    if (OverlayServiceModule?.requestPermission) {
      return OverlayServiceModule.requestPermission();
    }
    // Fallback to system application settings
    Linking.openSettings();
  }

  async startBubble(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      if (OverlayServiceModule?.startBubble) {
        await OverlayServiceModule.startBubble();
        this.isRunning = true;
        return true;
      }
      this.isRunning = true;
      return true;
    } catch {
      return false;
    }
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

  getRunningState(): boolean {
    return this.isRunning;
  }
}

export const overlayService = new OverlayServiceImpl();
