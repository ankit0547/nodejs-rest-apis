import cookieParser from "cookie-parser";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/index.js";
import userRouter from "./route/auth/user.routes.js";
import healthcheckRouter from "./route/healthCheck.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import morganMiddleware from "./logger/morgan.logger.js";
import logger from "./logger/winston.logger.js";
import { v4 as uuidv4 } from "uuid";
const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

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

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

import chatRouter from "./route/chat-app/chat.routers.js";

// app.use(logger);
app.use(morganMiddleware);

app.use("/api/v1/chat-app/chats", chatRouter);

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

// * App apis
app.use("/api/v1/users", userRouter);

// import chatRouter from "./routes/apps/chat-app/chat.routes.js";
// import messageRouter from "./routes/apps/chat-app/message.routes.js";

initializeSocketIO(io);

// common error handling middleware
app.use(errorHandler);

export { httpServer };
