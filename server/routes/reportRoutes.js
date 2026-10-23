const express = require('express');
const router = express.Router();
const { getReports, generateReport, downloadReportCSV } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getReports);
router.post('/generate', authorize('admin', 'operations_manager'), generateReport);
router.get('/:id/download', downloadReportCSV);

module.exports = router;
