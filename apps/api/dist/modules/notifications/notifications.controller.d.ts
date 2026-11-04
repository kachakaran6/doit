import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string): import("./notifications.service").NotificationItem[];
    registerDevice(userId: string, token: string): {
        success: boolean;
    };
    markRead(id: string): {
        success: boolean;
    };
}
