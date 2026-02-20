import { Controller, Inject } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { resetPassword } from 'src/services/resetPassword.service';

@Controller('notification-consumer')
export class NotificationConsumerController {
  constructor(
    @Inject(resetPassword)
    private readonly resetPssw: resetPassword,
  ) {}

  @EventPattern('send.resetPassword')
  async handleFollowEvent(data: any) {
    console.log('Evento recibido en consumer:', data);
    await this.resetPssw.sendPassWordResetEmail(data);
  }
}
