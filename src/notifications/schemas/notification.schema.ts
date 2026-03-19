import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Notification {
  @Prop({ required: true })
  userIdReceiver!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  message!: string;

  @Prop()
  artistId?: string;

  @Prop()
  artistName?: string;

  @Prop()
  artistSlug?: string;

  @Prop()
  artistAvatar?: string;

  @Prop()
  postId?: string;

  @Prop()
  postUrl?: string;

  @Prop()
  deepLink?: string;

  @Prop()
  eventId?: string;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
