import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiPropertyOptional({
    description: 'Recipient email addresses (overrides config)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @ApiPropertyOptional({
    description: 'Email subject',
    example: '热搜哨兵 - 热点报告',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated list of platforms to include',
    example: 'Bilibili,Weibo,Zhihu',
  })
  @IsOptional()
  @IsString()
  platforms?: string;

  @ApiPropertyOptional({
    description: 'Minimum score filter',
    example: '10000',
  })
  @IsOptional()
  @IsString()
  minScore?: string;

  @ApiPropertyOptional({
    description: 'Keyword filter',
    example: 'AI',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
