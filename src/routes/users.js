const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/auth');

router.get('/', auth.requireAuth, usersController.listUsers);
router.get('/:id', auth.requireAuth, usersController.getUserById);
router.put('/:id', auth.requireAuth, usersController.updateUser);
router.delete('/:id', auth.requireAuth, usersController.deleteUser);

module.exports = router;
