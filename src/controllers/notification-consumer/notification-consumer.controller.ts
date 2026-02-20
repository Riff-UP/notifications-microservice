import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { any } from 'joi';
import { resetPassword } from 'src/services/resetPassword.service';

@Controller('notification-consumer')
export class NotificationConsumerController {
  constructor(private resetPssw = new resetPassword()) {}

  @EventPattern('send.resetPassword')
  handleFollowEvent(data: any) {
    this.resetPssw.sendPassWordResetEmail(data);
  }
}
