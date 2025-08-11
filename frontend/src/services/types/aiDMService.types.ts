// AI Dungeon Master Service Types

export interface AIDMResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface ConnectionTestResponse {
  connected: boolean;
  timestamp: string;
  version?: string;
}

export interface UsageStatsResponse {
  requestsToday: number;
  tokensUsed: number;
  costEstimate: number;
  dailyLimit?: number;
  tokenLimit?: number;
}

export interface SessionStartResponse {
  sessionId: string;
  welcomeMessage: string;
  character: string;
  location: string;
}

export interface AIServiceError extends Error {
  code: 'TIMEOUT' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 'AUTHENTICATION' | 'API_ERROR';
  retryable: boolean;
  statusCode?: number;
}

export interface AIServiceConfig {
  baseURL: string;
  timeout: number;
  retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
  cache: {
    enabled: boolean;
    ttl: {
      usageStats: number;
      connectionTest: number;
      sessionStart: number;
    };
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface LogContext {
  method: string;
  requestId?: string;
  duration?: number;
  error?: Error;
}