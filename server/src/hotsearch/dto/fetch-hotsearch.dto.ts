import { IsString, IsOptional, IsBoolean, IsInt, Min, ArrayNotEmpty } from 'class-validator';

export class FetchHotSearchDto {
  @IsOptional()
  @IsString()
  platforms?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minScore?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

export class SendTestEmailDto {
  @IsString()
  @ArrayNotEmpty()
  recipients: string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
