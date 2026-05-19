// src/routes/products.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const reviewsController = require('../controllers/reviewsController');


router.get('/', productsController.products);

router.get('/categories', productsController.categories);
router.get('/tags', productsController.tags);

router.route('/reviews')
  .get(reviewsController.reviewsGet)
  .post(reviewsController.reviewsPost);
// router.post('/reviews', productsController.reviewsPost);

router.get('/:id', productsController.productById);

module.exports = router;
