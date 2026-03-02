import { IsOptional, IsString } from 'class-validator';

export class TokenGeneratedEventDto {
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
    // arbitrary metadata
    meta?: Record<string, any>;
}
