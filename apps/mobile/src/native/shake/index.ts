export type ShakeSensitivity = 'low' | 'medium' | 'high';

export interface ShakeConfig {
  sensitivity: ShakeSensitivity;
  debounceMs: number; // 1200ms per P13
  windowMs: number;   // 400ms window for direction reversals
  requiredReversals: number; // 3 reversals
}

export class ShakeDetector {
  private config: ShakeConfig = {
    sensitivity: 'medium',
    debounceMs: 1200,
    windowMs: 400,
    requiredReversals: 3,
  };

  private lastShakeTimestamp: number = 0;
  private reversalTimestamps: number[] = [];
  private lastSign: number = 0;
  private isListening: boolean = false;
  private onShakeCallback: (() => void) | null = null;

  constructor(config?: Partial<ShakeConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  setSensitivity(sensitivity: ShakeSensitivity) {
    this.config.sensitivity = sensitivity;
  }

  private getThreshold(): number {
    switch (this.config.sensitivity) {
      case 'low':
        return 22.0;
      case 'high':
        return 12.0;
      case 'medium':
      default:
        return 16.0;
    }
  }

  /**
   * Process an accelerometer reading (x, y, z in m/s^2)
   */
  public processReading(x: number, y: number, z: number, timestamp: number = Date.now()): boolean {
    if (!this.isListening) return false;

    // Check debounce
    if (timestamp - this.lastShakeTimestamp < this.config.debounceMs) {
      return false;
    }

    const magnitude = Math.sqrt(x * x + y * y + z * z) - 9.81; // subtract gravity
    const threshold = this.getThreshold();

    if (Math.abs(magnitude) > threshold) {
      const currentSign = magnitude > 0 ? 1 : -1;

      if (this.lastSign !== 0 && currentSign !== this.lastSign) {
        // Direction reversal detected!
        this.reversalTimestamps.push(timestamp);
        // Clean out reversals older than windowMs
        this.reversalTimestamps = this.reversalTimestamps.filter(
          (t) => timestamp - t <= this.config.windowMs
        );

        if (this.reversalTimestamps.length >= this.config.requiredReversals) {
          // Valid shake confirmed!
          this.lastShakeTimestamp = timestamp;
          this.reversalTimestamps = [];
          this.lastSign = 0;
          if (this.onShakeCallback) {
            this.onShakeCallback();
          }
          return true;
        }
      }

      this.lastSign = currentSign;
    }

    return false;
  }

  public startListening(onShake: () => void) {
    this.onShakeCallback = onShake;
    this.isListening = true;
    this.reversalTimestamps = [];
    this.lastSign = 0;
  }

  public stopListening() {
    this.isListening = false;
    this.onShakeCallback = null;
  }
}

export const shakeDetector = new ShakeDetector();
