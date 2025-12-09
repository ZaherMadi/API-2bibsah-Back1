/**
 * Système de logging pour l'application
 * 
 * Pour l'instant, utilise console.log/error/warn
 * En production, vous pouvez remplacer par Winston ou Pino
 */

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

class Logger {
    private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...(metadata && { metadata }),
        };
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
        const entry = this.formatMessage(level, message, metadata);
        
        // En développement, afficher de manière colorée
        if (process.env.NODE_ENV === 'development') {
            const colors: Record<LogLevel, string> = {
                [LogLevel.ERROR]: '\x1b[31m', // Rouge
                [LogLevel.WARN]: '\x1b[33m',  // Jaune
                [LogLevel.INFO]: '\x1b[36m',  // Cyan
                [LogLevel.DEBUG]: '\x1b[90m', // Gris
            };
            const reset = '\x1b[0m';
            
            console.log(`${colors[level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`);
            if (metadata) {
                console.log(JSON.stringify(metadata, null, 2));
            }
        } else {
            // En production, format JSON structuré
            console.log(JSON.stringify(entry));
        }
    }

    error(message: string, error?: Error | Record<string, any>) {
        const metadata = error instanceof Error 
            ? { error: error.message, stack: error.stack }
            : error;
        this.log(LogLevel.ERROR, message, metadata);
    }

    warn(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.WARN, message, metadata);
    }

    info(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, message, metadata);
    }

    debug(message: string, metadata?: Record<string, any>) {
        if (process.env.NODE_ENV === 'development') {
            this.log(LogLevel.DEBUG, message, metadata);
        }
    }
}

// Export d'une instance singleton
export const logger = new Logger();

export default logger;
