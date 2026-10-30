import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { outbox, OutboxEntry } from '../../lib/outbox';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface OutboxContextValue {
  status: SyncStatus;
  pendingCount: number;
  failedCount: number;
  entries: OutboxEntry[];
  flush: () => Promise<void>;
  retry: (id: string) => void;
  discard: (id: string) => void;
}

const OutboxContext = createContext<OutboxContextValue>({
  status: 'synced',
  pendingCount: 0,
  failedCount: 0,
  entries: [],
  flush: async () => {},
  retry: () => {},
  discard: () => {},
});

export const OutboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<OutboxEntry[]>(outbox.getQueue());
  const [pendingCount, setPendingCount] = useState(outbox.getPendingCount());
  const [failedCount, setFailedCount] = useState(outbox.getFailedCount());

  useEffect(() => {
    const unsubscribe = outbox.subscribe(() => {
      setEntries(outbox.getQueue());
      setPendingCount(outbox.getPendingCount());
      setFailedCount(outbox.getFailedCount());
    });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        outbox.flush();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);

    // Initial flush on app start
    outbox.flush();

    return () => {
      unsubscribe();
      sub.remove();
    };
  }, []);

  const getSyncStatus = (): SyncStatus => {
    if (failedCount > 0) return 'error';
    if (pendingCount > 0) return 'syncing';
    return 'synced';
  };

  return (
    <OutboxContext.Provider
      value={{
        status: getSyncStatus(),
        pendingCount,
        failedCount,
        entries,
        flush: () => outbox.flush(),
        retry: (id) => outbox.retryEntry(id),
        discard: (id) => outbox.discardEntry(id),
      }}
    >
      {children}
    </OutboxContext.Provider>
  );
};

export function useOutbox() {
  return useContext(OutboxContext);
}
