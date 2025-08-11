// Logging Utility
// Structured logging for Grok AI integration

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any> | undefined;
  error?: Error | undefined;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private enableConsole: boolean = true;
  private enableFile: boolean = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  configure(options: {
    level?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
  }): void {
    if (options.level) this.logLevel = options.level;
    if (options.enableConsole !== undefined) this.enableConsole = options.enableConsole;
    if (options.enableFile !== undefined) this.enableFile = options.enableFile;
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error
    };

    if (this.enableConsole) {
      this.logToConsole(logEntry);
    }

    if (this.enableFile) {
      this.logToFile(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    
    // Create structured log object for better parsing
    const logObject = {
      timestamp,
      level: entry.level.toUpperCase(),
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.error && { 
        error: {
          message: entry.error.message,
          name: entry.error.name,
          ...(entry.error.stack && { stack: entry.error.stack })
        }
      })
    };

    // Format for console output
    const logMessage = `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    const contextStr = entry.context ? `\n  Context: ${JSON.stringify(entry.context, null, 2)}` : '';
    const errorStr = entry.error ? `\n  Error: ${entry.error.message}` : '';
    
    const fullMessage = `${logMessage}${contextStr}${errorStr}`;

    switch (entry.level) {
      case 'debug':
        console.debug(fullMessage);
        break;
      case 'info':
        console.info(fullMessage);
        break;
      case 'warn':
        console.warn(fullMessage);
        break;
      case 'error':
        console.error(fullMessage);
        if (entry.error?.stack) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
    }

    // Also log structured object for programmatic parsing
    if (process.env.NODE_ENV === 'development') {
      console.log('Structured log:', JSON.stringify(logObject, null, 2));
    }
  }

  private logToFile(_entry: LogEntry): void {
    // File logging implementation would go here
    // For now, we'll skip this as it requires file system setup
  }
}