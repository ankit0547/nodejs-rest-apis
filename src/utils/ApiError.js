/**
 * @description Common Error class to throw an error from anywhere.
 * The {@link errorHandler} middleware will catch this error at the central place and it will return an appropriate response to the client
 */
class ApiError extends Error {
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {any[]} errors
   * @param {string} stack
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    multipleErrors = [],
    success,
    stack = ""
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message;

    this.multipleErrors = multipleErrors.map((err) => ({
      errorKey: err.path[0],
      errorMessage: err.message,
    }));
    this.success = false;

    if (stack && process.env.NODE_ENV === "development") {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
