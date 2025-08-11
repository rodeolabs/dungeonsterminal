// Retry Utilities
// Implements exponential backoff and retry logic for API calls

import { GrokRateLimitError, GrokNetworkError } from '../errors/GrokErrors';
import { Logger } from './logger';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: Array<new (...args: any[]) => Error>;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [GrokRateLimitError, GrokNetworkError]
};

export class RetryManager {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          this.logger.info(`Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === config.maxRetries + 1) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error as Error, config.retryableErrors)) {
          this.logger.debug(`Non-retryable error encountered: ${error}`);
          throw error;
        }

        const delay = this.calculateDelay(attempt - 1, config);
        
        this.logger.warn(`Operation failed on attempt ${attempt}, retrying in ${delay}ms`, {
          error: (error as Error).message,
          attempt,
          maxRetries: config.maxRetries
        });

        await this.sleep(delay);
      }
    }

    this.logger.error(`Operation failed after ${config.maxRetries + 1} attempts`, lastError!);
    throw lastError!;
  }

  private isRetryableError(error: Error, retryableErrors: Array<new (...args: any[]) => Error>): boolean {
    return retryableErrors.some(ErrorClass => error instanceof ErrorClass);
  }

  private calculateDelay(attemptNumber: number, config: RetryOptions): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attemptNumber);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    return Math.min(exponentialDelay + jitter, config.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper method for rate limit specific retry
  async executeWithRateLimitRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 5
  ): Promise<T> {
    return this.executeWithRetry(operation, {
      maxRetries,
      baseDelay: 2000, // Start with 2 seconds for rate limits
      maxDelay: 60000, // Max 1 minute
      retryableErrors: [GrokRateLimitError, GrokNetworkError]
    });
  }
}

// Decorator for automatic retry
export function withRetry(options?: Partial<RetryOptions>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const retryManager = new RetryManager();

    descriptor.value = async function (...args: any[]) {
      return retryManager.executeWithRetry(
        () => method.apply(this, args),
        options
      );
    };
  };
}