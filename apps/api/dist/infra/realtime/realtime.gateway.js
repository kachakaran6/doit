"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor() {
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
        this.connectedClients = new Map();
    }
    emitToWorkspace(workspaceId, event, payload) {
        this.logger.log(`[Realtime Gateway] Emitting ${event} to workspace ${workspaceId}`);
        const envelope = {
            event,
            workspaceId,
            payload,
            timestamp: new Date().toISOString(),
        };
        return envelope;
    }
    emitToUser(userId, event, payload) {
        this.logger.log(`[Realtime Gateway] Emitting ${event} to user ${userId}`);
        return {
            event,
            userId,
            payload,
            timestamp: new Date().toISOString(),
        };
    }
    emitTaskEvent(workspaceId, action, task) {
        return this.emitToWorkspace(workspaceId, `task.${action}`, task);
    }
    emitBugEvent(workspaceId, action, bug) {
        return this.emitToWorkspace(workspaceId, `bug.${action}`, bug);
    }
    emitCommentEvent(workspaceId, comment) {
        return this.emitToWorkspace(workspaceId, 'comment.created', comment);
    }
    emitSessionEvent(workspaceId, action, session) {
        return this.emitToWorkspace(workspaceId, `session.${action}`, session);
    }
    isHealthy() {
        return true;
    }
};
exports.RealtimeGateway = RealtimeGateway;
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, common_1.Injectable)()
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map