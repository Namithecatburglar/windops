const mongoose = require('mongoose');

const turbineSchema = new mongoose.Schema(
  {
    turbineId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: 'Siemens Gamesa SG 8.0-167 DD',
    },
    location: {
      zone: { type: String, default: 'Zone A' },
      row: { type: Number, default: 1 },
      col: { type: Number, default: 1 },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      depthMeters: { type: Number, default: 32 },
    },
    status: {
      type: String,
      enum: ['ONLINE', 'MAINTENANCE', 'WARNING', 'OFFLINE'],
      default: 'ONLINE',
    },
    capacity: {
      type: Number,
      default: 7.5, // 7.5 MW rating -> 48 turbines = 360 MW total
    },
    powerOutput: {
      type: Number,
      default: 6.8, // MW
    },
    windSpeed: {
      type: Number,
      default: 12.4, // m/s
    },
    rotorSpeed: {
      type: Number,
      default: 9.2, // RPM
    },
    pitchAngle: {
      type: Number,
      default: 1.4, // degrees
    },
    yawAngle: {
      type: Number,
      default: 235.0, // degrees
    },
    temperature: {
      generator: { type: Number, default: 64 }, // Celsius
      gearbox: { type: Number, default: 58 },
      ambient: { type: Number, default: 14 },
      nacelle: { type: Number, default: 28 },
    },
    vibration: {
      type: Number,
      default: 1.8, // mm/s
    },
    healthScore: {
      type: Number,
      default: 95, // 0 - 100%
    },
    availability: {
      type: Number,
      default: 98.4, // %
    },
    lastMaintenance: {
      type: Date,
      default: Date.now,
    },
    nextInspection: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    operatingHours: {
      type: Number,
      default: 42800,
    },
    historicalLog: [
      {
        timestamp: { type: Date, default: Date.now },
        powerOutput: Number,
        windSpeed: Number,
        rotorSpeed: Number,
        generatorTemp: Number,
        gearboxTemp: Number,
        vibration: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

turbineSchema.index({ status: 1 });
turbineSchema.index({ 'location.zone': 1 });

module.exports = mongoose.model('Turbine', turbineSchema);
