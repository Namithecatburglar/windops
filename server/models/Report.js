const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Maintenance Report',
        'Turbine Performance Report',
        'Inspection Report',
        'Weather Impact Report',
        'Monthly Operations Report',
      ],
      required: true,
    },
    generatedBy: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['READY', 'PROCESSING', 'ARCHIVED'],
      default: 'READY',
    },
    format: {
      type: String,
      default: 'CSV',
    },
    summary: {
      totalRecords: Number,
      keyMetric: String,
      notes: String,
    },
    csvContent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ date: -1 });

module.exports = mongoose.model('Report', reportSchema);
