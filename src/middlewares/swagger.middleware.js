import fs from 'fs';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import AppLogger from '../logger/app.logger.js';

import path from 'node:path';
import { fileURLToPath } from 'url';

// Utility function to get __filename and __dirname
const getModulePaths = (metaUrl = null) => {
  const __filename = metaUrl
    ? fileURLToPath(metaUrl)
    : path.join(process.cwd(), 'src', 'middlewares', 'swagger.middleware.js');

  const __dirname = path.dirname(__filename);
  return { __filename, __dirname };
};

const { __dirname } = getModulePaths();

// // Initialize variables
const swaggerFilePath = path.resolve(__dirname, '../swagger.yaml');

let swaggerDocument;

// Function to load Swagger file
export const loadSwaggerDocument = () => {
  try {
    swaggerDocument = YAML.load(swaggerFilePath);
    AppLogger.info('Swagger file loaded successfully.');
  } catch (error) {
    AppLogger.error('Failed to load Swagger file:', error);
    swaggerDocument = null; // Reset to avoid serving stale data
  }
};

let swaggerFileWatcher;
// Watch for changes in the Swagger file
export const watchSwaggerFile = () => {
  swaggerFileWatcher = fs.watch(swaggerFilePath, (eventType) => {
    if (eventType === 'change') {
      AppLogger.info('Swagger file updated. Reloading...');
      loadSwaggerDocument();
    }
  });
};

// Function to stop the watcher
export const stopWatchingSwaggerFile = () => {
  if (swaggerFileWatcher) {
    swaggerFileWatcher.close();
    AppLogger.info('Stopped watching Swagger file.');
  }
};

// Middleware to serve Swagger UI with dynamic reloading
export const swaggerMiddleware = (req, res, next) => {
  if (!swaggerDocument) {
    return res
      .status(500)
      .json({ error: 'Swagger documentation is unavailable' });
  }
  swaggerUi.setup(swaggerDocument)(req, res, next);
};
