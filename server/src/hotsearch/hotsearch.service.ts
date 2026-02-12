import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { Platform } from './interfaces/platform.enum';
import { HotSearchItemDto } from './dto/hotsearch-item.dto';
import { parseScore } from './utils/score-parser.util';
import { PLATFORM_API_MAP } from './utils/platform-mapper.util';
import { UApiResponse, UApiHotItem } from './uapi-types';

interface CacheEntry {
  data: HotSearchItemDto[];
  timestamp: number;
}

@Injectable()
export class HotsearchService {
  private readonly logger = new Logger(HotsearchService.name);
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly cacheDuration: number;

  // In-memory cache
  private cache: Record<string, CacheEntry> = {};

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('UAPI_BASE_URL', 'https://uapis.cn/api/v1/misc/hotboard');
    this.timeout = this.configService.get<number>('API_TIMEOUT', 15000);
    this.cacheDuration = this.configService.get<number>('CACHE_DURATION', 60000);
  }

  /**
   * Fetch hot searches for a single platform
   * Ported from frontend geminiService.ts
   */
  async fetchPlatformHotSearches(
    platform: Platform,
    forceRefresh: boolean = false,
    retryCount: number = 0,
  ): Promise<HotSearchItemDto[]> {
    // Check cache first (unless forceRefresh is true)
    const cached = this.cache[platform];
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheDuration) {
      this.logger.debug(`Cache hit for ${platform}`);
      return cached.data;
    }

    const apiType = PLATFORM_API_MAP[platform];
    if (!apiType) {
      this.logger.warn(`No API mapping found for platform: ${platform}`);
      return [];
    }

    const url = `${this.baseUrl}?type=${apiType}`;

    try {
      const response = await axios.get<UApiResponse>(url, {
        timeout: this.timeout,
      });

      // Handle Rate Limiting (429)
      if (response.status === 429) {
        if (retryCount < 3) {
          const delay = (retryCount + 1) * 1500 + Math.random() * 500;
          this.logger.warn(`[429] Rate limit for ${platform}. Retrying in ${Math.floor(delay)}ms...`);
          await this.sleep(delay);
          return this.fetchPlatformHotSearches(platform, forceRefresh, retryCount + 1);
        } else {
          throw new Error(`API Error: 429 Too Many Requests (Max Retries Exceeded)`);
        }
      }

      if (response.status !== 200) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const json = response.data;
      let list: UApiHotItem[] = [];

      if (json && json.data && Array.isArray(json.data.list)) {
        list = json.data.list;
      } else if (json && Array.isArray(json.list)) {
        list = json.list;
      } else if (json && Array.isArray(json.data)) {
        list = json.data;
      } else {
        this.logger.warn(`Unexpected JSON structure for ${platform}`);
        return [];
      }

      const mappedItems: HotSearchItemDto[] = list.map((item: UApiHotItem, index: number) => ({
        id: `${platform}-${Date.now()}-${index}`,
        rank: index + 1,
        title: item.title || '未知标题',
        score: parseScore(item.hot_value || item.hot || item.heat || item.score || item.value),
        platform: platform,
        url: item.url || item.link || item.mobileUrl || '#',
        timestamp: Date.now(),
        category: item.category || '热点',
      }));

      // Update cache
      this.cache[platform] = { data: mappedItems, timestamp: Date.now() };
      return mappedItems;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
          this.logger.error(`Fetch timeout for ${platform}`);
        } else {
          this.logger.error(`Failed to fetch from UApi for ${platform}: ${axiosError.message}`);
        }
      } else {
        this.logger.error(`Failed to fetch from UApi for ${platform}: ${error}`);
      }
      return [];
    }
  }

  /**
   * Fetch hot searches for multiple platforms
   */
  async fetchMultiplePlatforms(
    platforms: Platform[],
    forceRefresh: boolean = false,
  ): Promise<HotSearchItemDto[]> {
    const allResults: HotSearchItemDto[] = [];

    // Process in chunks to avoid overwhelming the API
    const chunkSize = 2;
    for (let i = 0; i < platforms.length; i += chunkSize) {
      const chunk = platforms.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map((platform) => this.fetchPlatformHotSearches(platform, forceRefresh))
      );
      allResults.push(...results.flat());

      // Add delay between chunks
      if (i + chunkSize < platforms.length) {
        await this.sleep(800);
      }
    }

    return allResults;
  }

  /**
   * Fetch all platforms
   */
  async fetchAllPlatforms(forceRefresh: boolean = false): Promise<HotSearchItemDto[]> {
    const allPlatforms = Object.values(Platform);
    return this.fetchMultiplePlatforms(allPlatforms, forceRefresh);
  }

  /**
   * Filter hot search items
   */
  filterItems(items: HotSearchItemDto[], options: {
    minScore?: number;
    keyword?: string;
    platforms?: Platform[];
  }): HotSearchItemDto[] {
    let filtered = [...items];

    // Filter by platforms
    if (options.platforms && options.platforms.length > 0) {
      filtered = filtered.filter(item => options.platforms!.includes(item.platform));
    }

    // Filter by minimum score
    if (options.minScore !== undefined) {
      filtered = filtered.filter(item => item.score >= options.minScore!);
    }

    // Filter by keyword (case-insensitive)
    if (options.keyword) {
      const keywordLower = options.keyword.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(keywordLower)
      );
    }

    return filtered;
  }

  /**
   * Group items by platform
   */
  groupByPlatform(items: HotSearchItemDto[]): Record<Platform, HotSearchItemDto[]> {
    return items.reduce((acc, item) => {
      if (!acc[item.platform]) {
        acc[item.platform] = [];
      }
      acc[item.platform].push(item);
      return acc;
    }, {} as Record<Platform, HotSearchItemDto[]>);
  }

  /**
   * Get all available platforms
   */
  getAllPlatforms(): Platform[] {
    return Object.values(Platform);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
    this.logger.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Record<string, { count: number; age: number }> {
    const stats: Record<string, { count: number; age: number }> = {};
    const now = Date.now();

    for (const [platform, entry] of Object.entries(this.cache)) {
      stats[platform] = {
        count: entry.data.length,
        age: now - entry.timestamp,
      };
    }

    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
