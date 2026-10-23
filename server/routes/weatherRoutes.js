const express = require('express');
const router = express.Router();
const { getCurrentWeather, getWeatherForecast, updateWeather } = require('../controllers/weatherController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.put('/', authorize('admin', 'operations_manager'), updateWeather);

module.exports = router;
