/**
 * Generate Config DTO
 * 
 * Data Transfer Object for WireGuard configuration generation.
 * Validates input parameters for creating VPN connection configurations.
 * 
 * Validation Rules:
 * - locationId: Required, must be a valid UUID
 * - dns: Optional, must be a valid IPv4 address if provided
 * - mtu: Optional, must be between 1280-1500 bytes if provided
 * 
 * @fix Added @IsNotEmpty() to ensure locationId is always provided
 * @fix Added @IsUUID() to validate locationId format
 */
import { IsString, IsOptional, IsIP, IsNumber, Min, Max, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateConfigDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  locationId: string;

  @IsOptional()
  @IsIP(4)
  dns?: string;

  @IsOptional()
  @IsNumber()
  @Min(1280)
  @Max(1500)
  mtu?: number;
}