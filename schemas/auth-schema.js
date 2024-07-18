import Joi from "joi";

const userAuthSchema = Joi.object({
  password: Joi.string().min(6).max(20).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least {#limit} characters long",
    "string.max": "Password cannot be longer than {#limit} characters",
  }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Enter a valid email address",
    }),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().required(),
});

const verificationEmailSchema = Joi.object({
  email: Joi.string().required(),
});

export { userAuthSchema, updateSubscriptionSchema, verificationEmailSchema };