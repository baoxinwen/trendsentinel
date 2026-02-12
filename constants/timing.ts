/**
 * 时间和延迟相关常量
 * 统一管理应用中的魔法数字
 */
export const TIMING = {
  // 自动刷新间隔（毫秒）
  AUTO_REFRESH_INTERVAL: 60 * 1000, // 1 minute

  // API 请求相关
  API_CHUNK_DELAY: 800,              // 800ms - 平台请求分组间延迟
  API_REQUEST_TIMEOUT: 15000,        // 15 seconds - API 超时时间
  CACHE_DURATION: 60 * 1000,         // 60 seconds - 缓存持续时间

  // UI 相关
  TOAST_DURATION: 3000,              // 3 seconds - Toast 提示显示时间
  DEBOUNCE_DELAY: 300,             // 300ms - 防抖延迟

  // 滚动相关
  SCROLL_COLLAPSE_THRESHOLD: 100,    // 滚动收缩阈值（px）
  SCROLL_EXPAND_THRESHOLD: 20,       // 滚动展开阈值（px）

  // 动画相关
  ANIMATION_DURATION: 350,            // 350ms - 标准动画持续时间
  TRANSITION_DURATION: 300,           // 300ms - 过渡动画时间

  // 缓存清理
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes - 缓存清理间隔

  // 文件锁
  FILE_LOCK_TIMEOUT: 30000,           // 30 seconds - 文件锁超时时间
} as const;

/**
 * 平台限制相关常量
 */
export const PLATFORM_LIMITS = {
  MAX_CACHE_SIZE: 50,                 // 最大缓存条目数
  MAX_SELECTED_PLATFORMS: 10,          // 最多选择的平台数
  CHUNK_SIZE: 2,                     // API 请求分组大小
} as const;

/**
 * UI 相关常量
 */
export const UI = {
  SNAPSHOT_MAX_ITEMS: 500,            // 单个快照最大条目数
  KEYWORD_TOP_N: 20,                // 关键词 TOP N
  MAX_RETRIES: 3,                     // 最大重试次数
} as const;
