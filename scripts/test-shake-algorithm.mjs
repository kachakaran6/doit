import assert from 'node:assert';

// Pure algorithm verification matching ShakeDetector in index.ts
class ShakeDetectorTest {
  constructor(config = {}) {
    this.config = {
      sensitivity: 'medium',
      debounceMs: 1200,
      windowMs: 500,
      requiredReversals: 2,
      ...config,
    };
    this.lastShakeTimestamp = 0;
    this.reversalTimestamps = [];
    this.lastSign = 0;
    this.isListening = true;
    this.callbacks = [];
  }

  getThreshold() {
    switch (this.config.sensitivity) {
      case 'low': return 21.0;
      case 'high': return 10.0;
      case 'medium':
      default: return 14.5;
    }
  }

  processReading(x, y, z, timestamp = Date.now()) {
    if (!this.isListening) return false;

    const gToMs2 = 9.80665;
    const ax = x * gToMs2;
    const ay = y * gToMs2;
    const az = z * gToMs2;

    // Estimate dynamic acceleration by subtracting earth gravity
    const totalMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    const dynamicMagnitude = Math.abs(totalMagnitude - gToMs2);
    const threshold = this.getThreshold();

    if (timestamp - this.lastShakeTimestamp < this.config.debounceMs) {
      return false;
    }

    if (dynamicMagnitude > threshold) {
      // Determine the dominant motion axis (X, Y, or dynamic Z)
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
        this.reversalTimestamps.push(timestamp);
        this.reversalTimestamps = this.reversalTimestamps.filter(
          (t) => timestamp - t <= this.config.windowMs
        );

        if (this.reversalTimestamps.length >= this.config.requiredReversals) {
          this.lastShakeTimestamp = timestamp;
          this.reversalTimestamps = [];
          this.lastSign = 0;
          this.callbacks.forEach((cb) => cb());
          return true;
        }
      }

      this.lastSign = currentSign;
    }

    return false;
  }
}

console.log('Running ShakeDetector algorithm test suite...');

// Test 1: Walking / steady movement should not trigger
{
  const detector = new ShakeDetectorTest();
  let triggered = false;
  detector.callbacks.push(() => { triggered = true; });

  const now = 10000;
  detector.processReading(0.05, 0.1, 1.02, now);
  detector.processReading(0.08, 0.12, 0.98, now + 50);
  detector.processReading(0.04, 0.09, 1.05, now + 100);

  assert.strictEqual(triggered, false, 'Walking/steady motion must not trigger shake');
  console.log('✔ Test 1: Walking and steady motion correctly rejected');
}

// Test 2: Double wrist flick triggers shake
{
  const detector = new ShakeDetectorTest({ sensitivity: 'medium' });
  let triggered = false;
  detector.callbacks.push(() => { triggered = true; });

  const now = 10000;
  // Rapid wrist flick: 2.8G dynamic acceleration
  detector.processReading(2.8, 0, 1.0, now);
  detector.processReading(-2.8, 0, 1.0, now + 80);
  detector.processReading(2.8, 0, 1.0, now + 160);

  assert.strictEqual(triggered, true, 'Alternating directional wrist flick must trigger');
  console.log('✔ Test 2: Alternating directional wrist flick triggers successfully');
}

// Test 3: Sensitivity thresholds
{
  const highDetector = new ShakeDetectorTest({ sensitivity: 'high' });
  let highTriggered = false;
  highDetector.callbacks.push(() => { highTriggered = true; });

  const lowDetector = new ShakeDetectorTest({ sensitivity: 'low' });
  let lowTriggered = false;
  lowDetector.callbacks.push(() => { lowTriggered = true; });

  const now = 10000;
  // Moderate flick: ~1.1G dynamic (~11.0 m/s²: exceeds high 10.0 m/s², below low 21.0 m/s²)
  highDetector.processReading(1.85, 0, 1.0, now);
  highDetector.processReading(-1.85, 0, 1.0, now + 80);
  highDetector.processReading(1.85, 0, 1.0, now + 160);

  lowDetector.processReading(1.85, 0, 1.0, now);
  lowDetector.processReading(-1.85, 0, 1.0, now + 80);
  lowDetector.processReading(1.85, 0, 1.0, now + 160);

  assert.strictEqual(highTriggered, true, 'High sensitivity should detect moderate flick');
  assert.strictEqual(lowTriggered, false, 'Low sensitivity should reject moderate flick');
  console.log('✔ Test 3: Sensitivity levels correctly alter detection thresholds');
}

// Test 4: Debounce cooldown
{
  const detector = new ShakeDetectorTest();
  let count = 0;
  detector.callbacks.push(() => { count++; });

  const now = 10000;
  // First shake
  detector.processReading(2.8, 0, 1.0, now);
  detector.processReading(-2.8, 0, 1.0, now + 80);
  detector.processReading(2.8, 0, 1.0, now + 160);
  assert.strictEqual(count, 1, 'First shake counted');

  // Second shake during cooldown (at 600ms < 1200ms)
  detector.processReading(2.8, 0, 1.0, now + 600);
  detector.processReading(-2.8, 0, 1.0, now + 680);
  detector.processReading(2.8, 0, 1.0, now + 760);
  assert.strictEqual(count, 1, 'Second shake during debounce must be blocked');

  // Third shake after cooldown (at 1400ms > 1200ms)
  detector.processReading(2.8, 0, 1.0, now + 1400);
  detector.processReading(-2.8, 0, 1.0, now + 1480);
  detector.processReading(2.8, 0, 1.0, now + 1560);
  assert.strictEqual(count, 2, 'Third shake after debounce must be counted');
  console.log('✔ Test 4: 1200ms debounce cooldown correctly prevents duplicate captures');
}

console.log('\nAll 4 Shake Detection algorithm tests PASSED! 🚀');
