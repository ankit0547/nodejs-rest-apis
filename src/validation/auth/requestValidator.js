import { globalconstants } from '../../constants.js';
import { ApiError } from '../../utils/ApiError.js';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });

      if (error) {
        throw new ApiError(
          globalconstants.responseFlags.VALIDATION_FAILED,
          'Validation Failed',
          error.details,
        );
      }

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  };
};
