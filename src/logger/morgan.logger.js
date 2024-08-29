// import morgan from "morgan";
import morgan from "morgan";
import logger from "./winston.logger.js";

const stream = {
  // Use the http severity
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

const arr = ["correlation-id", "method"];

morgan.token("correlation-id", (req) => {
  return req.correlationId;
});
const morganMiddleware = morgan(
  "- :remote-addr - :method - :url - :status - :response-time ms - correlation-id: :correlation-id'",
  { stream, skip }
);

export default morganMiddleware;
