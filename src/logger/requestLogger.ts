import morgan, { StreamOptions } from "morgan";
import { Request } from "express";
import { createLogger, transports, format, Logger } from "winston";
import "winston-daily-rotate-file";

const reqResLogFormat = format.printf(({ message }) => {
  return message as string;
});

const reqResLogger: Logger = createLogger({
  level: "info",
  format: reqResLogFormat,
  transports: [
    new transports.DailyRotateFile({
      dirname: "logs/access",
      filename: "access-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxFiles: "7d",
    }),
  ],
});

const stream: StreamOptions = {
  write: (message) => reqResLogger.info(message.trim()),
};

// Add custom tokens to include detailed information
morgan.token("client-ip", (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0];
  }
  return req.ip || forwardedFor || req.socket.remoteAddress || "-";
});

const detailedMorganFormat =
  ":client-ip :method :url :status :res[content-length] - :response-time ms";

// Create the middleware with the detailed format
const requestLogger = morgan(detailedMorganFormat, { stream });

export default requestLogger;
