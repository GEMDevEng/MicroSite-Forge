// Simple logging utility for API operations and error tracking
// In production, consider using a service like Winston or Pino

import * as Sentry from '@sentry/nextjs'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  ip?: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private enableConsole = true;

  constructor() {
    // Set log level from environment
    if (process.env.LOG_LEVEL) {
      this.logLevel = process.env.LOG_LEVEL as LogLevel;
    }

    // Disable console logging in production (use proper logging service)
    if (process.env.NODE_ENV === 'production') {
      this.enableConsole = false;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const userInfo = entry.userId ? ` [User: ${entry.userId}]` : '';
    const ipInfo = entry.ip ? ` [IP: ${entry.ip}]` : '';

    return `[${timestamp}] ${entry.level.toUpperCase()}${userInfo}${ipInfo}: ${entry.message}${context}`;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formattedMessage = this.formatMessage(entry);

    // Console logging for development
    if (this.enableConsole) {
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.log(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          if (entry.error) {
            console.error(entry.error.stack);
          }
          break;
      }
    }

    // Send to external logging service (Sentry)
    if (entry.level === LogLevel.ERROR && entry.error && process.env.SENTRY_DSN) {
      try {
        Sentry.captureException(entry.error, {
          tags: {
            userId: entry.userId,
            ip: entry.ip,
          },
          extra: {
            message: entry.message,
            context: entry.context,
            timestamp: entry.timestamp,
          },
        })
      } catch (sentryError) {
        // Prevent Sentry errors from breaking the logging
        console.error('Failed to send error to Sentry:', sentryError)
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context,
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context,
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      error,
      context,
    });
  }

  // API-specific logging methods
  apiRequest(endpoint: string, method: string, userId?: string, ip?: string): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      endpoint,
      method,
      userId,
      ip,
    });
  }

  apiResponse(endpoint: string, statusCode: number, duration: number, userId?: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log({
      timestamp: new Date().toISOString(),
      level,
      message: `API Response: ${endpoint} ${statusCode} (${duration}ms)`,
      context: {
        endpoint,
        statusCode,
        duration,
      },
      userId,
    });
  }

  aiAPIUsage(provider: string, operation: string, tokens?: number, cost?: number): void {
    this.info(`AI API Usage: ${provider} - ${operation}`, {
      provider,
      operation,
      tokens,
      cost,
    });
  }

  rateLimitExceeded(identifier: string, limitType: string, ip?: string): void {
    this.warn(`Rate limit exceeded: ${limitType}`, {
      identifier,
      limitType,
      ip,
    });
  }

  siteGenerationStarted(niche: string, userId?: string): void {
    this.info(`Site generation started`, {
      niche,
      userId,
    });
  }

  siteGenerationCompleted(niche: string, siteUrl: string, duration: number, userId?: string): void {
    this.info(`Site generation completed`, {
      niche,
      siteUrl,
      duration,
      userId,
    });
  }

  siteGenerationFailed(niche: string, error: Error, userId?: string): void {
    this.error(`Site generation failed`, error, {
      niche,
      userId,
    });
  }
}

// Global logger instance
export const logger = new Logger();

// Helper function to time API operations
export function withTiming<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T> {
  const start = Date.now();

  return operation()
    .then((result) => {
      const duration = Date.now() - start;
      logger.info(`${operationName} completed`, {
        duration,
        ...context,
      });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - start;
      logger.error(`${operationName} failed`, error as Error, {
        duration,
        ...context,
      });
      throw error;
    });
}

// Error tracking for external services
export class ErrorTracker {
  static track(error: Error, context?: Record<string, unknown>): void {
    logger.error('Error tracked', error, context);

    // Send to Sentry error tracking service
    if (process.env.SENTRY_DSN) {
      try {
        Sentry.captureException(error, { extra: context });
      } catch (sentryError) {
        console.error('Failed to send error to Sentry:', sentryError);
      }
    }
  }

  static trackApiError(error: Error, endpoint: string, statusCode?: number, context?: Record<string, unknown>): void {
    logger.error(`API Error: ${endpoint}`, error, {
      endpoint,
      statusCode,
      ...context,
    });

    // Send to Sentry with additional API context
    if (process.env.SENTRY_DSN) {
      try {
        Sentry.captureException(error, {
          tags: {
            endpoint,
            statusCode: statusCode?.toString(),
          },
          extra: {
            endpoint,
            statusCode,
            ...context,
          },
        });
      } catch (sentryError) {
        console.error('Failed to send API error to Sentry:', sentryError);
      }
    }
  }
}
