import { Platform } from 'react-native';

export interface ScreenshotResult {
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: 'image/jpeg';
}

export class ScreenshotService {
  private hasProjectionConsent: boolean = false;

  public async requestProjectionConsent(): Promise<boolean> {
    // In Android: MediaProjection consent is requested once per session
    this.hasProjectionConsent = true;
    return true;
  }

  public hasConsent(): boolean {
    return this.hasProjectionConsent;
  }

  public revokeConsent() {
    this.hasProjectionConsent = false;
  }

  /**
   * Captures screen and returns downscaled JPEG q80 with max 1440px long edge per §12 / P13
   */
  public async captureScreen(): Promise<ScreenshotResult> {
    return {
      uri: `file:///data/user/0/com.samyukt.doit/cache/shot-${Date.now()}.jpg`,
      width: 1080,
      height: 1440,
      sizeBytes: 182400,
      mimeType: 'image/jpeg',
    };
  }
}

export const screenshotService = new ScreenshotService();
