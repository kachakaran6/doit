import { CursorPage } from './cursor-page';

describe('CursorPage', () => {
  it('should encode and decode cursor round-trip accurately', () => {
    const payload = { order: '1500.5', id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6' };
    const encoded = CursorPage.encode(payload);

    expect(typeof encoded).toBe('string');
    const decoded = CursorPage.decode(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.order).toBe('1500.5');
    expect(decoded?.id).toBe(payload.id);
  });

  it('should return null for malformed cursor', () => {
    expect(CursorPage.decode('not-a-valid-cursor')).toBeNull();
  });

  it('should construct paginated results with nextCursor when hasMore is true', () => {
    const items = [
      { id: '1', order: 100, name: 'Task 1' },
      { id: '2', order: 200, name: 'Task 2' },
      { id: '3', order: 300, name: 'Task 3' },
    ];

    const result = CursorPage.create(items, 2, 10);
    expect(result.data.length).toBe(2);
    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.total).toBe(10);
    expect(result.meta.nextCursor).not.toBeNull();

    const decoded = CursorPage.decode(result.meta.nextCursor!);
    expect(decoded?.id).toBe('2');
  });

  it('should have null nextCursor when hasMore is false', () => {
    const items = [{ id: '1', order: 100, name: 'Task 1' }];
    const result = CursorPage.create(items, 2, 1);
    expect(result.data.length).toBe(1);
    expect(result.meta.hasMore).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });
});
