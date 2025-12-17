/**
 * Create User DTO
 * 
 * Data Transfer Object for user registration.
 * Validates input data before creating a new user account.
 * 
 * Validation Rules:
 * - email: Must be a valid email format
 * - password: Minimum 6 characters
 * - fullName: Required, must be a string
 * - referralCode: Optional, must be a string if provided
 * 
 * @fix Added @IsString() validation to fullName for better type safety
 */
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}