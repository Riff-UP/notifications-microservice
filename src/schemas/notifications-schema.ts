import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NotificationDocument = HydratedDocument<Notification>

export enum NotificationType {
    EVENT_REMINDER = 'EVENT_REMINDER',
    EVENT_UPDATE = 'EVENT_UPDATE',
    EVENT_CANCELLED = 'EVENT_CANCELLED',
    NEW_EVENT = 'NEW_EVENT'
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {

    @Prop({ required: true, type: String })
    userIdReceiver!: string;

    @Prop({ required: true, enum: NotificationType, type: String })
    type!: NotificationType;

    @Prop({ required: true, type: String })
    message!: string;

    @Prop({ default: Date.now })
    createdAt!: Date;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification)