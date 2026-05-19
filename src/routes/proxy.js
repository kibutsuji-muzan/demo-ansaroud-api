const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Proxy route disabled for demo data mode
router.use(async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, message: "Proxy route disabled in demo mode. No data fetched from WP API." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
