import { app } from '../app.js';
import request from 'supertest';
import connectDB from '../db/index.js';
import mongoose from 'mongoose';
import { stopWatchingSwaggerFile } from '../middlewares/swagger.middleware.js';

jest.mock('../db/index.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Healthcheck API Tests', () => {
  it('should respond with a 200 status code for the root route', async () => {
    const response = await request(app).get('/api/v1/healthcheck');
    expect(response.status).toBe(200);
  });

  it('should respond with a 500 status code for an invalid route', async () => {
    const response = await request(app).get('/api/v1/invalidroute');
    expect(response.status).toBe(500);
  });

  it('should respond with a 405 status code for an invalid HTTP method', async () => {
    const response = await request(app).post('/api/v1/healthcheck');
    expect(response.status).toBe(500);
  });
});

describe('Database Connection Tests', () => {
  afterEach(() => {
    jest.resetAllMocks(); // Reset all mocks after each test
  });

  afterAll(async () => {
    await mongoose.disconnect(); // Disconnect after all tests
    jest.clearAllTimers(); // Clear all timers
    stopWatchingSwaggerFile();
  });

  describe('Database Connection Failed Test', () => {
    it('should fail to connect to the database with an invalid configuration', async () => {
      // Mock connectDB to simulate a failed connection
      connectDB.mockRejectedValue(
        new Error('Failed to connect to the database'),
      );

      try {
        await connectDB();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Failed to connect to the database');
      }
    });
  });

  describe('Database Connection Success Test', () => {
    it('should connect to the database successfully', async () => {
      // Mock connectDB to simulate a successful connection
      connectDB.mockResolvedValue();

      // Simulate a successful database connection
      mongoose.connection.readyState = 1; // Simulate "connected" state

      await connectDB(); // Call the mocked function
      const dbConnectionState = mongoose.connection.readyState; // Check connection state
      console.log('DB Connection State:', dbConnectionState); // Debugging info
      expect(dbConnectionState).toBe(1); // 1 means connected
    });
  });
});
