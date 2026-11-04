export interface RealtimeEnvelope<T = unknown> {
    event: string;
    workspaceId: string;
    payload: T;
    timestamp: string;
}
export declare class RealtimeGateway {
    private readonly logger;
    private connectedClients;
    emitToWorkspace<T = unknown>(workspaceId: string, event: string, payload: T): RealtimeEnvelope<T>;
    emitToUser<T = unknown>(userId: string, event: string, payload: T): {
        event: string;
        userId: string;
        payload: T;
        timestamp: string;
    };
    emitTaskEvent(workspaceId: string, action: 'created' | 'updated' | 'deleted', task: any): RealtimeEnvelope<any>;
    emitBugEvent(workspaceId: string, action: 'created' | 'updated' | 'resolved', bug: any): RealtimeEnvelope<any>;
    emitCommentEvent(workspaceId: string, comment: any): RealtimeEnvelope<any>;
    emitSessionEvent(workspaceId: string, action: 'started' | 'ended', session: any): RealtimeEnvelope<any>;
    isHealthy(): boolean;
}
