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
  postId?: string;

  @IsString()
  @IsOptional()
  eventId?: string;
}
