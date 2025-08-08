interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  public info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  public warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = error instanceof Error ? { error: error.message, stack: error.stack } : { error };
    const combinedContext = { ...context, ...errorContext };
    console.error(this.formatMessage('error', message, combinedContext));
  }

  public debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();