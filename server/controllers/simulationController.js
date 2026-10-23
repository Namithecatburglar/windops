const { runSimulationStep } = require('../services/simulationService');

// @desc    Trigger a simulation tick immediately
// @route   POST /api/simulation/tick
// @access  Private
const triggerTick = async (req, res, next) => {
  try {
    await runSimulationStep();
    res.json({ success: true, message: 'Telemetry simulation step executed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerTick };
