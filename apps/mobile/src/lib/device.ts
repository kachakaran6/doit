import { Platform, Dimensions } from 'react-native';

export interface DeviceTelemetryContext {
  deviceModel: string;
  osVersion: string;
  appUnderTest: string;
  appVersion: string;
  buildNumber: string;
  capturedAt: string;
  screenSize: string;
  locale: string;
  freeStorageMb: number;
  batteryPct: number;
  networkType: 'WIFI' | 'CELLULAR' | 'OFFLINE';
  autoContext: Record<string, any>;
}

export class DeviceContextCollector {
  private static appUnderTest: string = 'com.samyukt.doit';

  public static setAppUnderTest(packageNameOrName: string) {
    this.appUnderTest = packageNameOrName;
  }

  public static getAppUnderTest(): string {
    return this.appUnderTest;
  }

  public static async collectContext(overrides?: Partial<DeviceTelemetryContext>): Promise<DeviceTelemetryContext> {
    const { width, height } = Dimensions.get('window');

    const defaultContext: DeviceTelemetryContext = {
      deviceModel: Platform.OS === 'android' ? 'Google Pixel 8' : 'iPhone 15 Pro',
      osVersion: Platform.OS === 'android' ? `Android ${Platform.Version}` : `iOS ${Platform.Version}`,
      appUnderTest: this.appUnderTest,
      appVersion: '0.1.0',
      buildNumber: '104',
      capturedAt: new Date().toISOString(),
      screenSize: `${Math.round(width)}x${Math.round(height)}`,
      locale: 'en-US',
      freeStorageMb: 14200,
      batteryPct: 88,
      networkType: 'WIFI',
      autoContext: {
        memoryPressure: 'normal',
        orientation: height >= width ? 'portrait' : 'landscape',
        darkMode: true,
      },
      ...overrides,
    };

    return defaultContext;
  }
}
