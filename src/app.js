import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import healthcheckRouter from './route/healthCheck.js';
import HTTPLoggerMiddleware from './logger/http.logger.js';
import { Server } from 'socket.io';

import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

import {
  loadSwaggerDocument,
  swaggerMiddleware,
  watchSwaggerFile,
} from './middlewares/swagger.middleware.js';

// Load the correct .env file based on the NODE_ENV variable
const envFile = process.env.NODE_ENV || 'development'; // default to development
dotenv.config({
  path: path.resolve(`config/.env.${envFile}`),
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Initialize Swagger
loadSwaggerDocument();
// Watch for changes in the Swagger file
watchSwaggerFile();

// Serve Swagger documentation
// Use Swagger UI middleware
app.use('/docs', swaggerUi.serve, swaggerMiddleware);

// Middleware to set correlation ID and other headers
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type',
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === '*'
        ? '*' // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(','), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  }),
);

app.use(express.json({ limit: '16kb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public')); // configure static file to save images locally
app.use(cookieParser());

// app.use(logger());
app.use(HTTPLoggerMiddleware);

io.on('connection', (socket) => {
  AppLogger.info('A user connected:', socket.id);

  socket.on('send_message', (data) => {
    io.to(data.to).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    AppLogger.info('User disconnected');
  });
});

// Import all routes
import userRouter from './route/user/user.routes.js';
import authRouter from './route/auth/auth.routes.js';
import groupRoutes from './route/group/group.routes.js';
import messageRoutes from './route/message/message.routes.js';
import AppLogger from './logger/app.logger.js';

// * healthcheck
app.use('/api/v1/healthcheck', healthcheckRouter);

// * App apis
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/groups', groupRoutes);
app.use('/messages', messageRoutes);

// common error handling middleware
app.use(errorHandler);

export { app, httpServer };
