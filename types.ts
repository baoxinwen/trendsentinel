export enum Platform {
  // Video/Community
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

  // News/Info
  Baidu = 'Baidu',
  ThePaper = 'ThePaper',
  Toutiao = 'Toutiao',
  QqNews = 'QqNews',
  Sina = 'Sina',
  SinaNews = 'SinaNews',
  NeteaseNews = 'NeteaseNews',
  Huxiu = 'Huxiu',
  Ifanr = 'Ifanr',

  // Tech/IT
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

  // Game
  Lol = 'Lol',
  Genshin = 'Genshin',
  Honkai = 'Honkai',
  Starrail = 'Starrail',

  // Other
  Weread = 'Weread',
  WeatherAlarm = 'WeatherAlarm',
  Earthquake = 'Earthquake',
  History = 'History'
}

export interface HotSearchItem {
  id: string;
  rank: number;
  title: string;
  score: number; // Heat score
  platform: Platform;
  url: string;
  category?: string;
  timestamp: number;
}

export interface FilterState {
  keywords: string[];
  platforms: Platform[];
  minScore: number;
}

export interface EmailConfig {
  recipients: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
  sendTime: string; // HH:mm
  enabled: boolean;
}

export interface HistorySnapshot {
  id: string;
  timestamp: number;
  items: HotSearchItem[];
  note?: string;
}

export type ViewMode = 'dashboard' | 'history' | 'email' | 'analysis' | 'snapshot';
