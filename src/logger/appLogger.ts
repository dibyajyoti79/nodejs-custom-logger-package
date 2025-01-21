import { createLogger, transports, format, Logger } from "winston";
import { LoggerConfig } from "../types/config";
import { CloudWatchTransport } from "./cloudwatch/CloudWatchTrasport";
import { CustomLogger } from "./logger";

export const createAppLogger = (config: LoggerConfig): CustomLogger => {
  const loggerTransports = [];

  // Add Console Transport if enabled
  if (config.console?.enabled) {
    loggerTransports.push(new transports.Console(config.console.options));
  }

  // Add File Transport if enabled
  if (config.file?.enabled) {
    loggerTransports.push(
      new transports.DailyRotateFile({
        dirname: config.file.options?.dirname || "logs/application",
        filename: config.file.options?.filename || "app-%DATE%.log",
        datePattern: config.file.options?.datePattern || "YYYY-MM-DD",
        maxSize: config.file.options?.maxsize || "20m",
        maxFiles: config.file.options?.maxFiles || "14d",
        zippedArchive: true,
      })
    );
  }

  // Add CloudWatch Transport if enabled
  if (config.cloudWatch?.enabled) {
    loggerTransports.push(new CloudWatchTransport(config.cloudWatch.options));
  }

  const baseLogger = createLogger({
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.json(),
      format.printf(({ level, message, timestamp, traceId, meta }) => {
        return JSON.stringify({
          traceId: traceId,
          level: level,
          message: message,
          meta: meta,
          timeStamp: timestamp,
        });
      })
    ),
    transports: loggerTransports,
  });

  return new CustomLogger(baseLogger);
};
