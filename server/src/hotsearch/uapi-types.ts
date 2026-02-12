/**
 * UApiPro API 响应类型定义
 * 减少使用 any 类型，提高类型安全性
 */

/**
 * 单个热搜条目的 API 响应格式
 */
export interface UApiHotItem {
  title: string;
  hot?: string | number;
  hot_value?: string | number;
  heat?: string | number;
  score?: string | number;
  value?: string | number;
  url?: string;
  link?: string;
  mobileUrl?: string;
  category?: string;
  extra?: {
    cover?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * UApiPro API 响应结构
 */
export interface UApiResponse {
  data?: {
    list?: UApiHotItem[];
  };
  list?: UApiHotItem[];
  update_time?: string;
  type?: string;
}

/**
 * API 错误响应
 */
export interface UApiError {
  error?: string;
  message?: string;
  code?: number;
}

/**
 * 判断是否为错误响应
 */
export function isUApiError(response: any): response is UApiError {
  return response && typeof response === 'object' && ('error' in response || 'message' in response);
}
