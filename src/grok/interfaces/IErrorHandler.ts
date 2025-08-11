// Error Handler Interface
// Defines the contract for error handling and recovery

export interface IErrorHandler {
  /**
   * Handle API-specific errors
   */
  handleAPIError(error: any): {
    userMessage: string;
    shouldRetry: boolean;
    retryDelay?: number;
  };

  /**
   * Handle network connectivity errors
   */
  handleNetworkError(error: any): {
    userMessage: string;
    shouldRetry: boolean;
    retryDelay?: number;
  };

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): {
    userMessage: string;
    shouldRetry: boolean;
    setupInstructions?: string;
  };

  /**
   * Execute operation with retry logic
   */
  retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    baseDelay?: number
  ): Promise<T>;

  /**
   * Log error with context
   */
  logError(error: any, context?: Record<string, any>): void;

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    lastError?: Date;
  };
}