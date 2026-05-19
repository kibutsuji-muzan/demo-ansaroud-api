const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const reviewsPath = path.join(__dirname, '../demodata/reviews.json');

function loadReviews() {
  if (!fs.existsSync(reviewsPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
  } catch (e) {
    console.error('Error parsing reviews JSON:', e);
    return [];
  }
}

exports.reviewsGet = async (req, res, next) => {
  try {
    const schema = Joi.object({
      product: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
      reviewer: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
      per_page: Joi.number().min(1).max(100).optional(),
      page: Joi.number().min(1).optional()
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    let reviews = loadReviews();

    if (req.query.product) {
      reviews = reviews.filter(r => r.product_id == req.query.product);
    }
    if (req.query.reviewer) {
      reviews = reviews.filter(r => r.reviewer_email === req.query.reviewer || r.reviewer === req.query.reviewer);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 20;
    const start = (page - 1) * perPage;
    reviews = reviews.slice(start, start + perPage);

    return res.status(200).json(reviews);

  } catch (err) {
    next(err);
  }
};

exports.reviewsPost = async (req, res, next) => {
  try {
    const schema = Joi.object({
      product_id: Joi.number().required(),
      review: Joi.string().required(),
      reviewer: Joi.string().required(),
      reviewer_email: Joi.string().email().required(),
      rating: Joi.number().min(1).max(5).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const newReview = {
      id: Math.floor(Math.random() * 1000000) + 1,
      product_id: req.body.product_id,
      status: 'approved',
      reviewer: req.body.reviewer,
      reviewer_email: req.body.reviewer_email,
      review: req.body.review,
      rating: req.body.rating,
      date_created: new Date().toISOString()
    };

    const reviews = loadReviews();
    reviews.push(newReview);

    try {
      fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
    } catch (e) {
      console.error('Error writing reviews JSON:', e);
    }

    return res.status(201).json(newReview);

  } catch (err) {
    next(err);
  }
};