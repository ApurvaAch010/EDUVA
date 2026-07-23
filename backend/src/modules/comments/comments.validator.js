import Joi from "joi";

export const addCommentSchema=Joi.object({
    comment:Joi.string().required().messages({"any.required":"comment is required"}),
})