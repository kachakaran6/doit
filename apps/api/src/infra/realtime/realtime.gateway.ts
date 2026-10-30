import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  emitToWorkspace(workspaceId: string, event: string, _payload: unknown) {
    this.logger.log(`[Realtime Shell] emit to workspace ${workspaceId}: ${event}`);
  }

  emitToUser(userId: string, event: string, _payload: unknown) {
    this.logger.log(`[Realtime Shell] emit to user ${userId}: ${event}`);
  }

  isHealthy(): boolean {
    return true;
  }
}
