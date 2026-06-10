import Joi from "joi";

export const updateUserSchema = Joi.object({
  username:     Joi.string().min(3).max(30).optional(),
  email:        Joi.string().email().optional(),
  organization: Joi.string().optional(),
  role:         Joi.string().valid("user", "admin","mod").optional(),
});