import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsCrudService } from '../services/notifications/notifications-crud.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsCrudService,
  ) { }

  @MessagePattern('createNotification')
  create(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern('findAllNotifications')
  findAll() {
    return this.notificationsService.findAll();
  }

  @MessagePattern('findNotificationsByUser')
  findByUser(@Payload() userIdReceiver: string) {
    return this.notificationsService.findByUser(userIdReceiver);
  }

  @MessagePattern('findOneNotification')
  findOne(@Payload() id: string) {
    return this.notificationsService.findOne(id);
  }

  @MessagePattern('updateNotification')
  update(@Payload() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(
      updateNotificationDto.id,
      updateNotificationDto,
    );
  }

  @MessagePattern('removeNotification')
  remove(@Payload() id: string) {
    return this.notificationsService.remove(id);
  }
}
