import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { resetPassword } from 'src/services/resetPassword.service';

@Controller('notification-consumer')
export class NotificationConsumerController {
  constructor(
    @Inject(resetPassword)
    private readonly resetPssw: resetPassword,
  ) {}

  @EventPattern('send.resetPassword')
  async handleFollowEvent(@Payload() data: any) {
    console.log('Evento recibido en consumer:', data);
    await this.resetPssw.sendPassWordResetEmail(data);
  }
}
