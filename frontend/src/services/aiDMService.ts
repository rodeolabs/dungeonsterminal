// AI Dungeon Master Service
// Frontend service for communicating with the AI DM API

import type { PlayerIntent, Character, GameState, GameContext, DMResponse } from '@/types/game';
import type { 
  AIDMResponse, 
  ConnectionTestResponse, 
  UsageStatsResponse, 
  SessionStartResponse,
  AIServiceError,
  AIServiceConfig,
  CacheEntry,
  LogContext 
} from './types/aiDMService.types';
import { buildConfig } from './config/aiDMService.config';
import { errorHandler } from './errorHandler';

// Types are now imported from separate files

class AIDungeonMasterService {
  private config: AIServiceConfig;
  private cache = new Map<string, CacheEntry<any>>();
  private abortControllers = new Map<string, AbortController>();

  private logger = {
    info: (message: string, context?: LogContext) => {
      if (import.meta.env.DEV) {
        console.log(`[AI-DM] ${message}`, context);
      }
    },
    error: (message: string, context?: LogContext) => {
      console.error(`[AI-DM] ${message}`, context);
      // In production, send to monitoring service
      if (import.meta.env.PROD && context?.error) {
        this.reportError(context.error, context);
      }
    },
    warn: (message: string, context?: LogContext) => {
      console.warn(`[AI-DM] ${message}`, context);
    },
  };

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = buildConfig('development', config);
    
    // Log configuration in development
    if (import.meta.env.DEV) {
      this.logger.info('AI DM Service initialized', {
        method: 'constructor',
        metadata: {
          baseURL: this.config.baseURL,
          timeout: this.config.timeout,
          cacheEnabled: this.config.cache.enabled,
          maxRetries: this.config.retryConfig.maxRetries,
        },
      });
    }
  }

  /**
   * Process a player action and get AI DM response
   */
  async processAction(
    intent: PlayerIntent,
    character: Character,
    gameState: GameState,
    context?: GameContext
  ): Promise<DMResponse> {
    const requestId = `process-action-${Date.now()}`;
    
    return this.withLogging(async () => {
      return this.withRetry(async () => {
        const result = await this.makeRequest<DMResponse>(
          `${this.config.baseURL}/api/ai-dm/process-action`,
          {
            method: 'POST',
            body: JSON.stringify({ intent, character, gameState, context }),
          },
          requestId
        );

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid response from AI DM service');
        }

        return this.validateDMResponse(result.data);
      }, 'processAction');
    }, { method: 'processAction', requestId });
  }

  /**
   * Test connection to AI DM service
   */
  async testConnection(): Promise<boolean> {
    const cacheKey = this.getCacheKey('testConnection');
    const cached = this.getFromCache<boolean>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    return this.withLogging(async () => {
      try {
        const result = await this.makeRequest<ConnectionTestResponse>(
          `${this.config.baseURL}/api/ai-dm/test-connection`
        );
        
        const isConnected = result.success && result.data?.connected === true;
        this.setCache(cacheKey, isConnected, this.config.cache.ttl.connectionTest);
        return isConnected;
      } catch (error) {
        this.logger.error('Connection test failed', { method: 'testConnection', error: error as Error });
        return false;
      }
    }, { method: 'testConnection' });
  }

  /**
   * Get AI DM usage statistics
   */
  async getUsageStats(): Promise<UsageStatsResponse | null> {
    const cacheKey = this.getCacheKey('usageStats');
    const cached = this.getFromCache<UsageStatsResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    return this.withLogging(async () => {
      try {
        const result = await this.makeRequest<UsageStatsResponse>(
          `${this.config.baseURL}/api/ai-dm/usage-stats`
        );
        
        if (result.success && result.data) {
          this.setCache(cacheKey, result.data, this.config.cache.ttl.usageStats);
          return result.data;
        }
        
        return null;
      } catch (error) {
        this.logger.error('Failed to get usage stats', { method: 'getUsageStats', error: error as Error });
        return null;
      }
    }, { method: 'getUsageStats' });
  }

  /**
   * Start a new AI DM session
   */
  async startSession(character: Character, gameState: GameState): Promise<string | null> {
    const requestId = `start-session-${Date.now()}`;
    
    return this.withLogging(async () => {
      return this.withRetry(async () => {
        const result = await this.makeRequest<SessionStartResponse>(
          `${this.config.baseURL}/api/ai-dm/start-session`,
          {
            method: 'POST',
            body: JSON.stringify({ character, gameState }),
          },
          requestId
        );

        if (result.success && result.data) {
          return result.data.welcomeMessage;
        }

        return null;
      }, 'startSession');
    }, { method: 'startSession', requestId });
  }

  /**
   * Check if AI DM service is available
   */
  async isAvailable(): Promise<boolean> {
    return this.withLogging(async () => {
      try {
        const result = await this.makeRequest<{ status: string }>(
          `${this.config.baseURL}/api/health`
        );
        return result.success;
      } catch (error) {
        this.logger.error('Health check failed', { method: 'isAvailable', error: error as Error });
        return false;
      }
    }, { method: 'isAvailable' });
  }

  /**
   * Update service configuration
   */
  updateConfig(updates: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration (readonly)
   */
  getConfig(): Readonly<AIServiceConfig> {
    return { ...this.config };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Private helper methods
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    requestId?: string
  ): Promise<AIDMResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    if (requestId) {
      // Cancel previous request if exists
      this.abortControllers.get(requestId)?.abort();
      this.abortControllers.set(requestId, controller);
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0',
          'X-Request-ID': requestId || crypto.randomUUID(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
      if (requestId) {
        this.abortControllers.delete(requestId);
      }
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const aiError = this.classifyError(error, context);
        
        if (!aiError.retryable || attempt === this.config.retryConfig.maxRetries) {
          // Return fallback response for processAction
          if (context === 'processAction') {
            return errorHandler.getFallbackDMResponse(aiError) as T;
          }
          throw aiError;
        }
        
        const delay = Math.min(
          this.config.retryConfig.baseDelay * Math.pow(2, attempt),
          this.config.retryConfig.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  private classifyError(error: any, context: string): AIServiceError {
    return errorHandler.classifyError(error, context);
  }

  private async withLogging<T>(
    operation: () => Promise<T>,
    context: LogContext
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting ${context.method}`, context);
      const result = await operation();
      
      this.logger.info(`Completed ${context.method}`, {
        ...context,
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed ${context.method}`, {
        ...context,
        duration: Date.now() - startTime,
        error: error as Error,
      });
      throw error;
    }
  }

  private getCacheKey(method: string, params?: any): string {
    return `${method}:${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.cache.enabled) return null;
    
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    if (!this.config.cache.enabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private validateDMResponse(data: any): DMResponse {
    // Basic validation - in a real app, you'd use a schema validation library like Zod
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: expected object');
    }

    if (typeof data.narrative !== 'string') {
      throw new Error('Invalid response format: narrative must be a string');
    }

    if (!Array.isArray(data.gameEffects)) {
      data.gameEffects = [];
    }

    if (!Array.isArray(data.dashboardUpdates)) {
      data.dashboardUpdates = [];
    }

    return data as DMResponse;
  }

  private reportError(error: Error, context: LogContext): void {
    errorHandler.reportError(error as AIServiceError, context);
  }
}

// Export singleton instance
export const aiDMService = new AIDungeonMasterService();
export default aiDMService;