import Joi from "joi";

export const registerUserSchema = Joi.object({
  firstName: Joi.string().required().messages({
    "string.empty": "First name is required",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Last name is required",
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
  }),
  address: Joi.allow(),
  role: Joi.string().required().messages({
    "string.empty": "Role is required",
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.number().min(8).required(),
});
