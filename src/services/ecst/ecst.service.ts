import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowRef } from '../../notifications/schemas/follow-ref.schema';
import { Notification } from '../../notifications/schemas/notification.schema';
import { MailService } from '../mail/mail.service';
import { envs } from '../../config';

@Injectable()
export class EcstService {
  private readonly logger = new Logger(EcstService.name);

  private normalizeUrl(urlValue?: string): string | undefined {
    if (!urlValue) return undefined;

    const trimmed = urlValue.trim();
    if (!trimmed) return undefined;

    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    const baseUrl = envs.frontUrl?.trim();
    if (!baseUrl) {
      return trimmed;
    }

    try {
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      return new URL(trimmed, normalizedBase).toString();
    } catch {
      this.logger.warn(`Invalid content URL received: ${trimmed}`);
      return undefined;
    }
  }

  private buildArtistFallbackLink(payload: {
    artistSlug?: string;
    userId: string;
  }): string | undefined {
    const artistPath = payload.artistSlug
      ? `/artist/${payload.artistSlug}`
      : payload.userId
        ? `/artist/${payload.userId}`
        : undefined;

    return this.normalizeUrl(artistPath);
  }

  private buildDisplayMessage(payload: {
    message: string;
    artistName?: string;
  }): string {
    if (!payload.artistName) return payload.message;

    const normalizedMessage = payload.message.toLowerCase();
    const normalizedArtist = payload.artistName.toLowerCase();

    if (normalizedMessage.includes(normalizedArtist)) {
      return payload.message;
    }

    return `${payload.artistName}: ${payload.message}`;
  }

  constructor(
    @InjectModel(FollowRef.name)
    private readonly followRefModel: Model<FollowRef>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly mailService: MailService,
  ) {}

  // ─── Fase 1: Réplica de followers ────────────────────────────────

  async handleFollowCreated(data: {
    follower_id: string;
    follower_email: string;
    follower_name: string;
    followed_id: string;
  }) {
    this.logger.log(
      `follow.created: ${data.follower_id} → ${data.followed_id}`,
    );
    this.logger.debug(`Payload recibido: ${JSON.stringify(data)}`);

    if (!data.follower_id || !data.followed_id) {
      this.logger.error(
        `follow.created con campos faltantes: ${JSON.stringify(data)}`,
      );
      return;
    }

    const result = await this.followRefModel.updateOne(
      { follower_id: data.follower_id, followed_id: data.followed_id },
      {
        $set: {
          follower_id: data.follower_id,
          follower_email: data.follower_email,
          follower_name: data.follower_name,
          followed_id: data.followed_id,
        },
      },
      { upsert: true },
    );

    this.logger.log(
      `FollowRef upsert — matched: ${result.matchedCount}, upserted: ${result.upsertedCount}`,
    );

    const total = await this.followRefModel.countDocuments();
    this.logger.debug(`Total follow_refs en BD: ${total}`);
  }

  async handleFollowRemoved(data: {
    follower_id: string;
    followed_id: string;
  }) {
    this.logger.log(
      `follow.removed: ${data.follower_id} → ${data.followed_id}`,
    );
    this.logger.debug(`Payload recibido: ${JSON.stringify(data)}`);

    if (!data.follower_id || !data.followed_id) {
      this.logger.error(
        `follow.removed con campos faltantes: ${JSON.stringify(data)}`,
      );
      return;
    }

    const result = await this.followRefModel.deleteOne({
      follower_id: data.follower_id,
      followed_id: data.followed_id,
    });

    this.logger.log(
      `FollowRef eliminado — deletedCount: ${result.deletedCount}`,
    );
  }

  // ─── Fase 3: Procesamiento de eventos de contenido ────────────────

  async handleContentEvent(payload: {
    type: string;
    message: string;
    userId: string;
    artistName?: string;
    artistSlug?: string;
    artistAvatar?: string;
    postId?: string;
    postUrl?: string;
    deepLink?: string;
    eventId?: string;
  }) {
    const displayMessage = this.buildDisplayMessage(payload);
    const normalizedPostUrl = this.normalizeUrl(payload.postUrl);
    const normalizedDeepLink = this.normalizeUrl(payload.deepLink);
    const fallbackArtistUrl = this.buildArtistFallbackLink(payload);
    const resolvedContentUrl =
      normalizedPostUrl ?? normalizedDeepLink ?? fallbackArtistUrl;

    this.logger.log(
      `Content event [${payload.type}] from user ${payload.userId}`,
    );

    // 1. Buscar followers del autor en réplica local
    this.logger.debug(
      `Buscando followers con followed_id: "${payload.userId}"`,
    );

    const totalRefs = await this.followRefModel.countDocuments();
    this.logger.debug(`Total registros en follow_refs: ${totalRefs}`);

    const followers = await this.followRefModel.find({
      followed_id: payload.userId,
    });

    if (followers.length === 0) {
      this.logger.warn(
        `No followers found for user ${payload.userId}. Total follow_refs en BD: ${totalRefs}. Verifica que los eventos follow.created se estén publicando correctamente desde Users-MS.`,
      );
      return;
    }

    this.logger.log(
      `Found ${followers.length} followers, processing notifications...`,
    );

    // 2. Por cada follower: crear notificación + enviar email
    const results = await Promise.allSettled(
      followers.map(async (follower) => {
        // a) Insertar notificación en BD
        await this.notificationModel.create({
          userIdReceiver: follower.follower_id,
          type: payload.type,
          message: displayMessage,
          artistId: payload.userId,
          artistName: payload.artistName,
          artistSlug: payload.artistSlug,
          artistAvatar: payload.artistAvatar,
          postId: payload.postId,
          postUrl: normalizedPostUrl,
          deepLink: resolvedContentUrl,
          eventId: payload.eventId,
        });

        // b) Enviar email
        await this.mailService.sendContentNotification({
          to: follower.follower_email,
          followerName: follower.follower_name,
          type: payload.type,
          message: displayMessage,
          artistName: payload.artistName,
          postUrl: normalizedPostUrl,
          deepLink: resolvedContentUrl,
        });
      }),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.warn(
        `${failed.length}/${followers.length} notifications failed`,
      );
      failed.forEach((f) => {
        if (f.status === 'rejected') this.logger.error(f.reason);
      });
    }
  }
}
