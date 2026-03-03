import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para objeto User anidado (usado por Content-MS)
 */
export class UserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

/**
 * DTO para evento auth.tokenGenerated
 *
 * Soporta dos estructuras:
 *
 * 1. Estructura plana (Auth-MS, Users-MS):
 *    { userId, email, token, meta }
 *
 * 2. Estructura anidada (Content-MS):
 *    { user: { id, email, name }, token }
 */
export class TokenGeneratedEventDto {
  // Estructura plana (Auth-MS, Users-MS)
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  meta?: Record<string, any>;

  // Estructura anidada (Content-MS)
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto;
}
