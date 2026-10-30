import { queryClient } from './queryClient';
import { taskKeys } from '../features/tasks/api/keys';
import { bugKeys } from '../features/bugs/api/keys';
import { stickyKeys } from '../features/stickies/api/keys';

export type RealtimeEvent =
  | 'task.created'
  | 'task.updated'
  | 'task.deleted'
  | 'bug.created'
  | 'bug.updated'
  | 'sticky.created'
  | 'sticky.updated'
  | 'comment.created';

export class RealtimeClient {
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private timer: any = null;

  public connect(token?: string) {
    this.isConnected = true;
    this.reconnectAttempts = 0;
  }

  public disconnect() {
    this.isConnected = false;
    if (this.timer) clearTimeout(this.timer);
  }

  public handleEvent(event: RealtimeEvent, payload: { entityId?: string; projectId?: string }) {
    // Invalidate specific query keys per P16 (never merge payloads by hand!)
    if (event.startsWith('task.')) {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      if (payload.entityId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(payload.entityId) });
      }
    } else if (event.startsWith('bug.')) {
      queryClient.invalidateQueries({ queryKey: bugKeys.lists() });
      if (payload.entityId) {
        queryClient.invalidateQueries({ queryKey: bugKeys.detail(payload.entityId) });
      }
    } else if (event.startsWith('sticky.')) {
      queryClient.invalidateQueries({ queryKey: stickyKeys.lists() });
    }
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtime = new RealtimeClient();
