import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyTicketDto {
  @ApiProperty({
    description: 'Reply message',
    example: 'Thank you for contacting support. We will look into this issue.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message: string;
}

