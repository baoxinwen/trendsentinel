// 平台枚举
export enum Platform {
  // 视频/社区
  Bilibili = 'Bilibili',
  Acfun = 'Acfun',
  Weibo = 'Weibo',
  Zhihu = 'Zhihu',
  ZhihuDaily = 'ZhihuDaily',
  Douyin = 'Douyin',
  Kuaishou = 'Kuaishou',
  DoubanMovie = 'DoubanMovie',
  DoubanGroup = 'DoubanGroup',
  Tieba = 'Tieba',
  Hupu = 'Hupu',
  Ngabbs = 'Ngabbs',
  V2ex = 'V2ex',
  _52pojie = '_52pojie',
  Hostloc = 'Hostloc',
  Coolapk = 'Coolapk',

  // 新闻/资讯
  Baidu = 'Baidu',
  ThePaper = 'ThePaper',
  Toutiao = 'Toutiao',
  QqNews = 'QqNews',
  Sina = 'Sina',
  SinaNews = 'SinaNews',
  NeteaseNews = 'NeteaseNews',
  Huxiu = 'Huxiu',
  Ifanr = 'Ifanr',

  // 科技/IT
  Sspai = 'Sspai',
  ITHome = 'ITHome',
  ITHomeXijiayi = 'ITHomeXijiayi',
  Juejin = 'Juejin',
  Jianshu = 'Jianshu',
  Guokr = 'Guokr',
  _36Kr = '_36Kr',
  _51Cto = '_51Cto',
  Csdn = 'Csdn',
  Nodeseek = 'Nodeseek',
  HelloGithub = 'HelloGithub',

  // 游戏
  Lol = 'Lol',
  Genshin = 'Genshin',
  Honkai = 'Honkai',
  Starrail = 'Starrail',

  // 其他
  Weread = 'Weread',
  WeatherAlarm = 'WeatherAlarm',
  Earthquake = 'Earthquake',
  History = 'History'
}

// 热搜条目接口
export interface HotSearchItem {
  id: string;
  rank: number;
  title: string;
  score: number; // 热度值
  platform: Platform;
  url: string;
  category?: string;
  timestamp: number;
}

// 筛选状态接口
export interface FilterState {
  keywords: string[];
  platforms: Platform[];
  minScore: number;
}

// 邮件配置接口
export interface EmailConfig {
  recipients: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
  sendTime: string; // HH:mm 格式
  enabled: boolean;
}

// 历史快照接口
export interface HistorySnapshot {
  id: string;
  timestamp: number;
  items: HotSearchItem[];
  note?: string;
}

// 视图模式类型
export type ViewMode = 'dashboard' | 'history' | 'email' | 'analysis' | 'snapshot';
