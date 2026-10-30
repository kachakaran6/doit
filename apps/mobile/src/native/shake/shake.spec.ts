import { ShakeDetector } from './index';

describe('ShakeDetector Native Logic (§12 / P13)', () => {
  it('does not trigger on steady linear motion or single acceleration spike', () => {
    let triggered = false;
    const detector = new ShakeDetector();
    detector.startListening(() => {
      triggered = true;
    });

    const now = 100000;
    // Single forward motion spike
    detector.processReading(25, 0, 9.8, now);
    detector.processReading(25, 0, 9.8, now + 50);
    detector.processReading(25, 0, 9.8, now + 100);

    expect(triggered).toBe(false);
  });

  it('triggers on 3 direction reversals within 400ms window', () => {
    let triggered = false;
    const detector = new ShakeDetector();
    detector.startListening(() => {
      triggered = true;
    });

    const now = 100000;
    // 1. Positive spike
    detector.processReading(25, 0, 9.8, now);
    // 2. First reversal (negative spike)
    detector.processReading(-25, 0, 9.8, now + 80);
    // 3. Second reversal (positive spike)
    detector.processReading(25, 0, 9.8, now + 160);
    // 4. Third reversal (negative spike)
    detector.processReading(-25, 0, 9.8, now + 240);

    expect(triggered).toBe(true);
  });

  it('enforces 1.2s debounce between shakes', () => {
    let triggerCount = 0;
    const detector = new ShakeDetector();
    detector.startListening(() => {
      triggerCount++;
    });

    const now = 100000;
    // First shake
    detector.processReading(25, 0, 9.8, now);
    detector.processReading(-25, 0, 9.8, now + 80);
    detector.processReading(25, 0, 9.8, now + 160);
    detector.processReading(-25, 0, 9.8, now + 240);
    expect(triggerCount).toBe(1);

    // Immediate second shake within 500ms (< 1200ms debounce)
    const midTime = now + 500;
    detector.processReading(25, 0, 9.8, midTime);
    detector.processReading(-25, 0, 9.8, midTime + 80);
    detector.processReading(25, 0, 9.8, midTime + 160);
    detector.processReading(-25, 0, 9.8, midTime + 240);
    expect(triggerCount).toBe(1); // Blocked by debounce!

    // Shake after 1300ms (> 1200ms debounce)
    const laterTime = now + 1300;
    detector.processReading(25, 0, 9.8, laterTime);
    detector.processReading(-25, 0, 9.8, laterTime + 80);
    detector.processReading(25, 0, 9.8, laterTime + 160);
    detector.processReading(-25, 0, 9.8, laterTime + 240);
    expect(triggerCount).toBe(2);
  });
});
