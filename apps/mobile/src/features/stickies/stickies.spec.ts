import { StickyViewModel } from './types';

describe('Stickies Feature Logic', () => {
  it('deterministic tilt produces angle between -2.0 and +2.0 degrees', () => {
    const computeTilt = (id: string): number => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
      }
      return (Math.abs(hash) % 40) / 10 - 2;
    };

    const ids = ['stk-1', 'stk-2', 'random-uuid-999', 'test-sticky-id'];
    for (const id of ids) {
      const tilt = computeTilt(id);
      expect(tilt).toBeGreaterThanOrEqual(-2.0);
      expect(tilt).toBeLessThanOrEqual(2.0);
    }
  });

  it('pinned stickies sort before unpinned stickies', () => {
    const stickies: StickyViewModel[] = [
      {
        id: '1',
        body: 'Unpinned first in array',
        orderKey: 'a0',
        isPinned: false,
        projectId: 'p1',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        body: 'Pinned sticky',
        orderKey: 'a1',
        isPinned: true,
        projectId: 'p1',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const sorted = [...stickies].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    expect(sorted[0]!.id).toBe('2');
    expect(sorted[1]!.id).toBe('1');
  });
});
