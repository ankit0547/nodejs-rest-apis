import Joi from "joi";

export const registerUserSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    "string.min": "username length must be at least 3 characters long",
  }),
  email: Joi.string().email().required(),
  password: Joi.number().min(8).required(),
});
export const loginUserSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    "string.min": "username length must be at least 3 characters long",
  }),
  password: Joi.number().min(8).required(),
});
