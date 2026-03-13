import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Notifications-MS');

  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'warn', 'error', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(envs.port);

  logger.log(`HTTP running on port ${envs.port}`);
  logger.log(`RabbitMQ consumer iniciado via RabbitConsumerService`);
}

void bootstrap();
