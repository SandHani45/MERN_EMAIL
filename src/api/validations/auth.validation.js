const Joi = require('@hapi/joi')

module.exports = {
  // POST /auth/register
  register : Joi.object({
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
      .required()
      .min(3)
      .max(20),
    mobile: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999),
    username: Joi.string()
      .min(3)
      .max(16)
  }),
  // POST /auth/login
  login: Joi.object({
      email: Joi.string().required(),
      password: Joi.string()
        .required()
        .max(20)
    }),
  // POST /auth/refresh
  refresh: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      refreshToken: Joi.string().required()
  }),
  // POST /auth/Mobile
  mobileNumber: Joi.object({
    mobile: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999)
      .required()
  }),
};