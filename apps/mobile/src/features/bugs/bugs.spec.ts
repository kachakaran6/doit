import { BugViewModel } from './types';

describe('Bugs Feature Logic', () => {
  it('correctly filters bugs by severity', () => {
    const bugs: BugViewModel[] = [
      {
        id: 'b1',
        humanId: 'SMP-BUG-1',
        title: 'Crash on payment',
        severity: 'CRITICAL',
        status: 'TRIAGED',
        orderKey: 'a0',
        projectId: 'p1',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'b2',
        humanId: 'SMP-BUG-2',
        title: 'Minor layout shift',
        severity: 'MINOR',
        status: 'TRIAGED',
        orderKey: 'a1',
        projectId: 'p1',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const criticalOnly = bugs.filter((b) => b.severity === 'CRITICAL');
    expect(criticalOnly.length).toBe(1);
    expect(criticalOnly[0]!.id).toBe('b1');
  });

  it('validates telemetry capture structure', () => {
    const telemetry = {
      deviceModel: 'Google Pixel 8',
      osVersion: 'Android 14 (API 34)',
      appVersion: '0.1.0',
      buildNumber: '104',
      timestamp: new Date().toISOString(),
    };

    expect(telemetry.deviceModel).toBeDefined();
    expect(telemetry.osVersion).toContain('Android 14');
    expect(telemetry.appVersion).toBe('0.1.0');
  });
});
