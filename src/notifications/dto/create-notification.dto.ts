import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { NotificationTypeList } from "../enum/notification.enum";

export class CreateNotificationDto {

  @IsString()
  @IsNotEmpty()
  userIdReceiver!: string;

  @IsEnum(NotificationTypeList, {
    message: `type must be one of: ${NotificationTypeList}`
  })
  type!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
