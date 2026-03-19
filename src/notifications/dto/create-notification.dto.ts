import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userIdReceiver: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  artistId?: string;

  @IsString()
  @IsOptional()
  artistName?: string;

  @IsString()
  @IsOptional()
  artistSlug?: string;

  @IsString()
  @IsOptional()
  artistAvatar?: string;

  @IsString()
  @IsOptional()
  postId?: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}
