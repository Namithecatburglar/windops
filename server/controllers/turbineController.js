const Turbine = require('../models/Turbine');

// Helper to generate 24h history if missing or sparse
const ensureHistory = (turbine) => {
  if (turbine.historicalLog && turbine.historicalLog.length >= 24) {
    return turbine.historicalLog;
  }
  const history = [];
  const now = Date.now();
  const basePower = turbine.powerOutput || 6.5;
  const baseWind = turbine.windSpeed || 12.0;

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000);
    const hourFactor = Math.sin((24 - i) / 3) * 0.8;
    const noise = (Math.random() - 0.5) * 0.4;
    const pOut = Math.max(0, Math.min(turbine.capacity, +(basePower + hourFactor + noise).toFixed(2)));
    const wSpeed = Math.max(2, +(baseWind + hourFactor * 0.6 + noise * 0.5).toFixed(1));
    const rSpeed = pOut > 0 ? +(8.0 + (pOut / turbine.capacity) * 3.5).toFixed(1) : 0;
    const genTemp = Math.round(58 + (pOut / turbine.capacity) * 16 + (Math.random() - 0.5) * 2);
    const gearTemp = Math.round(52 + (pOut / turbine.capacity) * 14 + (Math.random() - 0.5) * 2);
    const vib = +(1.2 + (pOut / turbine.capacity) * 0.8 + (Math.random() - 0.5) * 0.2).toFixed(2);

    history.push({
      timestamp: time,
      powerOutput: pOut,
      windSpeed: wSpeed,
      rotorSpeed: rSpeed,
      generatorTemp: genTemp,
      gearboxTemp: gearTemp,
      vibration: vib,
    });
  }
  return history;
};

// @desc    Get all turbines with filtering, search & sorting
// @route   GET /api/turbines
// @access  Private
const getTurbines = async (req, res, next) => {
  try {
    const { status, search, zone, sort = 'turbineId', order = 'asc' } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (zone && zone !== 'ALL') {
      query['location.zone'] = zone;
    }

    if (search) {
      query.$or = [
        { turbineId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;

    const turbines = await Turbine.find(query).sort(sortOption).select('-historicalLog');

    res.json({
      success: true,
      count: turbines.length,
      data: turbines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single turbine by turbineId or ID with full 24h telemetry history
// @route   GET /api/turbines/:id
// @access  Private
const getTurbineById = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    let turbine;

    if (identifier.startsWith('WT-')) {
      turbine = await Turbine.findOne({ turbineId: identifier });
    } else {
      turbine = await Turbine.findById(identifier);
    }

    if (!turbine) {
      return res.status(404).json({ success: false, message: `Turbine ${identifier} not found` });
    }

    const history = ensureHistory(turbine);

    const turbineObj = turbine.toObject();
    turbineObj.historicalLog = history;

    res.json({
      success: true,
      data: turbineObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fleet operational summary KPIs
// @route   GET /api/turbines/summary/kpi
// @access  Private
const getTurbineSummary = async (req, res, next) => {
  try {
    const turbines = await Turbine.find({});
    const total = turbines.length;
    const online = turbines.filter((t) => t.status === 'ONLINE').length;
    const maintenance = turbines.filter((t) => t.status === 'MAINTENANCE').length;
    const warning = turbines.filter((t) => t.status === 'WARNING').length;
    const offline = turbines.filter((t) => t.status === 'OFFLINE').length;

    const totalPower = turbines.reduce((sum, t) => sum + (t.status === 'ONLINE' || t.status === 'WARNING' ? t.powerOutput : 0), 0);
    const totalCapacity = turbines.reduce((sum, t) => sum + t.capacity, 0);
    const avgWindSpeed = turbines.length ? +(turbines.reduce((sum, t) => sum + t.windSpeed, 0) / turbines.length).toFixed(1) : 0;
    const avgHealth = turbines.length ? Math.round(turbines.reduce((sum, t) => sum + t.healthScore, 0) / turbines.length) : 0;
    const capacityFactor = totalCapacity > 0 ? +((totalPower / totalCapacity) * 100).toFixed(1) : 0;
    const availabilityRate = total > 0 ? +((online / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        total,
        online,
        maintenance,
        warning,
        offline,
        totalPower: +totalPower.toFixed(1),
        totalCapacity: +totalCapacity.toFixed(1),
        capacityFactor,
        availabilityRate,
        avgWindSpeed,
        avgHealth,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new turbine
// @route   POST /api/turbines
// @access  Private (Admin / Ops)
const createTurbine = async (req, res, next) => {
  try {
    const turbine = await Turbine.create(req.body);
    res.status(201).json({ success: true, data: turbine });
  } catch (error) {
    next(error);
  }
};

// @desc    Update turbine
// @route   PUT /api/turbines/:id
// @access  Private (Admin / Ops / Tech)
const updateTurbine = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    let query = identifier.startsWith('WT-') ? { turbineId: identifier } : { _id: identifier };

    const turbine = await Turbine.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!turbine) {
      return res.status(404).json({ success: false, message: `Turbine ${identifier} not found` });
    }

    res.json({ success: true, data: turbine });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete turbine
// @route   DELETE /api/turbines/:id
// @access  Private (Admin)
const deleteTurbine = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    let query = identifier.startsWith('WT-') ? { turbineId: identifier } : { _id: identifier };

    const turbine = await Turbine.findOneAndDelete(query);
    if (!turbine) {
      return res.status(404).json({ success: false, message: `Turbine ${identifier} not found` });
    }

    res.json({ success: true, message: `Turbine ${turbine.turbineId} decommissioned successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTurbines,
  getTurbineById,
  getTurbineSummary,
  createTurbine,
  updateTurbine,
  deleteTurbine,
};
