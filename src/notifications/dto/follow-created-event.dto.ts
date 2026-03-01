import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FollowCreatedEventDto {
    @IsString()
    @IsNotEmpty()
    follower_id: string;

    @IsEmail()
    @IsNotEmpty()
    follower_email: string;

    @IsString()
    @IsNotEmpty()
    follower_name: string;

    @IsString()
    @IsNotEmpty()
    followed_id: string;
}
