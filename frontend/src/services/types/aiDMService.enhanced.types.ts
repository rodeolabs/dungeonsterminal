// Enhanced AI Dungeon Master Service Types
// This file contains improved type definitions with better type safety and error handling

// Discriminated union for better type safety
export type AIDMResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: string };

export interface ConnectionTestResponse {
  connected: boolean;
  timestamp: string;
  version?: string;
  latency?: number;
}

export interface UsageStatsResponse {
  requestsToday: number;
  tokensUsed: number;
  costEstimate: number;
  dailyLimit?: number;
  tokenLimit?: number;
  resetTime?: string;
}

export interface SessionStartResponse {
  sessionId: string;
  welcomeMessage: string;
  character: string;
  location: string;
  initialState?: Record<string, unknown>;
}

// Enhanced error types with discriminated unions
export type AIServiceError = 
  | { code: 'TIMEOUT'; retryable: true; message: string }
  | { code: 'NETWORK_ERROR'; retryable: true; message: string }
  | { code: 'RATE_LIMIT'; retryable: true; retryAfter?: number; message: string }
  | { code: 'AUTHENTICATION'; retryable: false; statusCode: 401 | 403; message: string }
  | { code: 'API_ERROR'; retryable: boolean; statusCode: number; message: string };

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
  headers?: Record<string, string>;
  apiKey?: string;
}

// Enhanced cache interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount?: number;
  lastAccessed?: number;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
}

// Enhanced logging context
export interface RequestContext {
  requestId: string;
  method: string;
  timestamp: number;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  correlationId?: string;
}

export interface LogContext extends RequestContext {
  duration?: number;
  error?: Error;
  metadata?: Record<string, unknown>;
}

// Configuration validation
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Service health monitoring
export interface ServiceMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastError?: string;
  metrics: ServiceMetrics;
  timestamp: number;
}

// Utility types for better type safety
export type ServiceMethod = 
  | 'processAction'
  | 'testConnection'
  | 'getUsageStats'
  | 'startSession'
  | 'isAvailable';

export type CacheKey = `${ServiceMethod}:${string}` | ServiceMethod;

// Configuration validation function
export function validateConfig(config: AIServiceConfig): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!config.baseURL) {
    errors.push('baseURL is required');
  }

  if (config.timeout <= 0) {
    errors.push('timeout must be positive');
  }

  // Validate retry configuration
  if (config.retryConfig.maxRetries < 0) {
    errors.push('maxRetries cannot be negative');
  }

  if (config.retryConfig.baseDelay <= 0) {
    warnings.push('baseDelay should be positive for effective retry logic');
  }

  if (config.retryConfig.maxDelay < config.retryConfig.baseDelay) {
    warnings.push('maxDelay should be greater than baseDelay');
  }

  // Validate cache configuration
  Object.entries(config.cache.ttl).forEach(([key, value]) => {
    if (value <= 0) {
      warnings.push(`Cache TTL for ${key} should be positive`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Type guards for better runtime type safety
export function isSuccessResponse<T>(response: AIDMResponse<T>): response is { success: true; data: T } {
  return response.success === true;
}

export function isErrorResponse<T>(response: AIDMResponse<T>): response is { success: false; error: string; details?: string } {
  return response.success === false;
}

export function isRetryableError(error: AIServiceError): boolean {
  return error.retryable;
}

export function isRateLimitError(error: AIServiceError): error is { code: 'RATE_LIMIT'; retryable: true; retryAfter?: number; message: string } {
  return error.code === 'RATE_LIMIT';
}