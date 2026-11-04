"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor() {
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.deviceTokens = new Map();
        this.notifications = [];
    }
    registerDeviceToken(userId, token) {
        if (!this.deviceTokens.has(userId)) {
            this.deviceTokens.set(userId, new Set());
        }
        this.deviceTokens.get(userId).add(token);
        this.logger.log(`Registered device token for user ${userId}`);
        return { success: true };
    }
    async sendPushNotification(userId, notification) {
        const item = {
            ...notification,
            id: `notif-${Date.now()}`,
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        this.notifications.unshift(item);
        this.logger.log(`[FCM Mock Transport] Sent push to user ${userId}: ${item.title}`);
        return item;
    }
    getUserNotifications(userId) {
        return this.notifications.filter((n) => n.userId === userId);
    }
    markAsRead(notificationId) {
        const item = this.notifications.find((n) => n.id === notificationId);
        if (item) {
            item.isRead = true;
            return true;
        }
        return false;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map