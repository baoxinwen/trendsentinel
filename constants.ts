import { Platform, HotSearchItem } from './types';

// 平台分类
export const PLATFORM_CATEGORIES = {
  '视频/社区': [
    Platform.Bilibili, Platform.Acfun, Platform.Weibo, Platform.Zhihu, Platform.ZhihuDaily,
    Platform.Douyin, Platform.Kuaishou, Platform.DoubanMovie, Platform.DoubanGroup,
    Platform.Tieba, Platform.Hupu, Platform.Ngabbs, Platform.V2ex, Platform._52pojie,
    Platform.Hostloc, Platform.Coolapk
  ],
  '新闻/资讯': [
    Platform.Baidu, Platform.ThePaper, Platform.Toutiao, Platform.QqNews, Platform.Sina,
    Platform.SinaNews, Platform.NeteaseNews, Platform.Huxiu, Platform.Ifanr
  ],
  '技术/IT': [
    Platform.Sspai, Platform.ITHome, Platform.ITHomeXijiayi, Platform.Juejin, Platform.Jianshu,
    Platform.Guokr, Platform._36Kr, Platform._51Cto, Platform.Csdn, Platform.Nodeseek,
    Platform.HelloGithub
  ],
  '游戏': [
    Platform.Lol, Platform.Genshin, Platform.Honkai, Platform.Starrail
  ],
  '其他': [
    Platform.Weread, Platform.WeatherAlarm, Platform.Earthquake, Platform.History
  ]
};

// 平台显示配置（标签、颜色、图标）
export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  // 视频/社区
  [Platform.Bilibili]: { label: 'Bilibili', color: 'bg-pink-400', icon: '📺' },
  [Platform.Acfun]: { label: 'AcFun', color: 'bg-red-500', icon: '🅰️' },
  [Platform.Weibo]: { label: '微博', color: 'bg-red-500', icon: '🔥' },
  [Platform.Zhihu]: { label: '知乎', color: 'bg-blue-500', icon: '🧠' },
  [Platform.ZhihuDaily]: { label: '知乎日报', color: 'bg-blue-400', icon: '📅' },
  [Platform.Douyin]: { label: '抖音', color: 'bg-black', icon: '🎵' },
  [Platform.Kuaishou]: { label: '快手', color: 'bg-orange-500', icon: '📹' },
  [Platform.DoubanMovie]: { label: '豆瓣电影', color: 'bg-green-600', icon: '🎬' },
  [Platform.DoubanGroup]: { label: '豆瓣小组', color: 'bg-green-500', icon: '👥' },
  [Platform.Tieba]: { label: '贴吧', color: 'bg-blue-600', icon: '💬' },
  [Platform.Hupu]: { label: '虎扑', color: 'bg-red-700', icon: '🏀' },
  [Platform.Ngabbs]: { label: 'NGA', color: 'bg-amber-700', icon: '⚔️' },
  [Platform.V2ex]: { label: 'V2EX', color: 'bg-gray-700', icon: '💻' },
  [Platform._52pojie]: { label: '吾爱破解', color: 'bg-purple-600', icon: '🔓' },
  [Platform.Hostloc]: { label: 'Hostloc', color: 'bg-indigo-600', icon: '🌐' },
  [Platform.Coolapk]: { label: '酷安', color: 'bg-green-500', icon: '📱' },

  // 新闻/资讯
  [Platform.Baidu]: { label: '百度', color: 'bg-blue-600', icon: '🐾' },
  [Platform.ThePaper]: { label: '澎湃', color: 'bg-cyan-600', icon: '🗞️' },
  [Platform.Toutiao]: { label: '头条', color: 'bg-red-600', icon: '📰' },
  [Platform.QqNews]: { label: '腾讯新闻', color: 'bg-blue-700', icon: '🐧' },
  [Platform.Sina]: { label: '新浪热搜', color: 'bg-yellow-500', icon: '👁️' },
  [Platform.SinaNews]: { label: '新浪新闻', color: 'bg-yellow-600', icon: '📰' },
  [Platform.NeteaseNews]: { label: '网易新闻', color: 'bg-red-500', icon: '📧' },
  [Platform.Huxiu]: { label: '虎嗅', color: 'bg-gray-800', icon: '🐯' },
  [Platform.Ifanr]: { label: '爱范儿', color: 'bg-red-400', icon: '❤️' },

  // 技术/IT
  [Platform.Sspai]: { label: '少数派', color: 'bg-red-500', icon: '🥧' },
  [Platform.ITHome]: { label: 'IT之家', color: 'bg-red-700', icon: '🏠' },
  [Platform.ITHomeXijiayi]: { label: 'IT之家喜加一', color: 'bg-red-600', icon: '🎁' },
  [Platform.Juejin]: { label: '掘金', color: 'bg-blue-500', icon: '💎' },
  [Platform.Jianshu]: { label: '简书', color: 'bg-red-400', icon: '📝' },
  [Platform.Guokr]: { label: '果壳', color: 'bg-green-600', icon: '🐚' },
  [Platform._36Kr]: { label: '36氪', color: 'bg-blue-400', icon: '💼' },
  [Platform._51Cto]: { label: '51CTO', color: 'bg-blue-800', icon: '👨‍💻' },
  [Platform.Csdn]: { label: 'CSDN', color: 'bg-orange-600', icon: '©️' },
  [Platform.Nodeseek]: { label: 'NodeSeek', color: 'bg-gray-600', icon: '🔍' },
  [Platform.HelloGithub]: { label: 'HelloGitHub', color: 'bg-gray-800', icon: '🐙' },

  // 游戏
  [Platform.Lol]: { label: '英雄联盟', color: 'bg-yellow-600', icon: '🎮' },
  [Platform.Genshin]: { label: '原神', color: 'bg-purple-500', icon: '✨' },
  [Platform.Honkai]: { label: '崩坏3', color: 'bg-blue-400', icon: '🚀' },
  [Platform.Starrail]: { label: '星穹铁道', color: 'bg-indigo-500', icon: '🚂' },

  // 其他
  [Platform.Weread]: { label: '微信读书', color: 'bg-blue-400', icon: '📚' },
  [Platform.WeatherAlarm]: { label: '天气预警', color: 'bg-orange-500', icon: '⛈️' },
  [Platform.Earthquake]: { label: '地震速报', color: 'bg-gray-800', icon: '🌋' },
  [Platform.History]: { label: '历史上的今天', color: 'bg-amber-600', icon: '📜' },
};

export const INITIAL_KEYWORDS: string[] = [];

// 辅助函数：当 API 失败时生成模拟数据
export const generateMockData = (platform: Platform): HotSearchItem[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `${platform}-${Date.now()}-${i}`,
    rank: i + 1,
    title: `模拟数据: ${platform} 热搜 #${i+1}`,
    score: Math.floor(Math.random() * 100000),
    platform: platform,
    url: '#',
    timestamp: Date.now(),
    category: '模拟'
  }));
};
