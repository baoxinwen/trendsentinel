import { Platform, HotSearchItem } from "../types";

// Mapping from our Platform enum to UApiPro 'type' parameter
const PLATFORM_API_MAP: Record<Platform, string> = {
  // Video/Community
  [Platform.Bilibili]: 'bilibili',
  [Platform.Acfun]: 'acfun',
  [Platform.Weibo]: 'weibo',
  [Platform.Zhihu]: 'zhihu',
  [Platform.ZhihuDaily]: 'zhihu-daily',
  [Platform.Douyin]: 'douyin',
  [Platform.Kuaishou]: 'kuaishou',
  [Platform.DoubanMovie]: 'douban-movie',
  [Platform.DoubanGroup]: 'douban-group',
  [Platform.Tieba]: 'tieba',
  [Platform.Hupu]: 'hupu',
  [Platform.Ngabbs]: 'ngabbs',
  [Platform.V2ex]: 'v2ex',
  [Platform._52pojie]: '52pojie',
  [Platform.Hostloc]: 'hostloc',
  [Platform.Coolapk]: 'coolapk',

  // News/Info
  [Platform.Baidu]: 'baidu',
  [Platform.ThePaper]: 'thepaper',
  [Platform.Toutiao]: 'toutiao',
  [Platform.QqNews]: 'qq-news',
  [Platform.Sina]: 'sina',
  [Platform.SinaNews]: 'sina-news',
  [Platform.NeteaseNews]: 'netease-news',
  [Platform.Huxiu]: 'huxiu',
  [Platform.Ifanr]: 'ifanr',

  // Tech/IT
  [Platform.Sspai]: 'sspai',
  [Platform.ITHome]: 'ithome',
  [Platform.ITHomeXijiayi]: 'ithome-xijiayi',
  [Platform.Juejin]: 'juejin',
  [Platform.Jianshu]: 'jianshu',
  [Platform.Guokr]: 'guokr',
  [Platform._36Kr]: '36kr',
  [Platform._51Cto]: '51cto',
  [Platform.Csdn]: 'csdn',
  [Platform.Nodeseek]: 'nodeseek',
  [Platform.HelloGithub]: 'hellogithub',

  // Game
  [Platform.Lol]: 'lol',
  [Platform.Genshin]: 'genshin',
  [Platform.Honkai]: 'honkai',
  [Platform.Starrail]: 'starrail',

  // Other
  [Platform.Weread]: 'weread',
  [Platform.WeatherAlarm]: 'weatheralarm',
  [Platform.Earthquake]: 'earthquake',
  [Platform.History]: 'history',
};

// Cache to respect API etiquette and improve performance
const cache: Record<string, { data: HotSearchItem[], timestamp: number }> = {};
const CACHE_DURATION = 60 * 1000; // 1 minute
const MAX_CACHE_SIZE = 50; // Limit cache size to prevent memory bloat

// Clean up expired cache entries
const cleanupExpiredCache = () => {
  const now = Date.now();
  const cacheKeys = Object.keys(cache);

  // Remove expired entries
  cacheKeys.forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
    }
  });

  // If cache is still too large, remove oldest entries
  const remainingKeys = Object.keys(cache);
  if (remainingKeys.length > MAX_CACHE_SIZE) {
    remainingKeys
      .sort((a, b) => cache[a].timestamp - cache[b].timestamp)
      .slice(0, remainingKeys.length - MAX_CACHE_SIZE)
      .forEach(key => delete cache[key]);
  }
};

// Run cleanup periodically (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}

// Helper to parse various "hot" value formats into a number
const parseScore = (val: string | number | undefined): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  let str = String(val).trim();
  let multiplier = 1;

  // Handle various Chinese units
  if (str.includes('亿')) {
      multiplier = 100000000;
      str = str.replace('亿', '');
  } else if (str.includes('千万')) {
      multiplier = 10000000;
      str = str.replace('千万', '');
  } else if (str.includes('kw')) {
      multiplier = 10000000;
      str = str.replace(/kw/gi, '');
  } else if (str.includes('万') || str.includes('w')) {
      multiplier = 10000;
      str = str.replace(/万|w/gi, '');
  }

  // Remove non-numeric chars except dots (e.g., "523.1" -> 523.1)
  const numericPart = str.replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericPart);

  return isNaN(parsed) ? 0 : Math.floor(parsed * multiplier);
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPlatformHotSearches = async (platform: Platform, forceRefresh: boolean = false, retryCount: number = 0): Promise<HotSearchItem[]> => {
  // Clean up expired cache entries before fetching
  cleanupExpiredCache();

  // Check cache first (unless forceRefresh is true)
  const cached = cache[platform];
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  const apiType = PLATFORM_API_MAP[platform];
  if (!apiType) {
    console.warn(`No API mapping found for platform: ${platform}`);
    return [];
  }

  const url = `https://uapis.cn/api/v1/misc/hotboard?type=${apiType}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Handle Rate Limiting (429)
    if (response.status === 429) {
        if (retryCount < 3) {
            const delay = (retryCount + 1) * 1500 + Math.random() * 500; // Backoff: ~1.5s, ~3s, ~4.5s
            console.warn(`[429] Rate limit for ${platform}. Retrying in ${Math.floor(delay)}ms...`);
            await wait(delay);
            return fetchPlatformHotSearches(platform, forceRefresh, retryCount + 1);
        } else {
            throw new Error(`API Error: 429 Too Many Requests (Max Retries Exceeded)`);
        }
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    
    let list: any[] = [];
    
    if (json && json.data && Array.isArray(json.data.list)) {
        list = json.data.list;
    } else if (json && Array.isArray(json.list)) {
        list = json.list;
    } else if (json && Array.isArray(json.data)) {
        list = json.data; 
    } else {
         // Some APIs like history might have different structure, fail silently for now
         // console.warn(`Unexpected JSON structure for ${platform}`, json);
         return [];
    }

    const mappedItems: HotSearchItem[] = list.map((item: any, index: number) => ({
      id: `${platform}-${Date.now()}-${index}`,
      rank: index + 1,
      // UApi common fields: title, desc, pic, hot, url, mobileUrl
      title: item.title || '未知标题',
      score: parseScore(item.hot || item.heat || item.score || item.value),
      platform: platform,
      url: item.url || item.link || item.mobileUrl || '#',
      timestamp: Date.now(),
      category: item.category || '热点'
    }));

    // Update Cache
    cache[platform] = { data: mappedItems, timestamp: Date.now() };
    return mappedItems;

  } catch (error: any) {
    if (error.name === 'AbortError') {
        console.error(`Fetch timeout for ${platform}`);
    } else {
        console.error(`Failed to fetch from UApi for ${platform}:`, error);
    }
    return [];
  }
};