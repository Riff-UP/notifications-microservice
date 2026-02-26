import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationConsumerController } from '../controllers/notification-consumer/notification-consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { resetPassword } from '../services/resetPassword.service';
import { MailService } from '../services/resend/mail.service';

@Module({
  controllers: [NotificationsController, NotificationConsumerController],
  providers: [NotificationsService, resetPassword, MailService],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
})
export class NotificationsModule {}
