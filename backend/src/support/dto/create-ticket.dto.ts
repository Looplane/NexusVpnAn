import { IsString, IsNotEmpty, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    example: 'Unable to connect to VPN',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Ticket message',
    example: 'I am unable to connect to the VPN server. Please help.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiProperty({
    description: 'Ticket priority',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @IsEnum(['low', 'medium', 'high'])
  @IsNotEmpty()
  priority: 'low' | 'medium' | 'high';
}

