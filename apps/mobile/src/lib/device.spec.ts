import { DeviceContextCollector } from './device';

describe('DeviceContextCollector (§12 / P13)', () => {
  it('correctly tracks and provides app under test', async () => {
    DeviceContextCollector.setAppUnderTest('com.whatsapp');
    expect(DeviceContextCollector.getAppUnderTest()).toBe('com.whatsapp');

    const context = await DeviceContextCollector.collectContext();
    expect(context.appUnderTest).toBe('com.whatsapp');
    expect(context.deviceModel).toBeDefined();
    expect(context.osVersion).toBeDefined();
    expect(context.screenSize).toMatch(/\d+x\d+/);
    expect(context.capturedAt).toBeDefined();
  });

  it('allows overriding specific telemetry parameters', async () => {
    const context = await DeviceContextCollector.collectContext({
      batteryPct: 42,
      locale: 'hi-IN',
    });

    expect(context.batteryPct).toBe(42);
    expect(context.locale).toBe('hi-IN');
  });
});
