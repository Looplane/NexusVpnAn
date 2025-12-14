import { IsString, IsOptional, IsIP, IsNumber, Min, Max } from 'class-validator';

export class GenerateConfigDto {
  @IsString()
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