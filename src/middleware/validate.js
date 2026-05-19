const Joi = require('joi');

exports.google = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    photo: Joi.string().allow('', null),
    name: Joi.string().max(100).required(),
    google_id: Joi.string().max(30).required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

exports.login = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};


