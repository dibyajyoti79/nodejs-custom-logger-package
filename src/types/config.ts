import {
  ConsoleTransportOptions,
  FileTransportOptions,
} from "winston/lib/winston/transports";

export interface CloudWatchConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  logGroupName: string;
  logStreamName: string;
}
interface FileTransportConfig extends FileTransportOptions {
  datePattern: string;
}
export interface LoggerConfig {
  console?: {
    enabled: boolean;
    options?: ConsoleTransportOptions;
  };
  file?: {
    enabled: boolean;
    options?: FileTransportConfig;
  };
  cloudWatch?: {
    enabled: boolean;
    options: CloudWatchConfig;
  };
}
