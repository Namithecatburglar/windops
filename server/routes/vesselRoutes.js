const express = require('express');
const router = express.Router();
const {
  getVessels,
  getVesselById,
  createVessel,
  updateVessel,
  assignTurbineToVessel,
} = require('../controllers/vesselController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getVessels);
router.get('/:id', getVesselById);
router.post('/', authorize('admin', 'operations_manager'), createVessel);
router.put('/:id', authorize('admin', 'operations_manager'), updateVessel);
router.post('/:id/assign', authorize('admin', 'operations_manager'), assignTurbineToVessel);

module.exports = router;
