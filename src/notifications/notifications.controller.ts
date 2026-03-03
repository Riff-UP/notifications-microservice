import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsCrudService } from '../services/notifications/notifications-crud.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsCrudService,
  ) {}

  @MessagePattern('createNotification')
  create(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern('findAllNotifications')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.notificationsService.findAll(paginationDto);
  }

  @MessagePattern('findNotificationsByUser')
  findByUser(
    @Payload() data: { userIdReceiver: string; pagination: PaginationDto },
  ) {
    return this.notificationsService.findByUser(
      data.userIdReceiver,
      data.pagination ?? {},
    );
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
