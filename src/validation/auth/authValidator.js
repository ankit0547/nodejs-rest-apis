import { globalconstants } from "../../constants.js";
import { ApiError } from "../../utils/ApiError.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new ApiError(
        globalconstants.responseFlags.VALIDATION_FAILED,
        "Validation Error",
        error.details[0].message
      );
    }
    next();
  };
};
