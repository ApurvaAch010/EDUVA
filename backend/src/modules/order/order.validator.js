import Joi from "joi";

export const placeOrderSchema = Joi.object({
  shipping_address: Joi.string().required(),
  primary_phone: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Primary phone number must be exactly 10 digits",
      "string.empty": "Primary phone number is required"
    }),
  secondary_phone: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .allow("", null)
    .messages({
      "string.pattern.base": "Secondary phone number must be exactly 10 digits"
    }),
  payment_method: Joi.string().valid("COD").optional(),
});