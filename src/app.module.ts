import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from './notifications/notifications.module';
import { envs } from './config';
import { PublisherService } from './common/publisher.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(envs.mongoUri),
    NotificationsModule,
  ],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class AppModule { }
