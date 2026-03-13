import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  connect,
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';
import { NotificationConsumerController } from '../controllers/notification-consumer/notification-consumer.controller';
import { ResetPasswordEventDto } from '../notifications/dto/reset-password-event.dto';
import { FollowCreatedEventDto } from '../notifications/dto/follow-created-event.dto';
import { FollowRemovedEventDto } from '../notifications/dto/follow-removed-event.dto';
import { ContentEventDto } from '../notifications/dto/content-event.dto';
import { TokenGeneratedEventDto } from '../notifications/dto/token-generated-event.dto';
import { envs } from '../config';

interface RmqEnvelope {
  pattern: string;
  data: unknown;
}

@Injectable()
export class RabbitConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitConsumerService.name);
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  private readonly EXCHANGE = envs.rabbit_exchange;
  private readonly QUEUE = envs.rabbit_queue;
  private readonly BINDING_KEY = envs.rabbit_binding_key;

  constructor(
    private readonly consumerController: NotificationConsumerController,
  ) {}

  onModuleInit() {
    const RABBIT_URL = process.env.RABBIT_URL ?? 'amqp://localhost:5672';
    this.logger.log(`Conectando a RabbitMQ: ${RABBIT_URL}`);

    this.connection = connect([RABBIT_URL]);
    this.connection.on('connect', () => {
      this.logger.log('Conexion RabbitMQ establecida');
    });
    this.connection.on('disconnect', ({ err }) => {
      this.logger.error(
        `Conexion RabbitMQ cerrada: ${err?.message ?? 'sin detalle'}`,
      );
    });

    this.channel = this.connection.createChannel({
      json: false,
      setup: (ch: Channel) => this.setupChannel(ch),
    });

    this.channel.on('connect', () => {
      this.logger.log('Canal RabbitMQ conectado');
    });
    this.channel.on('error', (err) => {
      this.logger.error(`Error en canal RabbitMQ: ${err.message}`);
    });

    this.logger.log(
      `RabbitMQ consumer inicializando -> exchange: ${this.EXCHANGE}, queue: ${this.QUEUE}, binding: ${this.BINDING_KEY}`,
    );
  }

  private async setupChannel(channel: Channel): Promise<void> {
    await channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(this.QUEUE, { durable: true });
    await channel.bindQueue(this.QUEUE, this.EXCHANGE, this.BINDING_KEY);
    this.logger.log(
      `RabbitMQ consumer listo -> exchange: ${this.EXCHANGE}, queue: ${this.QUEUE}, binding: ${this.BINDING_KEY}`,
    );

    await channel.consume(this.QUEUE, (msg) => void this.handleMessage(channel, msg));
  }

  private async handleMessage(
    channel: Channel,
    msg: ConsumeMessage | null,
  ): Promise<void> {
    if (!msg) return;

    try {
      const raw = JSON.parse(msg.content.toString()) as RmqEnvelope | Record<string, unknown>;
      const pattern = (raw as RmqEnvelope).pattern ?? null;
      const data = (raw as RmqEnvelope).data ?? raw;

      this.logger.debug(`Mensaje recibido — pattern: ${pattern}`);
      await this.dispatch(pattern, data);
      channel.ack(msg);
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.error(
        `Error procesando mensaje: ${error.message}`,
        error.stack,
      );
      channel.nack(msg, false, false);
    }
  }

  private async dispatch(pattern: string | null, data: unknown): Promise<void> {
    switch (pattern) {
      case 'send.resetPassword':
        await this.consumerController.handleResetPassword(
          data as ResetPasswordEventDto,
        );
        break;
      case 'follow.created':
        await this.consumerController.handleFollowCreated(
          data as FollowCreatedEventDto,
        );
        break;
      case 'follow.removed':
        await this.consumerController.handleFollowRemoved(
          data as FollowRemovedEventDto,
        );
        break;
      case 'post.created':
        await this.consumerController.handlePostCreated(
          data as ContentEventDto,
        );
        break;
      case 'event.created':
        await this.consumerController.handleEventCreated(
          data as ContentEventDto,
        );
        break;
      case 'event.updated':
        await this.consumerController.handleEventUpdated(
          data as ContentEventDto,
        );
        break;
      case 'event.cancelled':
        await this.consumerController.handleEventCancelled(
          data as ContentEventDto,
        );
        break;
      case 'auth.tokenGenerated':
        this.consumerController.handleAuthTokenGenerated(
          data as TokenGeneratedEventDto,
        );
        break;
      default:
        this.logger.warn(
          `Pattern desconocido o sin envelope: "${pattern}" — ignorando`,
        );
    }
  }

  async onModuleDestroy() {
    await this.channel.close().catch(() => undefined);
    await this.connection.close().catch(() => undefined);
  }
}
