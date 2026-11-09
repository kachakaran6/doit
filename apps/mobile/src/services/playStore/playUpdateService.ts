import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import { PlayServices, PlayUpdateInfo, UpdateDownloadProgress } from '../../native/play';

class PlayUpdateService {
  private hasPromptedThisSession = false;
  private isChecking = false;
  private progressSubscription: { remove: () => void } | null = null;
  private statusSubscription: { remove: () => void } | null = null;

  init() {
    if (Platform.OS !== 'android') return;

    // Check on launch
    this.checkForUpdatesSafely();

    // Check on app resume
    AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        this.checkForUpdatesSafely();
      }
    });

    // Listen for flexible download completion
    this.statusSubscription = PlayServices.onInstallStatusChanged((state) => {
      // InstallStatus.DOWNLOADED is 11 in Play Core
      if (state.installStatus === 11) {
        this.notifyUpdateReadyToInstall();
      }
    });
  }

  async checkForUpdatesSafely(forceUserCheck = false): Promise<PlayUpdateInfo | null> {
    if (this.isChecking) return null;
    if (!forceUserCheck && this.hasPromptedThisSession) return null;

    this.isChecking = true;
    try {
      const info = await PlayServices.checkForUpdate();

      // Check if update is downloaded and waiting for install
      if (info.installStatus === 11) {
        this.notifyUpdateReadyToInstall();
        return info;
      }

      if (info.updateAvailable) {
        // High priority / mandatory update (priority >= 4)
        if (info.immediateAllowed && info.updatePriority >= 4) {
          this.hasPromptedThisSession = true;
          await PlayServices.startUpdateFlow('immediate');
        } else if (info.flexibleAllowed) {
          this.hasPromptedThisSession = true;
          await PlayServices.startUpdateFlow('flexible');
        }
      } else if (forceUserCheck) {
        Alert.alert(
          'Latest Version Installed',
          'You are running the newest production release of DoIt. No updates are currently pending on Google Play.',
          [{ text: 'Great' }]
        );
      }

      return info;
    } catch (err) {
      console.warn('[PlayUpdateService] Check update error:', err);
      if (forceUserCheck) {
        Alert.alert(
          'Update Check',
          'Unable to reach Google Play update services right now. Please check your internet connection and try again later.',
          [{ text: 'OK' }]
        );
      }
      return null;
    } finally {
      this.isChecking = false;
    }
  }

  private notifyUpdateReadyToInstall() {
    Alert.alert(
      'Update Ready to Install',
      'The latest DoIt update has finished downloading from Google Play. Restart the app now to apply the newest features and improvements.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Restart & Install',
          onPress: () => {
            PlayServices.completeUpdate().catch((e) => {
              console.warn('[PlayUpdateService] Complete update failed:', e);
            });
          },
        },
      ]
    );
  }

  destroy() {
    this.progressSubscription?.remove();
    this.statusSubscription?.remove();
  }
}

export const playUpdateService = new PlayUpdateService();

