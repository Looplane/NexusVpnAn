import { IsEmail, IsOptional, MinLength, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
}