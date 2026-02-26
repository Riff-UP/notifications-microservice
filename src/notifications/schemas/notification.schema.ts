import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NotificationType } from "../enum/notification.enum";

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Notification {
    @Prop({ required: true })
    userIdReceiver!: string

    @Prop({ 
        required: true,
        enum: NotificationType,
        type: String
    })
    type!: NotificationType

    @Prop({ required: true })
    message!: string
}
export const NotificationSchema = SchemaFactory.createForClass(Notification)