const express = require('express');
const router = express.Router();
const { triggerTick } = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');

router.post('/tick', protect, triggerTick);

module.exports = router;
