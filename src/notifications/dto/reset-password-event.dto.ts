import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordEventDto {
    @IsEmail()
    @IsNotEmpty()
    mail: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    token: string;
}
