import { useSessionStore } from './store';
import { DeviceContextCollector } from '../../lib/device';

describe('Test Session Feature Store (P13)', () => {
  it('manages session lifecycle and records created bugs', async () => {
    const store = useSessionStore.getState();

    await store.startSession('com.example.shopping');
    expect(useSessionStore.getState().isActive).toBe(true);
    expect(DeviceContextCollector.getAppUnderTest()).toBe('com.example.shopping');

    store.recordBugCreated('bug-101');
    store.recordBugCreated('bug-102');
    expect(useSessionStore.getState().bugIds).toEqual(['bug-101', 'bug-102']);

    store.endSession();
    expect(useSessionStore.getState().isActive).toBe(false);
  });
});
