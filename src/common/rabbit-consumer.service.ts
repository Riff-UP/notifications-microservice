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
import { RpcException } from '@nestjs/microservices';
import { ResetPasswordEventDto } from '../notifications/dto/reset-password-event.dto';
import { FollowCreatedEventDto } from '../notifications/dto/follow-created-event.dto';
import { FollowRemovedEventDto } from '../notifications/dto/follow-removed-event.dto';
import { ContentEventDto } from '../notifications/dto/content-event.dto';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { UpdateNotificationDto } from '../notifications/dto/update-notification.dto';
import { PaginationDto } from '../notifications/dto/pagination.dto';
import { envs } from '../config';
import { ResetPasswordService } from '../services/password-reset/reset-password.service';
import { EcstService } from '../services/ecst/ecst.service';
import { NotificationsCrudService } from '../services/notifications/notifications-crud.service';

interface RmqEnvelope {
  pattern: string;
  data: unknown;
  id?: string;
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
    private readonly resetPasswordService: ResetPasswordService,
    private readonly ecstService: EcstService,
    private readonly notificationsCrudService: NotificationsCrudService,
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

    let raw: RmqEnvelope | Record<string, unknown> | null = null;

    try {
      raw = JSON.parse(msg.content.toString()) as RmqEnvelope | Record<string, unknown>;
      const pattern =
        (raw as RmqEnvelope).pattern ?? msg.fields.routingKey ?? null;
      const data = (raw as RmqEnvelope).data ?? raw;

      this.logger.debug(`Mensaje recibido — pattern: ${pattern}`);
      const response = await this.dispatch(pattern, data);
      await this.replyIfNeeded(channel, msg, raw, response);
      channel.ack(msg);
    } catch (err: unknown) {
      const error = err as Error;
      await this.replyWithErrorIfNeeded(channel, msg, raw, err);
      this.logger.error(
        `Error procesando mensaje: ${error.message}`,
        error.stack,
      );

      // En requests RPC ya se respondió el error al caller; no reencolar.
      if (msg.properties.replyTo) {
        channel.ack(msg);
        return;
      }

      channel.nack(msg, false, false);
    }
  }

  private async dispatch(pattern: string | null, data: unknown): Promise<unknown> {
    switch (pattern) {
      case 'send.resetPassword':
        await this.resetPasswordService.sendPassWordResetEmail(
          data as ResetPasswordEventDto,
        );
        return undefined;
      case 'follow.created':
        await this.ecstService.handleFollowCreated(
          data as FollowCreatedEventDto,
        );
        return undefined;
      case 'follow.removed':
        await this.ecstService.handleFollowRemoved(
          data as FollowRemovedEventDto,
        );
        return undefined;
      case 'post.created':
        await this.ecstService.handleContentEvent(data as ContentEventDto);
        return undefined;
      case 'event.created':
        await this.ecstService.handleContentEvent(data as ContentEventDto);
        return undefined;
      case 'event.updated':
        await this.ecstService.handleContentEvent(data as ContentEventDto);
        return undefined;
      case 'event.cancelled':
        await this.ecstService.handleContentEvent(data as ContentEventDto);
        return undefined;
      case 'auth.tokenGenerated':
        this.logger.log('Evento recibido — auth.tokenGenerated');
        this.logger.debug(JSON.stringify(data));
        return undefined;
      case 'createNotification':
        return this.notificationsCrudService.create(
          data as CreateNotificationDto,
        );
      case 'findAllNotifications':
        return this.notificationsCrudService.findAll((data ?? {}) as PaginationDto);
      case 'findNotificationsByUser': {
        const payload = data as {
          userIdReceiver: string;
          pagination?: PaginationDto;
        };
        return this.notificationsCrudService.findByUser(
          payload.userIdReceiver,
          payload.pagination ?? {},
        );
      }
      case 'findOneNotification':
        return this.notificationsCrudService.findOne(
          typeof data === 'string'
            ? data
            : ((data as { id?: string }).id ?? ''),
        );
      case 'updateNotification': {
        const payload = data as UpdateNotificationDto;
        return this.notificationsCrudService.update(payload.id, payload);
      }
      case 'removeNotification':
        return this.notificationsCrudService.remove(
          typeof data === 'string'
            ? data
            : ((data as { id?: string }).id ?? ''),
        );
      default:
        this.logger.warn(
          `Pattern desconocido o sin envelope: "${pattern}" — ignorando`,
        );
        return undefined;
    }
  }

  private async replyIfNeeded(
    channel: Channel,
    msg: ConsumeMessage,
    raw: RmqEnvelope | Record<string, unknown>,
    response: unknown,
  ): Promise<void> {
    if (!msg.properties.replyTo) return;

    const packetId =
      (raw as RmqEnvelope).id ?? msg.properties.correlationId ?? undefined;

    const replyPacket = {
      id: packetId,
      response,
      isDisposed: true,
    };

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(replyPacket)),
      {
        correlationId: msg.properties.correlationId,
        contentType: 'application/json',
      },
    );
  }

  private async replyWithErrorIfNeeded(
    channel: Channel,
    msg: ConsumeMessage,
    raw: RmqEnvelope | Record<string, unknown> | null,
    err: unknown,
  ): Promise<void> {
    if (!msg.properties.replyTo) return;

    const packetId =
      raw && typeof raw === 'object' && 'id' in raw
        ? (raw as RmqEnvelope).id
        : msg.properties.correlationId ?? undefined;

    const rpcPayload =
      err instanceof RpcException
        ? err.getError()
        : { message: (err as Error).message ?? 'Unhandled error' };

    const replyPacket = {
      id: packetId,
      err: rpcPayload,
      isDisposed: true,
    };

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(replyPacket)),
      {
        correlationId: msg.properties.correlationId,
        contentType: 'application/json',
      },
    );
  }

  async onModuleDestroy() {
    await this.channel.close().catch(() => undefined);
    await this.connection.close().catch(() => undefined);
  }
}
