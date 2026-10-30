import { Injectable, Logger } from '@nestjs/common';

export interface RealtimeEnvelope<T = unknown> {
  event: string;
  workspaceId: string;
  payload: T;
  timestamp: string;
}

@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map(); // workspaceId -> Set<socketId>

  emitToWorkspace<T = unknown>(workspaceId: string, event: string, payload: T) {
    this.logger.log(`[Realtime Gateway] Emitting ${event} to workspace ${workspaceId}`);
    const envelope: RealtimeEnvelope<T> = {
      event,
      workspaceId,
      payload,
      timestamp: new Date().toISOString(),
    };
    return envelope;
  }

  emitToUser<T = unknown>(userId: string, event: string, payload: T) {
    this.logger.log(`[Realtime Gateway] Emitting ${event} to user ${userId}`);
    return {
      event,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };
  }

  emitTaskEvent(workspaceId: string, action: 'created' | 'updated' | 'deleted', task: any) {
    return this.emitToWorkspace(workspaceId, `task.${action}`, task);
  }

  emitBugEvent(workspaceId: string, action: 'created' | 'updated' | 'resolved', bug: any) {
    return this.emitToWorkspace(workspaceId, `bug.${action}`, bug);
  }

  emitCommentEvent(workspaceId: string, comment: any) {
    return this.emitToWorkspace(workspaceId, 'comment.created', comment);
  }

  emitSessionEvent(workspaceId: string, action: 'started' | 'ended', session: any) {
    return this.emitToWorkspace(workspaceId, `session.${action}`, session);
  }

  isHealthy(): boolean {
    return true;
  }
}
