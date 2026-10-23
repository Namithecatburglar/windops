const Weather = require('../models/Weather');

// Helper to generate realistic 48-hour marine forecast if missing
const generateForecast = (baseWind = 14.2, baseWave = 2.4) => {
  const forecast = [];
  const now = new Date();

  for (let i = 0; i < 48; i += 2) {
    const fTime = new Date(now.getTime() + i * 3600 * 1000);
    const hour = fTime.getHours().toString().padStart(2, '0') + ':00';
    const waveSin = Math.sin(i / 8) * 0.9;
    const windSin = Math.sin(i / 6) * 4.2;

    const wHeight = Math.max(0.8, +(baseWave + waveSin + (Math.random() - 0.5) * 0.2).toFixed(1));
    const wSpeed = Math.max(4.0, +(baseWind + windSin + (Math.random() - 0.5) * 0.8).toFixed(1));
    const wPeriod = +(6.5 + wHeight * 0.7).toFixed(1);
    const vis = wSpeed > 18 ? 10 : 18 + Math.round((Math.random() - 0.5) * 4);

    let status = 'SAFE';
    if (wHeight > 2.2 || wSpeed > 15) status = 'RESTRICTED';
    else if (wHeight > 1.8 || wSpeed > 12) status = 'MARGINAL';

    forecast.push({
      time: hour,
      timestamp: fTime,
      windSpeed: wSpeed,
      windDirection: 'SW 225°',
      waveHeight: wHeight,
      wavePeriod: wPeriod,
      visibility: vis,
      precipitation: wHeight > 2.0 ? 30 : 5,
      operationalStatus: status,
    });
  }
  return forecast;
};

// @desc    Get current marine conditions & operational window
// @route   GET /api/weather/current
// @access  Private
const getCurrentWeather = async (req, res, next) => {
  try {
    let weather = await Weather.findOne().sort({ timestamp: -1 });

    if (!weather) {
      const forecast = generateForecast();
      weather = await Weather.create({
        location: 'Tamil Nadu Offshore Wind Farm - Gulf of Mannar Offshore Zone',
        timestamp: new Date(),
        windSpeed: 15.0,
        windDirection: 'SW 225°',
        waveHeight: 2.6,
        wavePeriod: 7.9,
        visibility: 14,
        seaTemperature: 28,
        airTemperature: 29,
        currentSpeed: 1.6,
        barometricPressure: 1006,
        operationalStatus: 'RESTRICTED',
        operationalWindow: {
          status: 'SAFE',
          nextSafeWindow: 'Tomorrow 08:00 – 13:00 (monsoon window)',
          maxSafeWaveHeight: 2.0,
          maxSafeWindSpeed: 12.0,
          currentWaveHeight: 2.6,
          currentWindSpeed: 15.0,
        },
        forecast,
      });
    }

    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marine forecast timeline for charts
// @route   GET /api/weather/forecast
// @access  Private
const getWeatherForecast = async (req, res, next) => {
  try {
    const weather = await Weather.findOne().sort({ timestamp: -1 });
    const forecast = weather?.forecast?.length ? weather.forecast : generateForecast();

    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update weather telemetry
// @route   PUT /api/weather
// @access  Private (Admin / Ops)
const updateWeather = async (req, res, next) => {
  try {
    const weather = await Weather.findOneAndUpdate({}, req.body, {
      new: true,
      sort: { timestamp: -1 },
    });
    res.json({ success: true, data: weather });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  updateWeather,
};
