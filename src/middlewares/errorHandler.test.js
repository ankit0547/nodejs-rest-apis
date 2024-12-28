import { errorHandler } from './errorHandler.middleware.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

describe('errorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle an ApiError and return the correct response', () => {
    const error = new ApiError(404, 'Not Found');
    errorHandler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should convert a generic error into an ApiError with status 500', () => {
    const error = new ApiError(500, 'Generic error');
    errorHandler(error, req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Generic error',
        statusCode: 500,
      }),
    );
  });

  it('should handle mongoose errors with a 400 status code', () => {
    const error = new mongoose.Error('Mongoose validation error');
    errorHandler(error, req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Mongoose validation error',
      }),
    );
  });

  it('should include the stack trace in the response in development mode', () => {
    const error = new Error('Development error');
    process.env.NODE_ENV = 'development';

    errorHandler(error, req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      }),
    );

    process.env.NODE_ENV = 'test'; // Reset the environment
  });

  it('should not include the stack trace in the response in production mode', () => {
    const error = new Error('Production error');
    process.env.NODE_ENV = 'production';

    errorHandler(error, req, res);

    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      }),
    );

    process.env.NODE_ENV = 'test'; // Reset the environment
  });
});
