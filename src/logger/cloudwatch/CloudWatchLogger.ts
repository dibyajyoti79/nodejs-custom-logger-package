import {
  PutLogEventsCommand,
  CreateLogStreamCommand,
  CreateLogGroupCommand,
  CloudWatchLogsClient,
  DescribeLogStreamsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchConfig } from "../../types/config";

export class CloudWatchLogger {
  private logGroupName: string;
  private logStreamName: string;
  private client: CloudWatchLogsClient;
  private logGroupCreated: boolean = false;
  private logStreamCreated: boolean = false;
  private sequenceToken: string | undefined = undefined;
  private logBuffer: { message: string; timestamp: number }[] = [];
  private flushIntervalMs: number;
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(config: CloudWatchConfig, flushIntervalMs = 60000) {
    this.logGroupName = config.logGroupName;
    this.logStreamName = config.logStreamName;
    this.flushIntervalMs = flushIntervalMs;
    this.client = new CloudWatchLogsClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.init();
  }

  private async init() {
    await this.ensureLogGroupAndStream();
  }

  private async ensureLogGroupAndStream(): Promise<void> {
    if (!this.logGroupCreated) {
      try {
        await this.client.send(
          new CreateLogGroupCommand({ logGroupName: this.logGroupName })
        );
        this.logGroupCreated = true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "ResourceAlreadyExistsException"
        ) {
          throw error;
        }
      }
    }

    if (!this.logStreamCreated) {
      try {
        await this.client.send(
          new CreateLogStreamCommand({
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
          })
        );
        this.logStreamCreated = true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "ResourceAlreadyExistsException"
        ) {
          throw error;
        }
      }
    }

    // Retrieve the sequence token for the existing log stream
    if (!this.sequenceToken) {
      try {
        const describeCommand = new DescribeLogStreamsCommand({
          logGroupName: this.logGroupName,
          logStreamNamePrefix: this.logStreamName, // Filter by stream name
        });

        const response = await this.client.send(describeCommand);
        const logStream = response.logStreams?.find(
          (stream) => stream.logStreamName === this.logStreamName
        );

        if (logStream && logStream.uploadSequenceToken) {
          this.sequenceToken = logStream.uploadSequenceToken;
        }
      } catch (error) {
        console.error("Failed to retrieve sequence token:", error);
      }
    }
  }

  async log(
    message: string,
    traceId: string | undefined,
    level: string,
    timestamp: unknown,
    meta: object
  ): Promise<void> {
    const log = {
      message: JSON.stringify({
        traceId: traceId,
        level: level,
        message: message,
        meta: meta,
        timeStamp: timestamp,
      }),
      timestamp: Date.now(),
    };
    this.logBuffer.push(log);

    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(
        () => this.flushLogs(),
        this.flushIntervalMs
      );
    }
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = this.logBuffer;
    this.logBuffer = [];

    const command = new PutLogEventsCommand({
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      logEvents: logsToSend,
      sequenceToken: this.sequenceToken,
    });

    try {
      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;
    } catch (error) {
      console.error("Failed to send logs:", error);
      // Restore the logs in the buffer in case of an error
      this.logBuffer.push(...logsToSend);
    } finally {
      if (this.logBuffer.length > 0) {
        this.flushTimeout = setTimeout(
          () => this.flushLogs(),
          this.flushIntervalMs
        );
      } else {
        this.flushTimeout = null;
      }
    }
  }
}
