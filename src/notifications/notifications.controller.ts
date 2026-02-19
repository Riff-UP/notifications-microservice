import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('createNotification')
  create(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern('findAllNotifications')
  findAll(@Payload() userIdReceiver: string) {
    return this.notificationsService.findAll(userIdReceiver);
  }

  @MessagePattern('removeNotification')
  remove(@Payload() id: string) {
    return this.notificationsService.remove(id);
  }
}