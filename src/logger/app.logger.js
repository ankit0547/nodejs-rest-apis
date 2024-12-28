import winston from 'winston';

// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);

// Chose the aspect of your log customizing the log format.
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'DD MMM, YYYY - HH:mm:ss:ms' }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports

const transports = () => {
  let transports = [];
  if (process.env.NODE_ENV === 'development') {
    transports.push(new winston.transports.Console());
  } else {
    transports.push(new winston.transports.Console());
    transports.push(new winston.transports.File({ filename: 'combined.log' }));
  }
  return transports;
};

// Create the logger instance using the Singleton pattern
class Logger {
  constructor() {
    if (!Logger.instance) {
      Logger.instance = this;
      this.logger = winston.createLogger({
        level: level(), // default log level
        levels,
        format,
        transports: transports(),
      });
    }
    return Logger.instance;
  }

  // Log messages with different log levels
  log(level, message, metadata = {}) {
    this.logger.log(level, message, metadata);
  }

  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
  }

  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }

  error(message, metadata = {}) {
    this.log('error', message, metadata);
  }

  http(message, metadata = {}) {
    this.log('http', message, metadata);
  }
}

// Export the logger instance
const AppLogger = new Logger();
export default AppLogger;
