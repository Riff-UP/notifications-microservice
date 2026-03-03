import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @IsString()
  @IsOptional()
  userId?: string; // Campo enviado por Users-MS (opcional para compatibilidad)
}
