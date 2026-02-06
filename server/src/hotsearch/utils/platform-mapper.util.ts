import { Platform } from '../interfaces/platform.enum';

/**
 * Mapping from Platform enum to UApiPro 'type' parameter
 * Ported from frontend geminiService.ts
 */
export const PLATFORM_API_MAP: Record<Platform, string> = {
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

/**
 * Platform categories and display configuration
 * Ported from frontend constants.ts
 */
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

export const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  // Video/Community
  [Platform.Bilibili]: { label: 'Bilibili', color: '#f472b6', icon: '📺' },
  [Platform.Acfun]: { label: 'AcFun', color: '#ef4444', icon: '🅰️' },
  [Platform.Weibo]: { label: '微博', color: '#ef4444', icon: '🔥' },
  [Platform.Zhihu]: { label: '知乎', color: '#3b82f6', icon: '🧠' },
  [Platform.ZhihuDaily]: { label: '知乎日报', color: '#60a5fa', icon: '📅' },
  [Platform.Douyin]: { label: '抖音', color: '#000000', icon: '🎵' },
  [Platform.Kuaishou]: { label: '快手', color: '#f97316', icon: '📹' },
  [Platform.DoubanMovie]: { label: '豆瓣电影', color: '#16a34a', icon: '🎬' },
  [Platform.DoubanGroup]: { label: '豆瓣小组', color: '#22c55e', icon: '👥' },
  [Platform.Tieba]: { label: '贴吧', color: '#2563eb', icon: '💬' },
  [Platform.Hupu]: { label: '虎扑', color: '#b91c1c', icon: '🏀' },
  [Platform.Ngabbs]: { label: 'NGA', color: '#b45309', icon: '⚔️' },
  [Platform.V2ex]: { label: 'V2EX', color: '#374151', icon: '💻' },
  [Platform._52pojie]: { label: '吾爱破解', color: '#9333ea', icon: '🔓' },
  [Platform.Hostloc]: { label: 'Hostloc', color: '#4f46e5', icon: '🌐' },
  [Platform.Coolapk]: { label: '酷安', color: '#22c55e', icon: '📱' },

  // News/Info
  [Platform.Baidu]: { label: '百度', color: '#2563eb', icon: '🐾' },
  [Platform.ThePaper]: { label: '澎湃', color: '#0891b2', icon: '🗞️' },
  [Platform.Toutiao]: { label: '头条', color: '#dc2626', icon: '📰' },
  [Platform.QqNews]: { label: '腾讯新闻', color: '#1d4ed8', icon: '🐧' },
  [Platform.Sina]: { label: '新浪热搜', color: '#eab308', icon: '👁️' },
  [Platform.SinaNews]: { label: '新浪新闻', color: '#ca8a04', icon: '📰' },
  [Platform.NeteaseNews]: { label: '网易新闻', color: '#ef4444', icon: '📧' },
  [Platform.Huxiu]: { label: '虎嗅', color: '#1f2937', icon: '🐯' },
  [Platform.Ifanr]: { label: '爱范儿', color: '#f87171', icon: '❤️' },

  // Tech/IT
  [Platform.Sspai]: { label: '少数派', color: '#ef4444', icon: '🥧' },
  [Platform.ITHome]: { label: 'IT之家', color: '#b91c1c', icon: '🏠' },
  [Platform.ITHomeXijiayi]: { label: 'IT之家喜加一', color: '#dc2626', icon: '🎁' },
  [Platform.Juejin]: { label: '掘金', color: '#3b82f6', icon: '💎' },
  [Platform.Jianshu]: { label: '简书', color: '#f87171', icon: '📝' },
  [Platform.Guokr]: { label: '果壳', color: '#16a34a', icon: '🐚' },
  [Platform._36Kr]: { label: '36氪', color: '#60a5fa', icon: '💼' },
  [Platform._51Cto]: { label: '51CTO', color: '#1e40af', icon: '👨‍💻' },
  [Platform.Csdn]: { label: 'CSDN', color: '#ea580c', icon: '©️' },
  [Platform.Nodeseek]: { label: 'NodeSeek', color: '#4b5563', icon: '🔍' },
  [Platform.HelloGithub]: { label: 'HelloGitHub', color: '#1f2937', icon: '🐙' },

  // Game
  [Platform.Lol]: { label: '英雄联盟', color: '#ca8a04', icon: '🎮' },
  [Platform.Genshin]: { label: '原神', color: '#a855f7', icon: '✨' },
  [Platform.Honkai]: { label: '崩坏3', color: '#60a5fa', icon: '🚀' },
  [Platform.Starrail]: { label: '星穹铁道', color: '#6366f1', icon: '🚂' },

  // Other
  [Platform.Weread]: { label: '微信读书', color: '#60a5fa', icon: '📚' },
  [Platform.WeatherAlarm]: { label: '天气预警', color: '#f97316', icon: '⛈️' },
  [Platform.Earthquake]: { label: '地震速报', color: '#1f2937', icon: '🌋' },
  [Platform.History]: { label: '历史上的今天', color: '#d97706', icon: '📜' },
};
