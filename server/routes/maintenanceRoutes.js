const express = require('express');
const router = express.Router();
const {
  getMaintenanceTasks,
  getMaintenanceSummary,
  getMaintenanceById,
  createMaintenanceTask,
  updateMaintenanceTask,
  addMaintenanceNote,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getMaintenanceTasks);
router.get('/summary', getMaintenanceSummary);
router.get('/:id', getMaintenanceById);

router.post('/', authorize('admin', 'operations_manager', 'maintenance_engineer'), createMaintenanceTask);
router.put('/:id', authorize('admin', 'operations_manager', 'maintenance_engineer'), updateMaintenanceTask);
router.post('/:id/notes', authorize('admin', 'operations_manager', 'maintenance_engineer'), addMaintenanceNote);

module.exports = router;
