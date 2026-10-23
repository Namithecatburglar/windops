const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertSummary,
  acknowledgeAlert,
  resolveAlert,
  createAlert,
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.post('/', createAlert);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
