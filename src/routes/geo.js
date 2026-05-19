const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

router.get('/countries', geoController.countries);
router.get('/countries/:countryCode', geoController.countryByCode);
router.get('/states/:countryId', geoController.statesByCountry);
router.get('/cities/:stateId', geoController.citiesByState);

module.exports = router;
