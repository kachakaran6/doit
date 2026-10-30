import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Post('device')
  registerDevice(
    @CurrentUser('sub') userId: string,
    @Body('token') token: string
  ) {
    return this.notificationsService.registerDeviceToken(userId, token);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    const success = this.notificationsService.markAsRead(id);
    return { success };
  }
}
