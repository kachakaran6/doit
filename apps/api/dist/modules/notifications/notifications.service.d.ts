export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    body: string;
    type: 'TASK_ASSIGNED' | 'BUG_REPORTED' | 'DUE_SOON' | 'OVERDUE';
    entityId: string;
    isRead: boolean;
    createdAt: string;
}
export declare class NotificationsService {
    private readonly logger;
    private deviceTokens;
    private notifications;
    registerDeviceToken(userId: string, token: string): {
        success: boolean;
    };
    sendPushNotification(userId: string, notification: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): Promise<NotificationItem>;
    getUserNotifications(userId: string): NotificationItem[];
    markAsRead(notificationId: string): boolean;
}
