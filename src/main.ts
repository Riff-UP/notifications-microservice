import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { envs } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Notifications-MS');

  //Crear aplicación HTTP normal
  const app = await NestFactory.create(AppModule);

  //Conectar RabbitMQ como microservicio
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url],
      queue: 'riff_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  //Iniciar Rabbit
  await app.startAllMicroservices();

  //Iniciar HTTP
  await app.listen(envs.port);

  logger.log(`HTTP running on port ${envs.port}`);
  logger.log(`RabbitMQ connected`);
}

bootstrap();
