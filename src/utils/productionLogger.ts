// Production-safe logging system with structured error reporting
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class ProductionLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDev = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    };

    // Store log entry
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Development: still show in console
    if (this.isDev) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           level === 'info' ? console.info : console.log;
      consoleMethod(`[${level.toUpperCase()}]`, message, context, error);
    }

    // Production: send critical errors to error reporting service
    if (level === 'error' && !this.isDev) {
      this.reportCriticalError(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Get user ID from auth context or local storage
      const authData = localStorage.getItem('sb-auth-token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('log-session-id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('log-session-id', sessionId);
    }
    return sessionId;
  }

  private async reportCriticalError(entry: LogEntry) {
    try {
      // In a real implementation, send to error reporting service
      // For now, store in localStorage for debugging
      const criticalErrors = JSON.parse(localStorage.getItem('critical-errors') || '[]');
      criticalErrors.unshift({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      
      // Keep only last 50 critical errors
      if (criticalErrors.length > 50) {
        criticalErrors.splice(50);
      }
      
      localStorage.setItem('critical-errors', JSON.stringify(criticalErrors));
    } catch (error) {
      // If we can't even log the error, something is seriously wrong
      // Fall back to console in this case
      console.error('Failed to report critical error:', error);
    }
  }
}

// Create singleton instance
export const logger = new ProductionLogger();

// Helper functions to replace console.log usage
export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context);

export const logError = (message: string, context?: Record<string, any>, error?: Error) => 
  logger.error(message, context, error);
