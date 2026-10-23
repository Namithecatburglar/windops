const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['TURBINE_TELEMETRY', 'WEATHER_WARNING', 'MAINTENANCE_OVERDUE', 'VESSEL_SAFETY', 'COMMUNICATION', 'SAFETY'],
      default: 'TURBINE_TELEMETRY',
    },
    severity: {
      type: String,
      enum: ['Critical', 'Warning', 'Information'],
      default: 'Warning',
    },
    turbine: {
      type: String,
      default: 'General',
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved'],
      default: 'Active',
    },
    acknowledgedBy: {
      type: String,
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ status: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
