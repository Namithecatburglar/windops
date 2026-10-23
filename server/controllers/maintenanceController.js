const Maintenance = require('../models/Maintenance');

// @desc    Get all maintenance work orders with filtering & search
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceTasks = async (req, res, next) => {
  try {
    const { status, priority, turbine, search } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (turbine && turbine !== 'ALL') {
      query.turbine = turbine;
    }

    if (search) {
      query.$or = [
        { workOrderId: { $regex: search, $options: 'i' } },
        { turbine: { $regex: search, $options: 'i' } },
        { issue: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Maintenance.find(query).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance summary counts (overdue, in progress, etc.)
// @route   GET /api/maintenance/summary
// @access  Private
const getMaintenanceSummary = async (req, res, next) => {
  try {
    const tasks = await Maintenance.find({});
    const total = tasks.length;
    const scheduled = tasks.filter((t) => t.status === 'Scheduled').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter((t) => t.status === 'Overdue').length;
    const critical = tasks.filter((t) => t.priority === 'Critical' && t.status !== 'Completed').length;

    res.json({
      success: true,
      data: {
        total,
        scheduled,
        inProgress,
        completed,
        overdue,
        critical,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance work order
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceById = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const query = identifier.startsWith('WO-') ? { workOrderId: identifier } : { _id: identifier };
    const task = await Maintenance.findOne(query);

    if (!task) {
      return res.status(404).json({ success: false, message: `Work order ${identifier} not found` });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new maintenance work order
// @route   POST /api/maintenance
// @access  Private (Admin / Ops / Tech)
const createMaintenanceTask = async (req, res, next) => {
  try {
    let { workOrderId, turbine, issue, description, priority, assignedTo, scheduledDate, status, vesselRequired, estimatedHours, notes } = req.body;

    if (!workOrderId) {
      const count = await Maintenance.countDocuments();
      workOrderId = `WO-${1000 + count + 1}`;
    }

    const task = await Maintenance.create({
      workOrderId,
      turbine,
      issue,
      description: description || '',
      priority: priority || 'Medium',
      assignedTo,
      scheduledDate: scheduledDate || new Date(),
      status: status || 'Scheduled',
      vesselRequired: vesselRequired || 'None',
      estimatedHours: estimatedHours || 4,
      notes: notes ? [{ text: notes, author: req.user.name }] : [],
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance work order
// @route   PUT /api/maintenance/:id
// @access  Private
const updateMaintenanceTask = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const query = identifier.startsWith('WO-') ? { workOrderId: identifier } : { _id: identifier };

    if (req.body.status === 'Completed' && !req.body.completedAt) {
      req.body.completedAt = new Date();
    }

    const task = await Maintenance.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: `Work order ${identifier} not found` });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to maintenance work order
// @route   POST /api/maintenance/:id/notes
// @access  Private
const addMaintenanceNote = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const query = identifier.startsWith('WO-') ? { workOrderId: identifier } : { _id: identifier };

    const task = await Maintenance.findOne(query);
    if (!task) {
      return res.status(404).json({ success: false, message: `Work order ${identifier} not found` });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    task.notes.push({
      author: req.user.name || 'Operator',
      text,
      timestamp: new Date(),
    });

    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceTasks,
  getMaintenanceSummary,
  getMaintenanceById,
  createMaintenanceTask,
  updateMaintenanceTask,
  addMaintenanceNote,
};
