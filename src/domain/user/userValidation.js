const Joi = require('joi');

module.exports = class userValidation {
  validateUserObject(user) {
    const userSchema = Joi.object({
      id: Joi.string().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      NPI: Joi.string().length(10),
      orgSk: Joi.number().required(),
      phone: Joi.string(),
      address: Joi.object().keys({
        street1: Joi.string().required(),
        street2: Joi.string(),
        city: Joi.string().required(),
        state: Joi.string()
          .length(2)
          .required(),
        zip: Joi.string().length(5),
        type: Joi.any().allow(0, 1)
      }),
      directEmail: Joi.string().email(),
      directId: Joi.any(),
      healthshareId: Joi.any(),
      providerId: Joi.string(),
      groups: Joi.array().items(Joi.string())
    });
    const result = Joi.validate(user, userSchema);
    if (result.error) return Promise.reject(new Error(result.error));
    return Promise.resolve(result);
  }
};
