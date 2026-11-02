import { ShakeDetector } from './index';

describe('ShakeDetector Native Logic (§12 / P13)', () => {
  it('does not trigger on steady linear motion or walking/tilting', () => {
    let triggered = false;
    const detector = new ShakeDetector();
    // Simulate active listening
    (detector as any).isListening = true;
    detector.registerCallback(() => {
      triggered = true;
    });

    const now = 100000;
    // Normal phone holding / walking motion: ~1.0G on Z, minor fluctuations on X/Y
    detector.processReading(0.05, 0.1, 1.02, now);
    detector.processReading(0.08, 0.12, 0.98, now + 50);
    detector.processReading(0.04, 0.09, 1.05, now + 100);

    expect(triggered).toBe(false);
  });

  it('triggers on alternating directional wrist flick reversals within window', () => {
    let triggered = false;
    const detector = new ShakeDetector({ sensitivity: 'medium' });
    (detector as any).isListening = true;
    detector.registerCallback(() => {
      triggered = true;
    });

    const now = 100000;
    // Rapid wrist flick: alternating high acceleration along X axis
    // 2.5G * 9.8 ≈ 24.5 m/s² (well above 14.5 m/s² threshold)
    detector.processReading(2.8, 0, 1.0, now);
    detector.processReading(-2.8, 0, 1.0, now + 80);
    detector.processReading(2.8, 0, 1.0, now + 160);

    expect(triggered).toBe(true);
  });

  it('respects sensitivity levels: high triggers at lower acceleration than low', () => {
    const highDetector = new ShakeDetector({ sensitivity: 'high' });
    (highDetector as any).isListening = true;
    let highTriggered = false;
    highDetector.registerCallback(() => {
      highTriggered = true;
    });

    const lowDetector = new ShakeDetector({ sensitivity: 'low' });
    (lowDetector as any).isListening = true;
    let lowTriggered = false;
    lowDetector.registerCallback(() => {
      lowTriggered = true;
    });

    const now = 100000;
    // Moderate acceleration ~ 1.1G dynamic (11.0 m/s²): exceeds high (10.0), below low (21.0)
    highDetector.processReading(1.85, 0, 1.0, now);
    highDetector.processReading(-1.85, 0, 1.0, now + 80);
    highDetector.processReading(1.85, 0, 1.0, now + 160);

    lowDetector.processReading(1.85, 0, 1.0, now);
    lowDetector.processReading(-1.85, 0, 1.0, now + 80);
    lowDetector.processReading(1.85, 0, 1.0, now + 160);

    expect(highTriggered).toBe(true);
    expect(lowTriggered).toBe(false);
  });

  it('enforces 1200ms debounce cooldown between shakes', () => {
    let triggerCount = 0;
    const detector = new ShakeDetector();
    (detector as any).isListening = true;
    detector.registerCallback(() => {
      triggerCount++;
    });

    const now = 100000;
    // First shake
    detector.processReading(3.0, 0, 1.0, now);
    detector.processReading(-3.0, 0, 1.0, now + 80);
    detector.processReading(3.0, 0, 1.0, now + 160);
    expect(triggerCount).toBe(1);

    // Immediate second shake within 600ms (< 1200ms debounce)
    const midTime = now + 600;
    detector.processReading(3.0, 0, 1.0, midTime);
    detector.processReading(-3.0, 0, 1.0, midTime + 80);
    detector.processReading(3.0, 0, 1.0, midTime + 160);
    expect(triggerCount).toBe(1); // Blocked by debounce

    // Subsequent shake after 1300ms (> 1200ms debounce)
    const laterTime = now + 1300;
    detector.processReading(3.0, 0, 1.0, laterTime);
    detector.processReading(-3.0, 0, 1.0, laterTime + 80);
    detector.processReading(3.0, 0, 1.0, laterTime + 160);
    expect(triggerCount).toBe(2);
  });
});
