import { NativeModules, NativeEventEmitter, Platform, Linking, Share } from 'react-native';

export interface PlayUpdateInfo {
  updateAvailable: boolean;
  updateAvailability: number; // 1: NOT_AVAILABLE, 2: AVAILABLE, 3: IN_PROGRESS
  immediateAllowed: boolean;
  flexibleAllowed: boolean;
  availableVersionCode: number;
  updatePriority: number; // 0..5
  clientVersionStalenessDays: number;
  installStatus: number; // 0..11
}

export interface UpdateDownloadProgress {
  bytesDownloaded: number;
  totalBytesToDownload: number;
  percent: number;
}

export interface PackageMetadata {
  versionName: string;
  versionCode: number;
  packageName: string;
}

const { PlayServicesModule } = NativeModules;
const playEmitter = PlayServicesModule ? new NativeEventEmitter(PlayServicesModule) : null;

export const PlayServices = {
  isAvailable(): boolean {
    return Platform.OS === 'android' && Boolean(PlayServicesModule);
  },

  async checkForUpdate(): Promise<PlayUpdateInfo> {
    if (!this.isAvailable()) {
      return {
        updateAvailable: false,
        updateAvailability: 1,
        immediateAllowed: false,
        flexibleAllowed: false,
        availableVersionCode: 0,
        updatePriority: 0,
        clientVersionStalenessDays: 0,
        installStatus: 0,
      };
    }
    return PlayServicesModule.checkForUpdate();
  },

  async startUpdateFlow(type: 'immediate' | 'flexible'): Promise<{ success: boolean; cancelled: boolean; resultCode: number }> {
    if (!this.isAvailable()) {
      return { success: false, cancelled: false, resultCode: 0 };
    }
    return PlayServicesModule.startUpdateFlow(type);
  },

  async completeUpdate(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return PlayServicesModule.completeUpdate();
  },

  async requestReviewFlow(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return PlayServicesModule.requestReviewFlow();
  },

  async openPlayStoreListing(customPackage?: string): Promise<boolean> {
    const pkg = customPackage || 'com.samyukt.doit';
    if (this.isAvailable()) {
      try {
        return await PlayServicesModule.openPlayStoreListing(pkg);
      } catch (err) {
        console.warn('[PlayServices] Native openPlayStoreListing failed, using Linking fallback:', err);
      }
    }
    // Fallback on web or if module not present
    const url = `https://play.google.com/store/apps/details?id=${pkg}`;
    return Linking.openURL(url).then(() => true).catch(() => false);
  },

  async shareApplication(appName = 'DoIt', description = 'Precision project management & issue tracking for modern engineering teams'): Promise<boolean> {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.samyukt.doit';
    if (this.isAvailable()) {
      try {
        return await PlayServicesModule.shareApplication(appName, description, playStoreUrl);
      } catch (err) {
        console.warn('[PlayServices] Native share failed, using React Native Share fallback:', err);
      }
    }
    // Cross-platform React Native Share fallback
    try {
      const shareText = `Discover ${appName} — ${description}.\n\nExplore the app and try it today:\n${playStoreUrl}\n\nMade with care by Samyukt.`;
      await Share.share({
        message: shareText,
        title: `Discover ${appName}`,
      });
      return true;
    } catch {
      return false;
    }
  },

  async getPackageMetadata(): Promise<PackageMetadata> {
    if (this.isAvailable()) {
      try {
        return await PlayServicesModule.getPackageMetadata();
      } catch (e) {
        console.warn('[PlayServices] getPackageMetadata failed, using fallback:', e);
      }
    }
    return {
      versionName: '0.2.6',
      versionCode: 26,
      packageName: 'com.samyukt.doit',
    };
  },

  onDownloadProgress(callback: (progress: UpdateDownloadProgress) => void) {
    if (!playEmitter) return { remove: () => {} };
    return playEmitter.addListener('onPlayUpdateDownloadProgress', callback);
  },

  onInstallStatusChanged(callback: (status: { installStatus: number; installErrorCode: number }) => void) {
    if (!playEmitter) return { remove: () => {} };
    return playEmitter.addListener('onPlayUpdateStatusChanged', callback);
  },
};
