import { Module } from '@nestjs/common';
import { NotificationsCrudService } from '../services/notifications/notifications-crud.service';
import { EcstService } from '../services/ecst/ecst.service';
import { NotificationsController } from './notifications.controller';
import { NotificationConsumerController } from '../controllers/notification-consumer/notification-consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { FollowRef, FollowRefSchema } from './schemas/follow-ref.schema';
import { ResetPasswordService } from '../services/password-reset/reset-password.service';
import { MailService } from '../services/mail/mail.service';

@Module({
  controllers: [NotificationsController, NotificationConsumerController],
  providers: [
    NotificationsCrudService,
    EcstService,
    ResetPasswordService,
    MailService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: FollowRef.name, schema: FollowRefSchema },
    ]),
  ],
})
export class NotificationsModule {}
