const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/google', validate.google, authController.google);
router.post('/login', validate.login, authController.login);
router.get('/me', auth.requireAuth, authController.me);

module.exports = router;
