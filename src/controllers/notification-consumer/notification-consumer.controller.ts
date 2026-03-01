import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ResetPasswordService } from 'src/services/password-reset/reset-password.service';
import { EcstService } from 'src/services/ecst/ecst.service';

@Controller('notification-consumer')
export class NotificationConsumerController {
  constructor(
    private readonly resetPasswordService: ResetPasswordService,
    private readonly ecstService: EcstService,
  ) { }

  // ─── Password Reset (existente) ──────────────────────────────────

  @EventPattern('send.resetPassword')
  async handleResetPassword(@Payload() data: any) {
    console.log('Evento recibido — send.resetPassword:', data);
    await this.resetPasswordService.sendPassWordResetEmail(data);
  }

  // ─── ECST Fase 1: Réplica de followers ───────────────────────────

  @EventPattern('follow.created')
  async handleFollowCreated(
    @Payload()
    data: {
      follower_id: string;
      follower_email: string;
      follower_name: string;
      followed_id: string;
    },
  ) {
    console.log('Evento recibido — follow.created:', data);
    await this.ecstService.handleFollowCreated(data);
  }

  @EventPattern('follow.removed')
  async handleFollowRemoved(
    @Payload() data: { follower_id: string; followed_id: string },
  ) {
    console.log('Evento recibido — follow.removed:', data);
    await this.ecstService.handleFollowRemoved(data);
  }

  // ─── ECST Fase 2→3: Eventos de contenido ─────────────────────────

  @EventPattern('post.created')
  async handlePostCreated(
    @Payload()
    data: {
      type: string;
      message: string;
      userId: string;
      postId: string;
    },
  ) {
    console.log('Evento recibido — post.created:', data);
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.created')
  async handleEventCreated(
    @Payload()
    data: {
      type: string;
      message: string;
      userId: string;
      eventId: string;
    },
  ) {
    console.log('Evento recibido — event.created:', data);
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.updated')
  async handleEventUpdated(
    @Payload()
    data: {
      type: string;
      message: string;
      userId: string;
      eventId: string;
    },
  ) {
    console.log('Evento recibido — event.updated:', data);
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.cancelled')
  async handleEventCancelled(
    @Payload()
    data: {
      type: string;
      message: string;
      userId: string;
      eventId: string;
    },
  ) {
    console.log('Evento recibido — event.cancelled:', data);
    await this.ecstService.handleContentEvent(data);
  }
}
