const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const auth = require('../middleware/auth');

// All order routes likely need authentication
router.get('/', auth.requireAuth, ordersController.orders);
router.get('/:id', ordersController.getOrderById);
router.post('/', ordersController.createOrder);
router.post('/verify', ordersController.verifyPayment);

module.exports = router;
