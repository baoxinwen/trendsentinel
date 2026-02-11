import { Platform, HotSearchItem } from "../types";

// 平台枚举到 UApiPro API 'type' 参数的映射
const PLATFORM_API_MAP: Record<Platform, string> = {
  // 视频/社区
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

  // 新闻/资讯
  [Platform.Baidu]: 'baidu',
  [Platform.ThePaper]: 'thepaper',
  [Platform.Toutiao]: 'toutiao',
  [Platform.QqNews]: 'qq-news',
  [Platform.Sina]: 'sina',
  [Platform.SinaNews]: 'sina-news',
  [Platform.NeteaseNews]: 'netease-news',
  [Platform.Huxiu]: 'huxiu',
  [Platform.Ifanr]: 'ifanr',

  // 科技/IT
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

  // 游戏
  [Platform.Lol]: 'lol',
  [Platform.Genshin]: 'genshin',
  [Platform.Honkai]: 'honkai',
  [Platform.Starrail]: 'starrail',

  // 其他
  [Platform.Weread]: 'weread',
  [Platform.WeatherAlarm]: 'weatheralarm',
  [Platform.Earthquake]: 'earthquake',
  [Platform.History]: 'history',
};

// 缓存机制 - 遵守 API 请求规范并提升性能
const cache: Record<string, { data: HotSearchItem[], timestamp: number }> = {};
const CACHE_DURATION = 60 * 1000; // 1 分钟缓存
const MAX_CACHE_SIZE = 50; // 限制缓存大小，防止内存膨胀

// 清理过期缓存条目
const cleanupExpiredCache = () => {
  const now = Date.now();
  const cacheKeys = Object.keys(cache);

  // 移除过期条目
  cacheKeys.forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
    }
  });

  // 如果缓存仍然过大，移除最旧的条目
  const remainingKeys = Object.keys(cache);
  if (remainingKeys.length > MAX_CACHE_SIZE) {
    remainingKeys
      .sort((a, b) => cache[a].timestamp - cache[b].timestamp)
      .slice(0, remainingKeys.length - MAX_CACHE_SIZE)
      .forEach(key => delete cache[key]);
  }
};

// 定期清理缓存（每 5 分钟）
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}

// 解析各种"热度"值格式为数字
const parseScore = (val: string | number | undefined): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;

  let str = String(val).trim();
  let multiplier = 1;

  // 处理各种中文单位
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

  // 移除非数字字符（保留小数点）
  const numericPart = str.replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericPart);

  return isNaN(parsed) ? 0 : Math.floor(parsed * multiplier);
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取平台热搜数据
export const fetchPlatformHotSearches = async (platform: Platform, forceRefresh: boolean = false, retryCount: number = 0): Promise<HotSearchItem[]> => {
  // 获取前清理过期缓存
  cleanupExpiredCache();

  // 优先检查缓存（除非强制刷新）
  const cached = cache[platform];
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  const apiType = PLATFORM_API_MAP[platform];
  if (!apiType) {
    console.warn(`未找到平台 ${platform} 的 API 映射`);
    return [];
  }

  const url = `https://uapis.cn/api/v1/misc/hotboard?type=${apiType}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 秒超时

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    // 处理速率限制 (429)
    if (response.status === 429) {
        if (retryCount < 3) {
            const delay = (retryCount + 1) * 1500 + Math.random() * 500; // 退避策略：约 1.5s、3s、4.5s
            console.warn(`[429] ${platform} 速率限制。${Math.floor(delay)}ms 后重试...`);
            await wait(delay);
            return fetchPlatformHotSearches(platform, forceRefresh, retryCount + 1);
        } else {
            throw new Error(`API 错误：429 请求过多（超过最大重试次数）`);
        }
    }

    if (!response.ok) {
      throw new Error(`API 错误：${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    let list: any[] = [];

    // 处理不同的 API 响应结构
    if (json && json.data && Array.isArray(json.data.list)) {
        list = json.data.list;
    } else if (json && Array.isArray(json.list)) {
        list = json.list;
    } else if (json && Array.isArray(json.data)) {
        list = json.data;
    } else {
         // 某些 API（如历史）可能有不同的结构，暂时静默处理
         return [];
    }

    // 映射 API 数据到标准格式
    const mappedItems: HotSearchItem[] = list.map((item: any, index: number) => ({
      id: `${platform}-${Date.now()}-${index}`,
      rank: index + 1,
      // UApi 通用字段：title, desc, pic, hot, url, mobileUrl
      title: item.title || '未知标题',
      score: parseScore(item.hot_value || item.hot || item.heat || item.score || item.value),
      platform: platform,
      url: item.url || item.link || item.mobileUrl || '#',
      timestamp: Date.now(),
      category: item.category || '热点'
    }));

    // 更新缓存
    cache[platform] = { data: mappedItems, timestamp: Date.now() };
    return mappedItems;

  } catch (error: any) {
    if (error.name === 'AbortError') {
        console.error(`${platform} 获取超时`);
    } else {
        console.error(`从 UApi 获取 ${platform} 失败：`, error);
    }
    return [];
  }
};
