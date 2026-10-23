const express = require('express');
const router = express.Router();
const { getPerformanceAnalytics } = require('../controllers/performanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPerformanceAnalytics);

module.exports = router;
