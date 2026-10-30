import { create } from 'zustand';
import { DeviceContextCollector } from '../../lib/device';
import { shakeDetector } from '../../native/shake';
import { screenshotService } from '../../native/screenshot';

export interface TestSessionState {
  isActive: boolean;
  appUnderTest: string;
  startTime: number | null;
  elapsedSeconds: number;
  bugIds: string[];
  lastScreenshotUri: string | null;
  isCaptureSheetOpen: boolean;
  startSession: (appNameOrPackage: string) => Promise<boolean>;
  endSession: () => void;
  recordBugCreated: (bugId: string) => void;
  setCaptureSheetOpen: (open: boolean) => void;
}

export const useSessionStore = create<TestSessionState>((set, get) => ({
  isActive: false,
  appUnderTest: 'com.samyukt.doit',
  startTime: null,
  elapsedSeconds: 0,
  bugIds: [],
  lastScreenshotUri: null,
  isCaptureSheetOpen: false,

  startSession: async (appNameOrPackage: string) => {
    // 1. Set app under test
    DeviceContextCollector.setAppUnderTest(appNameOrPackage);

    // 2. Request MediaProjection consent once per session
    await screenshotService.requestProjectionConsent();

    // 3. Start shake detector
    shakeDetector.startListening(async () => {
      const shot = await screenshotService.captureScreen();
      set({
        lastScreenshotUri: shot.uri,
        isCaptureSheetOpen: true,
      });
    });

    set({
      isActive: true,
      appUnderTest: appNameOrPackage,
      startTime: Date.now(),
      elapsedSeconds: 0,
      bugIds: [],
    });

    return true;
  },

  endSession: () => {
    shakeDetector.stopListening();
    screenshotService.revokeConsent();
    set({
      isActive: false,
    });
  },

  recordBugCreated: (bugId: string) => {
    set((state) => ({
      bugIds: [...state.bugIds, bugId],
    }));
  },

  setCaptureSheetOpen: (open: boolean) => {
    set({ isCaptureSheetOpen: open });
  },
}));
