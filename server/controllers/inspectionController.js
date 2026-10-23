const Inspection = require('../models/Inspection');

// @desc    Get all inspections with filtering & search
// @route   GET /api/inspections
// @access  Private
const getInspections = async (req, res, next) => {
  try {
    const { status, type, turbine, search } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (turbine && turbine !== 'ALL') {
      query.turbine = turbine;
    }

    if (search) {
      query.$or = [
        { inspectionId: { $regex: search, $options: 'i' } },
        { turbine: { $regex: search, $options: 'i' } },
        { inspector: { $regex: search, $options: 'i' } },
        { findings: { $regex: search, $options: 'i' } },
      ];
    }

    const inspections = await Inspection.find(query).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inspection summary statistics
// @route   GET /api/inspections/summary
// @access  Private
const getInspectionSummary = async (req, res, next) => {
  try {
    const inspections = await Inspection.find({});
    const total = inspections.length;
    const scheduled = inspections.filter((i) => i.status === 'SCHEDULED').length;
    const inProgress = inspections.filter((i) => i.status === 'IN PROGRESS').length;
    const completed = inspections.filter((i) => i.status === 'COMPLETED').length;
    const overdue = inspections.filter((i) => i.status === 'OVERDUE').length;

    const byType = {};
    inspections.forEach((i) => {
      byType[i.type] = (byType[i.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        inProgress,
        completed,
        overdue,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inspection by ID
// @route   GET /api/inspections/:id
// @access  Private
const getInspectionById = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const query = identifier.startsWith('INS-') ? { inspectionId: identifier } : { _id: identifier };
    const inspection = await Inspection.findOne(query);

    if (!inspection) {
      return res.status(404).json({ success: false, message: `Inspection ${identifier} not found` });
    }

    res.json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule new inspection
// @route   POST /api/inspections
// @access  Private (Admin / Ops / Inspector / Tech)
const createInspection = async (req, res, next) => {
  try {
    let { inspectionId, turbine, type, inspector, scheduledDate, status, method, findings, severityFound, notes } = req.body;

    if (!inspectionId) {
      const count = await Inspection.countDocuments();
      inspectionId = `INS-${2000 + count + 1}`;
    }

    const inspection = await Inspection.create({
      inspectionId,
      turbine,
      type,
      inspector: inspector || req.user.name,
      scheduledDate: scheduledDate || new Date(),
      status: status || 'SCHEDULED',
      method: method || 'Visual Walkthrough',
      findings: findings || 'Pending initial execution.',
      severityFound: severityFound || 'None',
      notes: notes ? [{ text: notes, author: req.user.name }] : [],
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inspection (findings, status, notes)
// @route   PUT /api/inspections/:id
// @access  Private
const updateInspection = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const query = identifier.startsWith('INS-') ? { inspectionId: identifier } : { _id: identifier };

    if (req.body.status === 'COMPLETED' && !req.body.completedAt) {
      req.body.completedAt = new Date();
    }

    const inspection = await Inspection.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!inspection) {
      return res.status(404).json({ success: false, message: `Inspection ${identifier} not found` });
    }

    res.json({ success: true, data: inspection });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInspections,
  getInspectionSummary,
  getInspectionById,
  createInspection,
  updateInspection,
};
