import TransportStream from "winston-transport";

import { CloudWatchConfig } from "../../types/config";
import { CloudWatchLogger } from "./CloudWatchLogger";

export class CloudWatchTransport extends TransportStream {
  private cloudWatchLogger: CloudWatchLogger;

  constructor(config: CloudWatchConfig) {
    super();
    this.cloudWatchLogger = new CloudWatchLogger(config);
  }

  log(info: any, callback: () => void): void {
    // Emit the 'logged' event
    setImmediate(() => this.emit("logged", info));

    const { message, traceId, level, timestamp, meta } = info;

    // Send the log to CloudWatch
    this.cloudWatchLogger
      .log(message, traceId, level, timestamp, meta)
      .then(() => {
        callback(); // Indicate successful logging
      })
      .catch((error) => {
        console.error("CloudWatch logging error:", error);
        callback();
      });
  }
}
