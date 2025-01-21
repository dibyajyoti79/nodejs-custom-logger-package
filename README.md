````markdown
# Bookingjini Logger Package

A versatile logging library tailored for Bookingjini, offering robust logging functionalities with support for console, file, and AWS CloudWatch. Designed to be easy to use and scalable for various projects within the organization.

---

## Features

- **Console Logging**: Outputs logs to the console.
- **File Logging**: Saves logs to rotating daily files.
- **CloudWatch Logging**: Sends logs to AWS CloudWatch.
- **Customizable Log Levels**: Supports `info`, `error`, and `warn` levels.
- **Trace ID Support**: Includes trace IDs for better debugging and traceability.
- **Request Logging**: Middleware for logging detailed HTTP request and response data.

---

## Installation

Install the package via npm:

```bash
npm install @bookingjini/logger
```
````

---

## Usage

### 1. Creating a Logger

To create an application-wide logger, use the `createAppLogger` function with a configuration object.

```typescript
import { createAppLogger } from "bj-logger-toolkit";

const logger = createAppLogger({
  console: {
    enabled: true,
  },
  file: {
    enabled: true,
    options: {
      dirname: "logs/application",
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    },
  },
  cloudWatch: {
    enabled: true,
    options: {
      region: "us-east-1",
      accessKeyId: "your-access-key",
      secretAccessKey: "your-secret-key",
      logGroupName: "application-logs",
      logStreamName: "app-stream",
    },
  },
});
```

---

### 2. Logging Messages

The logger provides leveled logging methods:

```typescript
logger.info("Application started successfully");
logger.error({
  message: "An error occurred",
  traceId: "12345",
  meta: { key: "value" },
});
logger.warn("This is a warning message");
```

---

### 3. Request Logging Middleware

Use the `requestLogger` middleware to log HTTP requests and responses in your Express application.

```typescript
import express from "express";
import { requestLogger } from "@bookingjini/logger";

const app = express();

app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Hello, Bookingjini!");
});

app.listen(3000, () => console.log("Server is running on port 3000"));
```

---

### 4. AWS CloudWatch Integration

Configure CloudWatch in the `LoggerConfig` to enable log streaming to AWS:

```typescript
const logger = createAppLogger({
  cloudWatch: {
    enabled: true,
    options: {
      region: "your-region",
      accessKeyId: "your-access-key-id",
      secretAccessKey: "your-secret-access-key",
      logGroupName: "your-log-group",
      logStreamName: "your-log-stream",
    },
  },
});
```

---

## Configuration Options

The logger accepts the following configuration options:

### `LoggerConfig`

| Option       | Type                   | Description                           |
| ------------ | ---------------------- | ------------------------------------- |
| `console`    | `{ enabled: boolean }` | Enable/disable console logging.       |
| `file`       | `FileTransportConfig`  | Configure file-based logging.         |
| `cloudWatch` | `CloudWatchConfig`     | Configure AWS CloudWatch integration. |

### `CloudWatchConfig`

| Field             | Type     | Description                        |
| ----------------- | -------- | ---------------------------------- |
| `region`          | `string` | AWS region.                        |
| `accessKeyId`     | `string` | AWS access key ID.                 |
| `secretAccessKey` | `string` | AWS secret access key.             |
| `logGroupName`    | `string` | Name of the CloudWatch log group.  |
| `logStreamName`   | `string` | Name of the CloudWatch log stream. |

---

## Example Project

Here’s an example integrating all features:

```typescript
import { createAppLogger, requestLogger } from "@bookingjini/logger";
import express from "express";

const logger = createAppLogger({
  console: { enabled: true },
  file: { enabled: true, options: { dirname: "logs" } },
  cloudWatch: {
    enabled: true,
    options: {
      region: "us-east-1",
      accessKeyId: "your-access-key",
      secretAccessKey: "your-secret-key",
      logGroupName: "example-logs",
      logStreamName: "example-stream",
    },
  },
});

const app = express();

app.use(requestLogger);

app.get("/", (req, res) => {
  logger.info("Root endpoint hit");
  res.send("Welcome to Bookingjini Logger!");
});

app.listen(3000, () => {
  logger.info("Server running on port 3000");
});
```

---

## License

This package is an internal tool developed by Bookingjini and is not meant for public use.

---
