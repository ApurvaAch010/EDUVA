import Joi from "joi"

export const bannerSchema=Joi.object({
    title:Joi.string().required(),
    isActive: Joi.boolean()
        .truthy("true", "1", 1)
        .falsy("false", "0", 0)
        .optional(),
    description:Joi.string().optional(),
    banner:Joi.required(),
})


export const updateBannerSchema=Joi.object({
    title:Joi.string().optional(),
    isActive: Joi.boolean()
        .truthy("true", "1", 1)
        .falsy("false", "0", 0)
        .optional(),
    description:Joi.string().optional(),
    banner:Joi.optional(),
})