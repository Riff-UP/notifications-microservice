import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('send.resetPassword')
  async handlePasswordReset(@Payload() data: {
    mail: string
    userId: string
    userName: string
    token: string
  }){
    return await this.notificationsService.sendPassWordResetEmail(data)
  }


  @MessagePattern('createNotification')
  create(@Payload() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @MessagePattern('findAllNotifications')
  findAll() {
    return this.notificationsService.findAll();
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
