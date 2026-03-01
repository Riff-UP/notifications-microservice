import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ResetPasswordService } from 'src/services/password-reset/reset-password.service';
import { EcstService } from 'src/services/ecst/ecst.service';
import { ResetPasswordEventDto } from 'src/notifications/dto/reset-password-event.dto';
import { FollowCreatedEventDto } from 'src/notifications/dto/follow-created-event.dto';
import { FollowRemovedEventDto } from 'src/notifications/dto/follow-removed-event.dto';
import { ContentEventDto } from 'src/notifications/dto/content-event.dto';

@Controller('notification-consumer')
export class NotificationConsumerController {
  private readonly logger = new Logger(NotificationConsumerController.name);

  constructor(
    private readonly resetPasswordService: ResetPasswordService,
    private readonly ecstService: EcstService,
  ) { }

  // ─── Password Reset ──────────────────────────────────────────────

  @EventPattern('send.resetPassword')
  async handleResetPassword(@Payload() data: ResetPasswordEventDto) {
    this.logger.log('Evento recibido — send.resetPassword');
    await this.resetPasswordService.sendPassWordResetEmail(data);
  }

  // ─── ECST Fase 1: Réplica de followers ───────────────────────────

  @EventPattern('follow.created')
  async handleFollowCreated(@Payload() data: FollowCreatedEventDto) {
    this.logger.log('Evento recibido — follow.created');
    await this.ecstService.handleFollowCreated(data);
  }

  @EventPattern('follow.removed')
  async handleFollowRemoved(@Payload() data: FollowRemovedEventDto) {
    this.logger.log('Evento recibido — follow.removed');
    await this.ecstService.handleFollowRemoved(data);
  }

  // ─── ECST Fase 2→3: Eventos de contenido ─────────────────────────

  @EventPattern('post.created')
  async handlePostCreated(@Payload() data: ContentEventDto) {
    this.logger.log('Evento recibido — post.created');
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.created')
  async handleEventCreated(@Payload() data: ContentEventDto) {
    this.logger.log('Evento recibido — event.created');
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.updated')
  async handleEventUpdated(@Payload() data: ContentEventDto) {
    this.logger.log('Evento recibido — event.updated');
    await this.ecstService.handleContentEvent(data);
  }

  @EventPattern('event.cancelled')
  async handleEventCancelled(@Payload() data: ContentEventDto) {
    this.logger.log('Evento recibido — event.cancelled');
    await this.ecstService.handleContentEvent(data);
  }
}
