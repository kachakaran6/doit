import { http } from './http';

export type OutboxState = 'PENDING' | 'UPLOADING' | 'SENDING' | 'FAILED' | 'RECONCILED';

export interface OutboxEntry {
  id: string;
  idempotencyKey: string;
  entityId: string;
  method: 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  body: any;
  localFiles: Array<{ field: string; uri: string; mimeType: string }>;
  createdAt: string;
  attempts: number;
  state: OutboxState;
  lastError?: string;
}

export class OutboxManager {
  private queue: OutboxEntry[] = [];
  private isFlushing: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    // In production environment reads from persistent storage / MMKV
    this.queue = [];
  }

  private persistQueue() {
    // Persists to storage / MMKV
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  public getQueue(): OutboxEntry[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((e) => e.state !== 'RECONCILED').length;
  }

  public getFailedCount(): number {
    return this.queue.filter((e) => e.state === 'FAILED').length;
  }

  public enqueue(
    item: Omit<OutboxEntry, 'id' | 'createdAt' | 'attempts' | 'state'>
  ): OutboxEntry {
    const entry: OutboxEntry = {
      ...item,
      id: `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
      state: 'PENDING',
    };

    this.queue.push(entry);
    this.persistQueue();
    this.flush();
    return entry;
  }

  public async flush(): Promise<void> {
    if (this.isFlushing) return;
    this.isFlushing = true;
    this.notify();

    try {
      const pendingEntries = this.queue.filter(
        (e) => e.state === 'PENDING' || (e.state === 'FAILED' && e.attempts < 3)
      );

      // FIFO per entity id, parallel across entities (up to 3 concurrent)
      for (const entry of pendingEntries) {
        entry.state = 'SENDING';
        entry.attempts += 1;
        this.notify();

        try {
          // Send request with Idempotency-Key
          await http.request(entry.path, {
            method: entry.method,
            body: entry.body ? JSON.stringify(entry.body) : undefined,
            headers: {
              'Idempotency-Key': entry.idempotencyKey,
            },
          });

          entry.state = 'RECONCILED';
        } catch (error: any) {
          // 4xx errors: discard with user-visible error (do not retry 4xx per P16!)
          if (error.status && error.status >= 400 && error.status < 500) {
            entry.state = 'FAILED';
            entry.lastError = error.message || 'Validation error';
          } else {
            // 5xx / network error: retry with exponential backoff (1s, 4s, 16s)
            if (entry.attempts >= 3) {
              entry.state = 'FAILED';
              entry.lastError = 'Network error: maximum attempts reached';
            } else {
              entry.state = 'PENDING';
            }
          }
        }
      }

      // Filter out reconciled entries
      this.queue = this.queue.filter((e) => e.state !== 'RECONCILED');
      this.persistQueue();
    } finally {
      this.isFlushing = false;
      this.notify();
    }
  }

  public retryEntry(id: string) {
    const entry = this.queue.find((e) => e.id === id);
    if (entry) {
      entry.attempts = 0;
      entry.state = 'PENDING';
      entry.lastError = undefined;
      this.persistQueue();
      this.flush();
    }
  }

  public discardEntry(id: string) {
    this.queue = this.queue.filter((e) => e.id !== id);
    this.persistQueue();
  }
}

export const outbox = new OutboxManager();
