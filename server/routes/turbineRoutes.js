const express = require('express');
const router = express.Router();
const {
  getTurbines,
  getTurbineById,
  getTurbineSummary,
  createTurbine,
  updateTurbine,
  deleteTurbine,
} = require('../controllers/turbineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getTurbines);
router.get('/summary/kpi', getTurbineSummary);
router.get('/:id', getTurbineById);

router.post('/', authorize('admin', 'operations_manager'), createTurbine);
router.put('/:id', authorize('admin', 'operations_manager', 'maintenance_engineer'), updateTurbine);
router.delete('/:id', authorize('admin'), deleteTurbine);

module.exports = router;
