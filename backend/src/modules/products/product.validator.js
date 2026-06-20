import Joi from "joi";

export const createProductSchema = Joi.object({
  name:           Joi.string().max(255).required(),
  description:    Joi.string().optional(),
  price:          Joi.number().precision(2).positive().required(),
  discount_price: Joi.number().precision(2).min(0).optional(),
  stock:          Joi.number().integer().min(0).required(),
  category_id:    Joi.number().integer().required(),
  is_active: Joi.boolean()
    .truthy("true", "1", 1)
    .falsy("false", "0", 0)
    .default(true),
});
export const updateProductSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  price: Joi.number().precision(2).positive().optional(),
  discount_price: Joi.number().precision(2).min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  category_id: Joi.number().integer().optional(),
  is_active: Joi.boolean()
    .truthy("true", "1", 1)
    .falsy("false", "0", 0)
    .optional(),
});