import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FollowRef } from '../../notifications/schemas/follow-ref.schema';
import { Notification } from '../../notifications/schemas/notification.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EcstService {
    private readonly logger = new Logger(EcstService.name);

    constructor(
        @InjectModel(FollowRef.name)
        private readonly followRefModel: Model<FollowRef>,
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
        private readonly mailService: MailService,
    ) { }

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

        await this.followRefModel.updateOne(
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
    }

    async handleFollowRemoved(data: {
        follower_id: string;
        followed_id: string;
    }) {
        this.logger.log(
            `follow.removed: ${data.follower_id} → ${data.followed_id}`,
        );

        await this.followRefModel.deleteOne({
            follower_id: data.follower_id,
            followed_id: data.followed_id,
        });
    }

    // ─── Fase 3: Procesamiento de eventos de contenido ────────────────

    async handleContentEvent(payload: {
        type: string;
        message: string;
        userId: string;
        postId?: string;
        eventId?: string;
    }) {
        this.logger.log(
            `Content event [${payload.type}] from user ${payload.userId}`,
        );

        // 1. Buscar followers del autor en réplica local
        const followers = await this.followRefModel.find({
            followed_id: payload.userId,
        });

        if (followers.length === 0) {
            this.logger.log(
                `No followers found for user ${payload.userId}, skipping.`,
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
                    message: payload.message,
                });

                // b) Enviar email
                await this.mailService.sendContentNotification({
                    to: follower.follower_email,
                    followerName: follower.follower_name,
                    type: payload.type,
                    message: payload.message,
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
