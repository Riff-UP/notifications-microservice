import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContentEventDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

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
  postUrl?: string;

  @IsString()
  @IsOptional()
  deepLink?: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}
