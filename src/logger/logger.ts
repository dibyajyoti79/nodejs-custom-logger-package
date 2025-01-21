import winston from "winston";

/**
 * Defines the structure for a custom log entry.
 */
interface CustomLogEntry {
  message: string; // The main log message
  traceId?: string; // Optional trace ID for tracing requests
  meta?: object; // Additional metadata
}

/**
 * Defines leveled logging methods with overloads for clarity and type safety.
 */
export interface LeveledLogMethod {
  // Log using a simple message
  (message: string): winston.Logger;
  // Log using a structured CustomLogEntry object
  (infoObject: CustomLogEntry): winston.Logger;
}

/**
 * CustomLogger wraps the Winston logger and provides leveled logging methods.
 */
export class CustomLogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Internal log handler to process various input formats.
   * @param level The log level (e.g., info, error, debug).
   * @param entry The log message or structured entry.
   */
  private log(level: string, entry: string | CustomLogEntry) {
    if (typeof entry === "string") {
      // Log simple message
      this.logger.log(level, entry);
    } else {
      // Log structured entry
      const { message, traceId, meta } = entry;
      this.logger.log(level, message, { traceId, meta });
    }
  }

  /**
   * Logs information-level messages.
   */
  info: LeveledLogMethod = (entry: string | CustomLogEntry) => {
    this.log("info", entry);
    return this.logger;
  };

  /**
   * Logs error-level messages.
   */
  error: LeveledLogMethod = (entry: string | CustomLogEntry) => {
    this.log("error", entry);
    return this.logger;
  };

  /**
   * Logs warning-level messages.
   */
  warn: LeveledLogMethod = (entry: string | CustomLogEntry) => {
    this.log("warn", entry);
    return this.logger;
  };
}
