import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import AppLogger from '../logger/app.logger.js';

const dbOptions = {};
const MONGODB_URI = `${process.env.MONGODB_URI}/${DB_NAME}`;

const connectDB = async (
  uri,
  options,
  maxRetries = 5,
  retryInterval = 3000,
) => {
  let attempts = 0;

  const connect = async () => {
    try {
      attempts++;
      AppLogger.info(`Attempt ${attempts} to connect to MongoDB...`);
      await mongoose.connect(uri, options);
      AppLogger.info('MongoDB connected successfully!');
    } catch (error) {
      AppLogger.error(
        `MongoDB connection attempt ${attempts} failed:`,
        error.message,
      );

      if (attempts < maxRetries) {
        AppLogger.log(
          'error',
          `Retrying in ${retryInterval / 1000} seconds...`,
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        await connect();
      } else {
        AppLogger.error('Max retries reached. Unable to connect to MongoDB.');
        throw new Error('Failed to connect to MongoDB after maximum retries.');
      }
    }
  };

  await connect();
};

export const connectDataBase = async () => {
  try {
    await connectDB(MONGODB_URI, dbOptions, 5, 2000); // 5 retries with 2 seconds interval
  } catch (error) {
    AppLogger.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};
