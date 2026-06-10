import Joi from "joi";

export const placeOrderSchema = Joi.object({
  shipping_address: Joi.string().required(),
  primary_phone:    Joi.string().min(7).max(15).required(),
  secondary_phone:  Joi.string().min(7).max(15).optional(),
});