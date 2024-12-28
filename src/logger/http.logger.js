import morgan from 'morgan';
import AppLogger from './app.logger.js';

const stream = {
  // Use the http severity
  write: (message) => AppLogger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

morgan.token('correlation-id', (req) => {
  return req.correlationId;
});
const HTTPLoggerMiddleware = morgan(
  "- :remote-addr - :method - :url - :status - :response-time ms - correlation-id: :correlation-id'",
  { stream, skip },
);

export default HTTPLoggerMiddleware;
