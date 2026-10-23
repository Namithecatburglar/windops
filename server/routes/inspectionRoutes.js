const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspectionSummary,
  getInspectionById,
  createInspection,
  updateInspection,
} = require('../controllers/inspectionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getInspections);
router.get('/summary', getInspectionSummary);
router.get('/:id', getInspectionById);

router.post('/', authorize('admin', 'operations_manager', 'maintenance_engineer', 'inspector'), createInspection);
router.put('/:id', authorize('admin', 'operations_manager', 'maintenance_engineer', 'inspector'), updateInspection);

module.exports = router;
