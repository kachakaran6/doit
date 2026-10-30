import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private deviceTokens: Map<string, Set<string>> = new Map(); // userId -> Set<fcmToken>
  private notifications: NotificationItem[] = [];

  registerDeviceToken(userId: string, token: string) {
    if (!this.deviceTokens.has(userId)) {
      this.deviceTokens.set(userId, new Set());
    }
    this.deviceTokens.get(userId)!.add(token);
    this.logger.log(`Registered device token for user ${userId}`);
    return { success: true };
  }

  async sendPushNotification(
    userId: string,
    notification: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>
  ): Promise<NotificationItem> {
    const item: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(item);
    this.logger.log(`[FCM Mock Transport] Sent push to user ${userId}: ${item.title}`);
    return item;
  }

  getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  markAsRead(notificationId: string): boolean {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      return true;
    }
    return false;
  }
}
