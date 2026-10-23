const Vessel = require('../models/Vessel');

// @desc    Get all vessels
// @route   GET /api/vessels
// @access  Private
const getVessels = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (type && type !== 'ALL') {
      query.type = type;
    }

    const vessels = await Vessel.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: vessels.length,
      data: vessels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vessel
// @route   GET /api/vessels/:id
// @access  Private
const getVesselById = async (req, res, next) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }
    res.json({ success: true, data: vessel });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vessel
// @route   POST /api/vessels
// @access  Private (Admin / Ops)
const createVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.create(req.body);
    res.status(201).json({ success: true, data: vessel });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vessel (status, location, assigned turbine, etc.)
// @route   PUT /api/vessels/:id
// @access  Private (Admin / Ops)
const updateVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }

    res.json({ success: true, data: vessel });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign turbine to vessel
// @route   POST /api/vessels/:id/assign
// @access  Private (Admin / Ops)
const assignTurbineToVessel = async (req, res, next) => {
  try {
    const { turbineId, eta, status } = req.body;
    const vessel = await Vessel.findById(req.params.id);

    if (!vessel) {
      return res.status(404).json({ success: false, message: 'Vessel not found' });
    }

    vessel.assignedTurbine = turbineId || 'None';
    if (eta) vessel.eta = eta;
    if (status) vessel.status = status;

    await vessel.save();
    res.json({ success: true, data: vessel });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVessels,
  getVesselById,
  createVessel,
  updateVessel,
  assignTurbineToVessel,
};
