import { AppState, AppStateStatus, Vibration, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { overlayService } from '../overlay';

export type ShakeSensitivity = 'low' | 'medium' | 'high';

export interface ShakeConfig {
  sensitivity: ShakeSensitivity;
  debounceMs: number;
  windowMs: number;
  requiredReversals: number;
}

export interface ShakeDiagnostics {
  isAvailable: boolean;
  isListening: boolean;
  currentMagnitude: number;
  threshold: number;
  reversalsCount: number;
  lastShakeTime: number | null;
  rawX: number;
  rawY: number;
  rawZ: number;
}

export class ShakeDetector {
  private config: ShakeConfig = {
    sensitivity: 'medium',
    debounceMs: 1200,
    windowMs: 500,
    requiredReversals: 2,
  };

  private subscription: { remove: () => void } | null = null;
  private appStateSubscription: { remove: () => void } | null = null;
  private lastShakeTimestamp: number = 0;
  private reversalTimestamps: number[] = [];
  private lastSign: number = 0;
  private isListening: boolean = false;
  private isAvailable: boolean = true;
  private onShakeCallbacks: Set<() => void> = new Set();
  private diagnosticListeners: Set<(diag: ShakeDiagnostics) => void> = new Set();
  private testModeActive: boolean = false;
  private lastDiagnostic: ShakeDiagnostics = {
    isAvailable: true,
    isListening: false,
    currentMagnitude: 0,
    threshold: 14.5,
    reversalsCount: 0,
    lastShakeTime: null,
    rawX: 0,
    rawY: 0,
    rawZ: 0,
  };

  constructor(config?: Partial<ShakeConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public getSensitivity(): ShakeSensitivity {
    return this.config.sensitivity;
  }

  public setSensitivity(sensitivity: ShakeSensitivity) {
    this.config.sensitivity = sensitivity;
    this.lastDiagnostic.threshold = this.getThreshold();
    this.notifyDiagnostics();
    overlayService.setShakeEnabled(this.isListening, sensitivity);
  }

  public getThreshold(): number {
    switch (this.config.sensitivity) {
      case 'low':
        return 21.0; // requires vigorous shake
      case 'high':
        return 10.0; // gentle wrist flick
      case 'medium':
      default:
        return 14.5; // standard deliberate wrist flick
    }
  }

  /**
   * Process an accelerometer reading (x, y, z in G where 1.0G ≈ 9.81 m/s²)
   */
  public processReading(x: number, y: number, z: number, timestamp: number = Date.now()): boolean {
    // Convert G to m/s^2 if values are near 1.0
    // expo-sensors returns G units on Android and iOS (earth gravity = 1.0)
    const gToMs2 = 9.80665;
    const ax = x * gToMs2;
    const ay = y * gToMs2;
    const az = z * gToMs2;

    const totalMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    const dynamicMagnitude = totalMagnitude - gToMs2; // Subtract earth gravity
    const absDynamic = Math.abs(dynamicMagnitude);
    const threshold = this.getThreshold();

    this.lastDiagnostic = {
      isAvailable: this.isAvailable,
      isListening: this.isListening,
      currentMagnitude: Math.round(absDynamic * 10) / 10,
      threshold,
      reversalsCount: this.reversalTimestamps.length,
      lastShakeTime: this.lastShakeTimestamp > 0 ? this.lastShakeTimestamp : null,
      rawX: Math.round(x * 100) / 100,
      rawY: Math.round(y * 100) / 100,
      rawZ: Math.round(z * 100) / 100,
    };
    this.notifyDiagnostics();

    // Check debounce cooldown
    if (timestamp - this.lastShakeTimestamp < this.config.debounceMs) {
      return false;
    }

    if (absDynamic > threshold) {
      // Determine dominant motion axis (X, Y, or dynamic Z)
      const absX = Math.abs(ax);
      const absY = Math.abs(ay);
      const absZ = Math.abs(Math.abs(az) - gToMs2);

      let currentSign = 1;
      if (absX >= absY && absX >= absZ) {
        currentSign = ax >= 0 ? 1 : -1;
      } else if (absY >= absX && absY >= absZ) {
        currentSign = ay >= 0 ? 1 : -1;
      } else {
        currentSign = az >= 0 ? 1 : -1;
      }

      if (this.lastSign !== 0 && currentSign !== this.lastSign) {
        // Direction reversal detected
        this.reversalTimestamps.push(timestamp);

        // Keep only reversals within windowMs
        this.reversalTimestamps = this.reversalTimestamps.filter(
          (t) => timestamp - t <= this.config.windowMs
        );

        this.lastDiagnostic.reversalsCount = this.reversalTimestamps.length;
        this.notifyDiagnostics();

        if (this.reversalTimestamps.length >= this.config.requiredReversals) {
          // Valid shake confirmed
          this.lastShakeTimestamp = timestamp;
          this.reversalTimestamps = [];
          this.lastSign = 0;

          // Provide subtle tactile haptic feedback
          try {
            Vibration.vibrate(60);
          } catch {
            // Ignore vibration error on unsupported platforms
          }

          // Trigger registered shake callbacks
          this.onShakeCallbacks.forEach((cb) => {
            try {
              cb();
            } catch (e) {
              console.warn('[ShakeDetector] Callback error:', e);
            }
          });

          return true;
        }
      }

      this.lastSign = currentSign;
    }

    return false;
  }

  /**
   * Start listening to physical device accelerometer
   */
  public async startListening(onShake?: () => void): Promise<boolean> {
    if (onShake) {
      this.onShakeCallbacks.add(onShake);
    }

    if (this.isListening) return true;

    try {
      this.isAvailable = await Accelerometer.isAvailableAsync();
    } catch {
      this.isAvailable = false;
    }

    if (!this.isAvailable) {
      this.isListening = false;
      this.notifyDiagnostics();
      overlayService.setShakeEnabled(false, this.config.sensitivity);
      return false;
    }

    // 50ms interval = 20Hz update rate, optimal responsiveness with low battery impact
    Accelerometer.setUpdateInterval(50);

    this.subscription = Accelerometer.addListener(({ x, y, z }) => {
      this.processReading(x, y, z);
    });

    // Pause sensor when app is sent to background, resume when foregrounded
    if (!this.appStateSubscription) {
      this.appStateSubscription = AppState.addEventListener(
        'change',
        (nextState: AppStateStatus) => {
          if (nextState === 'active') {
            if (this.isListening && !this.subscription) {
              this.subscription = Accelerometer.addListener(({ x, y, z }) => {
                this.processReading(x, y, z);
              });
            }
          } else {
            if (this.subscription) {
              this.subscription.remove();
              this.subscription = null;
            }
          }
        }
      );
    }

    this.isListening = true;
    this.reversalTimestamps = [];
    this.lastSign = 0;
    this.notifyDiagnostics();
    overlayService.setShakeEnabled(true, this.config.sensitivity);
    return true;
  }

  public stopListening(onShake?: () => void) {
    if (onShake) {
      this.onShakeCallbacks.delete(onShake);
    }

    if (this.onShakeCallbacks.size === 0 && !this.testModeActive) {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
      this.isListening = false;
      this.notifyDiagnostics();
      overlayService.setShakeEnabled(false, this.config.sensitivity);
    }
  }

  public registerCallback(onShake: () => void): () => void {
    this.onShakeCallbacks.add(onShake);
    return () => {
      this.onShakeCallbacks.delete(onShake);
    };
  }

  public subscribeDiagnostics(listener: (diag: ShakeDiagnostics) => void): () => void {
    this.diagnosticListeners.add(listener);
    listener(this.lastDiagnostic);
    return () => {
      this.diagnosticListeners.delete(listener);
    };
  }

  private notifyDiagnostics() {
    this.diagnosticListeners.forEach((listener) => {
      try {
        listener({ ...this.lastDiagnostic });
      } catch {
        // Ignore
      }
    });
  }

  public setTestMode(active: boolean) {
    this.testModeActive = active;
    if (active) {
      this.startListening();
    } else if (this.onShakeCallbacks.size === 0) {
      this.stopListening();
    }
  }
}

export const shakeDetector = new ShakeDetector();
