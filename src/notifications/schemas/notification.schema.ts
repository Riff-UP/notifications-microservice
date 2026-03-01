import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Notification {
  @Prop({ required: true })
  userIdReceiver!: string;

  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  message!: string;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);
