// AI Dungeon Master types and interfaces

export interface UsageStats {
  requestsToday: number;
  tokensUsed: number;
  costEstimate: number;
  lastUpdated: Date;
  dailyLimit?: number;
  tokenLimit?: number;
}

export interface AIDMError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ConnectionHealth {
  isConnected: boolean;
  isAvailable: boolean;
  lastChecked: Date;
  responseTime?: number;
  version?: string;
}

export interface AIDMConnectionState {
  health: ConnectionHealth;
  isLoading: boolean;
  error: AIDMError | null;
  usageStats: UsageStats | null;
}

// Error codes for consistent error handling
export const AIDM_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type AIDMErrorCode = typeof AIDM_ERROR_CODES[keyof typeof AIDM_ERROR_CODES];

// Configuration constants
export const AIDM_CONFIG = {
  CONNECTION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  USAGE_STATS_REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes
  CONNECTION_TIMEOUT: 10 * 1000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;