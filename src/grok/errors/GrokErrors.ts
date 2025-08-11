// Custom Error Classes for Grok Integration
// Provides structured error handling with specific error types

export class GrokError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'GrokError';
    this.code = code;
    this.context = context;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GrokError);
    }
  }
}

export class GrokAuthenticationError extends GrokError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 'GROK_AUTH_ERROR', context);
    this.name = 'GrokAuthenticationError';
  }
}

export class GrokRateLimitError extends GrokError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, context?: Record<string, any>) {
    super(message, 'GROK_RATE_LIMIT', context);
    this.name = 'GrokRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class GrokNetworkError extends GrokError {
  constructor(message: string = 'Network error occurred', context?: Record<string, any>) {
    super(message, 'GROK_NETWORK_ERROR', context);
    this.name = 'GrokNetworkError';
  }
}

export class GrokConfigurationError extends GrokError {
  constructor(message: string = 'Configuration error', context?: Record<string, any>) {
    super(message, 'GROK_CONFIG_ERROR', context);
    this.name = 'GrokConfigurationError';
  }
}

export class GrokValidationError extends GrokError {
  public readonly validationErrors: string[];

  constructor(message: string = 'Validation failed', validationErrors: string[] = [], context?: Record<string, any>) {
    super(message, 'GROK_VALIDATION_ERROR', context);
    this.name = 'GrokValidationError';
    this.validationErrors = validationErrors;
  }
}

// Error factory for creating appropriate error types based on HTTP status codes
export class GrokErrorFactory {
  static fromHttpStatus(status: number, message: string, context?: Record<string, any>): GrokError {
    switch (status) {
      case 401:
      case 403:
        return new GrokAuthenticationError(message, context);
      case 429:
        return new GrokRateLimitError(message, undefined, context);
      case 500:
      case 502:
      case 503:
      case 504:
        return new GrokNetworkError(message, context);
      default:
        return new GrokError(message, `HTTP_${status}`, context);
    }
  }

  static fromApiError(apiError: { error: { message: string; type?: string; code?: string } }, context?: Record<string, any>): GrokError {
    const { message, type, code } = apiError.error;
    
    if (type === 'authentication_error' || code === 'invalid_api_key') {
      return new GrokAuthenticationError(message, context);
    }
    
    if (type === 'rate_limit_error' || code === 'rate_limit_exceeded') {
      return new GrokRateLimitError(message, undefined, context);
    }
    
    return new GrokError(message, code || type || 'UNKNOWN_API_ERROR', context);
  }
}