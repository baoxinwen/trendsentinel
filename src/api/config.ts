/**
 * API 配置
 * API 端点和身份验证的集中配置
 */

// API 基础 URL - 可通过环境变量配置
// 开发环境: http://localhost:3001/api (直接调用后端 API)
// Docker 环境: /api (通过 nginx 代理到后端)
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// 判断是否使用后端 API (Docker 环境)
export const useBackendAPI = (): boolean => {
  return API_BASE.startsWith('/api') || API_BASE.includes('/api/');
};

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
// Docker 环境下不需要 API Key，直接使用后端代理
// 开发环境下后端 API 也是公开的，不需要认证
export const getApiHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  return headers;
};
