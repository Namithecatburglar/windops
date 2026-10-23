const Alert = require('../models/Alert');

// @desc    Get all alerts with filtering & search
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res, next) => {
  try {
    const { severity, status, turbine, search } = req.query;
    const query = {};

    if (severity && severity !== 'ALL') {
      query.severity = severity;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (turbine && turbine !== 'ALL') {
      query.turbine = turbine;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { turbine: { $regex: search, $options: 'i' } },
      ];
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alert summary counts
// @route   GET /api/alerts/summary
// @access  Private
const getAlertSummary = async (req, res, next) => {
  try {
    const alerts = await Alert.find({});
    const active = alerts.filter((a) => a.status === 'Active').length;
    const critical = alerts.filter((a) => a.status === 'Active' && a.severity === 'Critical').length;
    const warning = alerts.filter((a) => a.status === 'Active' && a.severity === 'Warning').length;
    const acknowledged = alerts.filter((a) => a.status === 'Acknowledged').length;
    const resolved = alerts.filter((a) => a.status === 'Resolved').length;

    res.json({
      success: true,
      data: {
        total: alerts.length,
        active,
        critical,
        warning,
        acknowledged,
        resolved,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'Acknowledged';
    alert.acknowledgedBy = req.user?.name || 'Duty Operator';
    alert.acknowledgedAt = new Date();

    await alert.save();
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'Resolved';
    alert.resolvedBy = req.user?.name || 'Duty Operator';
    alert.resolvedAt = new Date();

    await alert.save();
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Create alert manually or via telemetry
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlertSummary,
  acknowledgeAlert,
  resolveAlert,
  createAlert,
};
