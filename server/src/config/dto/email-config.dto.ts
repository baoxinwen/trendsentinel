import { IsEmail, IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailConfigDto {
  @ApiProperty({
    description: 'List of recipient email addresses',
    type: [String],
    example: ['user@example.com', 'another@example.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];

  @ApiProperty({
    description: 'Email sending frequency',
    enum: ['hourly', 'daily', 'weekly'],
    example: 'daily',
  })
  @IsIn(['hourly', 'daily', 'weekly'])
  frequency: 'hourly' | 'daily' | 'weekly';

  @ApiProperty({
    description: 'Send time in HH:mm format (for daily frequency)',
    example: '09:00',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Send time must be in HH:mm format',
  })
  sendTime: string;

  @ApiProperty({
    description: 'Whether email subscription is enabled',
    example: true,
  })
  enabled: boolean;
}

export class UpdateEmailConfigDto {
  @ApiPropertyOptional({
    description: 'List of recipient email addresses',
    type: [String],
    example: ['user@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiPropertyOptional({
    description: 'Email sending frequency',
    enum: ['hourly', 'daily', 'weekly'],
    example: 'daily',
  })
  @IsOptional()
  @IsIn(['hourly', 'daily', 'weekly'])
  frequency?: 'hourly' | 'daily' | 'weekly';

  @ApiPropertyOptional({
    description: 'Send time in HH:mm format',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Send time must be in HH:mm format',
  })
  sendTime?: string;

  @ApiPropertyOptional({
    description: 'Whether email subscription is enabled',
    example: true,
  })
  @IsOptional()
  enabled?: boolean;
}
