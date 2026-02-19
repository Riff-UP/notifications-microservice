import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NotificationType } from "src/schemas/notifications-schema";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    userIdReceiver!: string

    @IsEnum(NotificationType)
    @IsOptional()
    type!: NotificationType

    @IsString()
    @IsNotEmpty()
    message!: string
}