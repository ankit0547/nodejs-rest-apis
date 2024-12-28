import { httpServer } from './app.js';
import { connectDataBase } from './db/index.js';
import AppLogger from './logger/app.logger.js';

/**
 * Starting from Node.js v14 top-level await is available and it is only available in ES modules.
 * This means you can not use it with common js modules or Node version < 14.
 */
const majorNodeVersion = +process.env.NODE_VERSION?.split('.')[0] || 0;

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    AppLogger.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }/docs`,
    );
    AppLogger.info('⚙️  Server is running on port: ' + process.env.PORT);
  });
};

if (majorNodeVersion >= 20) {
  try {
    connectDataBase();
    startServer();
  } catch (err) {
    AppLogger.error('Mongo db connect error: ', err);
  }
} else {
  connectDataBase()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      AppLogger.error('Mongo db connect error: ', err);
    });
}
