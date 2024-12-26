import cookieParser from "cookie-parser";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import healthcheckRouter from "./route/healthCheck.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import HTTPLoggerMiddleware from "./logger/http.logger.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
const app = express();
import { fileURLToPath } from "url";
import path from "path";

// Get the current directory (similar to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const httpServer = createServer(app);

let swaggerDocument;
const swaggerFilePath = path.resolve(__dirname, "swagger.yaml");

const loadSwaggerDocument = () => {
  try {
    swaggerDocument = YAML.load(swaggerFilePath);
    AppLogger.info("Swagger file loaded successfully.");
  } catch (error) {
    AppLogger.error("Failed to load Swagger file:", error);
  }
};

// // Initial load
loadSwaggerDocument();

// Watch for changes using fs.watch
fs.watch(swaggerFilePath, (eventType) => {
  if (eventType === "change") {
    AppLogger.info("Swagger file updated. Reloading...");
    loadSwaggerDocument();
  }
});

// Serve Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware to set correlation ID and other headers
app.use((req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb", strict: false }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// app.use(logger());
app.use(HTTPLoggerMiddleware);

// Import all routes
import userRouter from "./route/user/user.routes.js";
import authRouter from "./route/auth/auth.routes.js";
import AppLogger from "./logger/app.logger.js";

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// * App apis
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

// common error handling middleware
app.use(errorHandler);

export { app, httpServer };
