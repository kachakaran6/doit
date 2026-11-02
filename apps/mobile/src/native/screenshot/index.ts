import { overlayService, CleanScreenshotResult } from '../overlay';

export interface ScreenshotResult {
  uri: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
  name?: string;
}

export class ScreenshotService {
  public async requestProjectionConsent(): Promise<boolean> {
    return await overlayService.requestScreenshotPermission();
  }

  public async hasConsent(): Promise<boolean> {
    return await overlayService.hasScreenshotPermission();
  }

  public revokeConsent(): void {}

  public async captureScreen(): Promise<ScreenshotResult> {
    const res: CleanScreenshotResult = await overlayService.captureCleanScreenshot();
    return {
      uri: res.uri,
      sizeBytes: res.sizeBytes,
      mimeType: res.mimeType,
      name: res.name,
    };
  }
}

export const screenshotService = new ScreenshotService();
