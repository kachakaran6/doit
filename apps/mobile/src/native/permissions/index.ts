import { Linking, Platform } from 'react-native';
import { overlayService } from '../overlay';

export type PermissionType =
  | 'overlay'
  | 'microphone'
  | 'screen_capture'
  | 'usage_stats';

export interface PermissionStatus {
  granted: boolean;
  canRequest: boolean;
  prePromptTitle: string;
  prePromptMessage: string;
}

export const permissionExplanations: Record<PermissionType, { title: string; message: string }> = {
  overlay: {
    title: 'Enable Quick Capture Bubble',
    message: 'This lets Samyukt float a small button over other apps so you can report a bug without switching away.',
  },
  microphone: {
    title: 'Enable Voice Dictation',
    message: 'Record voice descriptions and let AI automatically structure steps and title.',
  },
  screen_capture: {
    title: 'Screen Capture Permission',
    message: 'Attach a screenshot of what broke during your testing session. Recording stops when the session ends.',
  },
  usage_stats: {
    title: 'App Detection Permission',
    message: 'Allows Samyukt to automatically identify which application you were testing when capturing bugs.',
  },
};

export class PermissionManager {
  public static async checkPermission(type: PermissionType): Promise<boolean> {
    if (type === 'overlay') {
      return overlayService.hasPermission();
    }
    return true;
  }

  public static async requestPermission(type: PermissionType): Promise<boolean> {
    if (type === 'overlay') {
      await overlayService.requestPermission();
      return overlayService.hasPermission();
    }
    return true;
  }

  public static openSystemSettings() {
    Linking.openSettings();
  }
}
