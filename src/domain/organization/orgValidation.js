const Joi = require('joi');

module.exports = class orgValidation {
  validateOrgObject(org) {
    const orgSchema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      NPI: Joi.string().length(10),
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
      kind: Joi.number().allow(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
      directId: Joi.any(),
      gisLat: Joi.number(),
      gisLng: Joi.number(),
      directDomain: Joi.string()
    });
    const result = Joi.validate(org, orgSchema);
    if (result.error) return Promise.reject(new Error(result.error));
    return Promise.resolve(result);
  }
};
