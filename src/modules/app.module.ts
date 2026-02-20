import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationConsumerController } from 'src/controllers/notification-consumer/notification-consumer.controller';
import { resetPassword } from 'src/services/resetPassword.service';
import { MailService } from 'src/services/resend/mail.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [NotificationConsumerController],
  providers: [resetPassword, MailService],
})
export class AppModule {}
