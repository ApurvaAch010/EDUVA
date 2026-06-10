import Joi from "joi"

export const bannerSchema=Joi.object({
    title:Joi.string().required(),
    isActive:Joi.boolean().optional().default(true),
    banner:Joi.required(),
})


export const updateBannerSchema=Joi.object({
    title:Joi.string().optional(),
    isActive:Joi.boolean().optional(),
    banner:Joi.optional(),
})