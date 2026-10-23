const mongoose = require('mongoose');

const forecastHourSchema = new mongoose.Schema({
  time: String, // e.g. "06:00", "09:00"
  timestamp: Date,
  windSpeed: Number, // m/s
  windDirection: String,
  waveHeight: Number, // m
  wavePeriod: Number, // s
  visibility: Number, // km
  precipitation: Number, // %
  operationalStatus: {
    type: String,
    enum: ['SAFE', 'MARGINAL', 'RESTRICTED'],
    default: 'SAFE',
  },
});

const weatherSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      default: 'Tamil Nadu Offshore Wind Farm - Gulf of Mannar Offshore Zone',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    windSpeed: {
      type: Number,
      required: true,
      default: 14.2, // m/s
    },
    windDirection: {
      type: String,
      default: 'SW 225°',
    },
    waveHeight: {
      type: Number,
      required: true,
      default: 2.4, // m
    },
    wavePeriod: {
      type: Number,
      required: true,
      default: 7.8, // s
    },
    visibility: {
      type: Number,
      required: true,
      default: 18, // km
    },
    seaTemperature: {
      type: Number,
      required: true,
      default: 14, // °C
    },
    airTemperature: {
      type: Number,
      required: true,
      default: 12, // °C
    },
    currentSpeed: {
      type: Number,
      required: true,
      default: 1.4, // knots
    },
    barometricPressure: {
      type: Number,
      default: 1014, // hPa
    },
    operationalStatus: {
      type: String,
      enum: ['SAFE', 'MARGINAL', 'RESTRICTED'],
      default: 'SAFE',
    },
    operationalWindow: {
      status: { type: String, default: 'SAFE' },
      nextSafeWindow: { type: String, default: 'Tomorrow 06:00 – 14:00' },
      maxSafeWaveHeight: { type: Number, default: 2.0 }, // CTV boarding limit
      maxSafeWindSpeed: { type: Number, default: 12.0 },
      currentWaveHeight: { type: Number, default: 1.8 },
      currentWindSpeed: { type: Number, default: 9.4 },
    },
    forecast: [forecastHourSchema],
  },
  {
    timestamps: true,
  }
);

weatherSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Weather', weatherSchema);
