/**
 * API Configuration
 * Centralized configuration for API endpoints and authentication
 */

// API base URL - configurable via environment variable
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

// API Key - for development only
// In production, this should be handled by backend authentication
export const API_KEY = import.meta.env.VITE_API_KEY || 'dev-api-key-change-in-production';

// API endpoints
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

// Helper function to build API URLs
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE}${endpoint}`;
};

// Helper function to get API headers
export const getApiHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
};
