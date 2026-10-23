const Turbine = require('../models/Turbine');
const Weather = require('../models/Weather');

let isSimulating = false;
let simulationInterval = null;

// Realistic aerodynamic calculation of power from wind speed
const calcPower = (windSpeed, capacity = 7.5) => {
  // Cut-in: 3 m/s, Rated: 12.5 m/s, Cut-out: 25 m/s
  if (windSpeed < 3.0 || windSpeed > 25.0) return 0;
  if (windSpeed >= 12.5) return capacity;
  // Cubic power curve between cut-in and rated
  const ratio = (windSpeed - 3.0) / (12.5 - 3.0);
  const power = capacity * Math.pow(ratio, 2.7);
  return Math.min(capacity, Math.max(0.1, +power.toFixed(2)));
};

const runSimulationStep = async () => {
  try {
    // 1. Slightly shift global weather
    const weather = await Weather.findOne().sort({ timestamp: -1 });
    if (weather) {
      const windDelta = (Math.random() - 0.5) * 0.4;
      const waveDelta = (Math.random() - 0.5) * 0.08;

      weather.windSpeed = Math.max(3.0, Math.min(24.0, +(weather.windSpeed + windDelta).toFixed(1)));
      weather.waveHeight = Math.max(0.6, Math.min(4.5, +(weather.waveHeight + waveDelta).toFixed(2)));
      weather.wavePeriod = +(6.5 + weather.waveHeight * 0.6).toFixed(1);

      if (weather.waveHeight > 2.2 || weather.windSpeed > 15) {
        weather.operationalStatus = 'RESTRICTED';
        weather.operationalWindow.status = 'RESTRICTED';
      } else if (weather.waveHeight > 1.8 || weather.windSpeed > 12) {
        weather.operationalStatus = 'MARGINAL';
        weather.operationalWindow.status = 'MARGINAL';
      } else {
        weather.operationalStatus = 'SAFE';
        weather.operationalWindow.status = 'SAFE';
      }

      weather.operationalWindow.currentWaveHeight = weather.waveHeight;
      weather.operationalWindow.currentWindSpeed = weather.windSpeed;
      await weather.save();
    }

    // 2. Select online turbines and fluctuate telemetry
    const onlineTurbines = await Turbine.find({ status: { $in: ['ONLINE', 'WARNING'] } });
    if (onlineTurbines.length > 0) {
      // Pick 8 random turbines to update each tick
      const sampleSize = Math.min(8, onlineTurbines.length);
      const shuffled = onlineTurbines.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

      for (const t of shuffled) {
        const localWindDelta = (Math.random() - 0.5) * 0.5;
        const newWind = Math.max(3.5, Math.min(22.0, +(t.windSpeed + localWindDelta).toFixed(1)));
        const newPower = calcPower(newWind, t.capacity);
        const newRpm = newPower > 0 ? +(7.5 + (newPower / t.capacity) * 4.2 + (Math.random() - 0.5) * 0.2).toFixed(1) : 0;
        const genTempDelta = Math.round((Math.random() - 0.5) * 1.5);
        const gearTempDelta = Math.round((Math.random() - 0.5) * 1.2);

        t.windSpeed = newWind;
        t.powerOutput = newPower;
        t.rotorSpeed = newRpm;
        t.temperature.generator = Math.min(85, Math.max(45, t.temperature.generator + genTempDelta));
        t.temperature.gearbox = Math.min(78, Math.max(40, t.temperature.gearbox + gearTempDelta));
        t.vibration = +(1.2 + (newPower / t.capacity) * 0.7 + (Math.random() - 0.5) * 0.15).toFixed(2);

        // Append to 24h history buffer if last entry is older than 5 min
        if (!t.historicalLog) t.historicalLog = [];
        const lastEntry = t.historicalLog[t.historicalLog.length - 1];
        const fiveMinAgo = Date.now() - 5 * 60 * 1000;

        if (!lastEntry || new Date(lastEntry.timestamp).getTime() < fiveMinAgo) {
          t.historicalLog.push({
            timestamp: new Date(),
            powerOutput: t.powerOutput,
            windSpeed: t.windSpeed,
            rotorSpeed: t.rotorSpeed,
            generatorTemp: t.temperature.generator,
            gearboxTemp: t.temperature.gearbox,
            vibration: t.vibration,
          });
          if (t.historicalLog.length > 30) {
            t.historicalLog.shift();
          }
        }

        await t.save();
      }
    }
  } catch (err) {
    console.error('[Simulation Service] Error in simulation step:', err.message);
  }
};

const startSimulation = (intervalMs = 12000) => {
  if (isSimulating) return;
  isSimulating = true;
  console.log(`[Simulation Service] SCADA live telemetry simulation active (${intervalMs}ms tick)`);
  simulationInterval = setInterval(runSimulationStep, intervalMs);
};

const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  isSimulating = false;
  console.log('[Simulation Service] Simulation paused');
};

module.exports = {
  startSimulation,
  stopSimulation,
  runSimulationStep,
  calcPower,
};