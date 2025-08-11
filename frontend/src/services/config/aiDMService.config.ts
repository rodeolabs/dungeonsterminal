// AI Dungeon Master Service Configuration

import type { AIServiceConfig } from '../types/aiDMService.types';

export const buildConfig = (overrides?: Partial<AIServiceConfig>): AIServiceConfig => {
  const defaultConfig: AIServiceConfig = {
    baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:3001',
    timeout: parseInt(import.meta.env?.VITE_AI_TIMEOUT || '30000'),
    retryConfig: {
      maxRetries: parseInt(import.meta.env?.VITE_AI_MAX_RETRIES || '3'),
      baseDelay: 1000,
      maxDelay: 10000,
    },
    cache: {
      enabled: import.meta.env?.VITE_AI_CACHE_ENABLED !== 'false',
      ttl: {
        usageStats: 60000, // 1 minute
        connectionTest: 30000, // 30 seconds
        sessionStart: 300000, // 5 minutes
      },
    },
  };

  return { ...defaultConfig, ...overrides };
};