/**
 * API 配置
 * API 端点和身份验证的集中配置
 */

// API 基础 URL - 可通过环境变量配置
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// API 密钥 - 仅用于开发环境
// 生产环境中应在后端进行身份验证
export const API_KEY = import.meta.env.VITE_API_KEY || 'dev-api-key-change-in-production';

// API 端点
export const API_ENDPOINTS = {
  config: {
    email: '/config/email',
  },
  email: {
    send: '/email/send',
    test: '/email/test',
    verify: '/email/verify',
  },
  hotsearch: {
    root: '/hotsearch',
    platforms: '/hotsearch/platforms',
    cache: {
      stats: '/hotsearch/cache/stats',
      clear: '/hotsearch/cache/clear',
    },
  },
} as const;

// 构建 API URL 的辅助函数
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE}${endpoint}`;
};

// 获取 API 请求头的辅助函数
export const getApiHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
};
