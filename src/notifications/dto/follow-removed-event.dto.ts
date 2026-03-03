import { IsNotEmpty, IsString } from 'class-validator';

export class FollowRemovedEventDto {
  @IsString()
  @IsNotEmpty()
  follower_id: string;

  @IsString()
  @IsNotEmpty()
  followed_id: string;
}
