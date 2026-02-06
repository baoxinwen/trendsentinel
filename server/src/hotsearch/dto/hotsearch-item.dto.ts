import { Platform } from '../interfaces/platform.enum';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HotSearchItemDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Rank position' })
  @IsNumber()
  rank: number;

  @ApiProperty({ description: 'Hot search title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Heat score' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Platform', enum: Platform })
  @IsString()
  platform: Platform;

  @ApiProperty({ description: 'URL link' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsNumber()
  timestamp: number;
}

export class FetchHotSearchDto {
  @ApiProperty({
    description: 'Comma-separated list of platforms to fetch',
    required: false,
    example: 'Bilibili,Weibo,Zhihu',
  })
  @IsOptional()
  @IsString()
  platforms?: string;

  @ApiProperty({
    description: 'Minimum score filter',
    required: false,
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiProperty({
    description: 'Keyword filter',
    required: false,
    example: 'AI',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: 'Force refresh cache',
    required: false,
    default: false,
  })
  @IsOptional()
  forceRefresh?: boolean;
}
