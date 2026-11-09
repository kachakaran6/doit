import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { PlayServices } from '../../native/play';

const LAST_REVIEW_TIME_KEY = 'com.samyukt.doit.last_review_prompt_time';
const ENGAGEMENT_COUNT_KEY = 'com.samyukt.doit.engagement_count';

// Non-negotiable requirements:
// - Minimum 15-day interval between review flow attempts
// - Reasonable engagement threshold (at least 3 meaningful actions)
// - Tracked locally in persistent storage
// - Never promise review dialog will appear (Google Play manages display criteria and quota)
const COOLDOWN_DAYS = 15;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
const MIN_ENGAGEMENT_ACTIONS = 3;

class PlayReviewService {
  private hasRequestedThisSession = false;

  async recordEngagement(): Promise<void> {
    try {
      const current = await this.getEngagementCount();
      const updated = current + 1;
      if (Platform.OS === 'web') {
        localStorage.setItem(ENGAGEMENT_COUNT_KEY, String(updated));
      } else {
        await SecureStore.setItemAsync(ENGAGEMENT_COUNT_KEY, String(updated));
      }

      // If user reached threshold, evaluate review request
      if (updated >= MIN_ENGAGEMENT_ACTIONS) {
        await this.requestReviewIfEligible();
      }
    } catch (e) {
      console.warn('[PlayReviewService] Failed to record engagement:', e);
    }
  }

  async requestReviewIfEligible(): Promise<boolean> {
    if (this.hasRequestedThisSession) return false;
    if (Platform.OS !== 'android') return false;

    try {
      const now = Date.now();
      const lastAttempt = await this.getLastReviewAttemptTime();

      if (lastAttempt && now - lastAttempt < COOLDOWN_MS) {
        return false;
      }

      const engagement = await this.getEngagementCount();
      if (engagement < MIN_ENGAGEMENT_ACTIONS) {
        return false;
      }

      this.hasRequestedThisSession = true;
      // Record this attempt immediately before calling the API to ensure cooldown even if user cancels
      await this.saveLastReviewAttemptTime(now);

      const shown = await PlayServices.requestReviewFlow();
      return shown;
    } catch (err) {
      console.warn('[PlayReviewService] Review flow error:', err);
      return false;
    }
  }

  async rateNow(): Promise<boolean> {
    return PlayServices.openPlayStoreListing();
  }

  private async getLastReviewAttemptTime(): Promise<number | null> {
    try {
      const raw = Platform.OS === 'web'
        ? localStorage.getItem(LAST_REVIEW_TIME_KEY)
        : await SecureStore.getItemAsync(LAST_REVIEW_TIME_KEY).catch(() => null);
      return raw ? parseInt(raw, 10) : null;
    } catch {
      return null;
    }
  }

  private async saveLastReviewAttemptTime(timestamp: number): Promise<void> {
    try {
      const str = String(timestamp);
      if (Platform.OS === 'web') {
        localStorage.setItem(LAST_REVIEW_TIME_KEY, str);
      } else {
        await SecureStore.setItemAsync(LAST_REVIEW_TIME_KEY, str);
      }
    } catch (e) {
      console.warn('[PlayReviewService] Failed to save review timestamp:', e);
    }
  }

  private async getEngagementCount(): Promise<number> {
    try {
      const raw = Platform.OS === 'web'
        ? localStorage.getItem(ENGAGEMENT_COUNT_KEY)
        : await SecureStore.getItemAsync(ENGAGEMENT_COUNT_KEY).catch(() => null);
      return raw ? parseInt(raw, 10) : 0;
    } catch {
      return 0;
    }
  }
}

export const playReviewService = new PlayReviewService();
