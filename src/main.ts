import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { envs } from './config';

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

  //Iniciar Rabbit
  await app.startAllMicroservices();

  //Iniciar HTTP
  await app.listen(envs.port);

  logger.log(`HTTP running on port ${envs.port}`);
  logger.log(`RabbitMQ connected`);
}

bootstrap();
