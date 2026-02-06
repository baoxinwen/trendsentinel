import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HotsearchService } from './hotsearch.service';
import { HotSearchItemDto, FetchHotSearchDto } from './dto/hotsearch-item.dto';
import { Platform } from './interfaces/platform.enum';
import { Public } from '../auth/decorators/api-public.decorator';

@ApiTags('hotsearch')
@Controller('hotsearch')
export class HotsearchController {
  constructor(private readonly hotsearchService: HotsearchService) {}

  @Get()
  @Public() // Public endpoint - no auth required
  @ApiOperation({ summary: 'Get hot search data' })
  @ApiResponse({
    status: 200,
    description: 'Hot search data retrieved successfully',
    type: [HotSearchItemDto],
  })
  @ApiQuery({
    name: 'platforms',
    required: false,
    description: 'Comma-separated list of platforms (e.g., Bilibili,Weibo,Zhihu)',
    example: 'Bilibili,Weibo',
  })
  @ApiQuery({
    name: 'minScore',
    required: false,
    description: 'Minimum score filter',
    example: '10000',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Keyword filter (case-insensitive)',
    example: 'AI',
  })
  @ApiQuery({
    name: 'forceRefresh',
    required: false,
    description: 'Force refresh from API (bypass cache)',
    example: 'false',
  })
  async getHotSearch(
    @Query('platforms') platforms?: string,
    @Query('minScore') minScore?: string,
    @Query('keyword') keyword?: string,
    @Query('forceRefresh') forceRefresh?: string,
  ): Promise<HotSearchItemDto[]> {
    let platformList: Platform[] | undefined;

    if (platforms) {
      const platformNames = platforms.split(',').map(p => p.trim());
      platformList = platformNames
        .map(name => name as Platform)
        .filter(p => Object.values(Platform).includes(p));
    }

    const force = forceRefresh === 'true';

    const items = platformList
      ? await this.hotsearchService.fetchMultiplePlatforms(platformList, force)
      : await this.hotsearchService.fetchAllPlatforms(force);

    return this.hotsearchService.filterItems(items, {
      minScore: minScore ? parseInt(minScore, 10) : undefined,
      keyword,
      platforms: platformList,
    });
  }

  @Get('platforms')
  @Public() // Public endpoint
  @ApiOperation({ summary: 'Get all available platforms' })
  @ApiResponse({
    status: 200,
    description: 'List of all platforms',
    type: [String],
  })
  getPlatforms(): string[] {
    return this.hotsearchService.getAllPlatforms();
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics',
  })
  getCacheStats() {
    return this.hotsearchService.getCacheStats();
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Clear cache' })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared',
  })
  clearCache(): { message: string } {
    this.hotsearchService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}
