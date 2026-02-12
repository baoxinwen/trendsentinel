import { Platform, HotSearchItem, EmailConfig, HistorySnapshot, ViewMode } from '../types';

/**
 * localStorage 存储键
 */
export const STORAGE_KEYS = {
  SELECTED_PLATFORMS: 'trendmonitor_selected_platforms',
  AUTO_REFRESH: 'trendmonitor_auto_refresh',
  HISTORY: 'trendmonitor_history',
  THEME: 'theme',
} as const;

/**
 * localStorage Schema 定义
 */
interface StorageSchema {
  [STORAGE_KEYS.SELECTED_PLATFORMS]: Platform[];
  [STORAGE_KEYS.AUTO_REFRESH]: boolean;
  [STORAGE_KEYS.HISTORY]: HistorySnapshot[];
  [STORAGE_KEYS.THEME]: 'dark' | 'light';
}

/**
 * 安全的 localStorage 获取函数
 * 带类型验证和错误处理
 */
export function getStorageItem<K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K]
): StorageSchema[K] {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    const parsed = JSON.parse(item);

    // 验证解析后的数据
    switch (key) {
      case STORAGE_KEYS.SELECTED_PLATFORMS:
        if (!Array.isArray(parsed)) return defaultValue;
        const validPlatforms = (parsed as any[]).filter(
          (p: any) => typeof p === 'string' && Object.values(Platform).includes(p)
        );
        return (validPlatforms.length > 0 ? validPlatforms : defaultValue) as StorageSchema[K];

      case STORAGE_KEYS.AUTO_REFRESH:
        return typeof parsed === 'boolean' ? parsed : defaultValue;

      case STORAGE_KEYS.HISTORY:
        if (!Array.isArray(parsed)) return defaultValue;
        return parsed as StorageSchema[K];

      case STORAGE_KEYS.THEME:
        return parsed === 'dark' || parsed === 'light' ? parsed : defaultValue;

      default:
        return parsed as StorageSchema[K];
    }
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * 安全的 localStorage 设置函数
 * 带错误处理
 */
export function setStorageItem<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    // 可能是配额超限或隐私模式禁用
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else if (error.name === 'SecurityError') {
        console.error('localStorage access denied (privacy mode)');
      }
    }
  }
}

/**
 * 删除 localStorage 项
 */
export function removeStorageItem(key: keyof StorageSchema): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
}

/**
 * 清空所有 localStorage 项
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
