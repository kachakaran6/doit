import { OutboxManager, OutboxEntry } from './outbox';

describe('OutboxManager (§6.10 / P16)', () => {
  it('enqueues items with unique idempotencyKey and PENDING state', () => {
    const manager = new OutboxManager();
    const entry = manager.enqueue({
      idempotencyKey: 'idem-101',
      entityId: 'task-42',
      method: 'POST',
      path: '/projects/p1/tasks',
      body: { title: 'Offline Task' },
      localFiles: [],
    });

    expect(entry.idempotencyKey).toBe('idem-101');
    expect(entry.state).toBe('PENDING');
    expect(entry.attempts).toBe(0);
    expect(manager.getPendingCount()).toBeGreaterThanOrEqual(1);
  });

  it('allows discarding entries', () => {
    const manager = new OutboxManager();
    const entry = manager.enqueue({
      idempotencyKey: 'idem-102',
      entityId: 'task-43',
      method: 'PATCH',
      path: '/tasks/task-43',
      body: { status: 'DONE' },
      localFiles: [],
    });

    manager.discardEntry(entry.id);
    const queue = manager.getQueue();
    expect(queue.find((e) => e.id === entry.id)).toBeUndefined();
  });
});
