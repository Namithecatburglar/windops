const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    turbine: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'Blade Inspection',
        'Gearbox Inspection',
        'Electrical Inspection',
        'Foundation Inspection',
        'Subsea Inspection',
        'Structural Inspection',
      ],
      required: true,
    },
    inspector: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN PROGRESS', 'COMPLETED', 'OVERDUE'],
      default: 'SCHEDULED',
    },
    method: {
      type: String,
      enum: ['Drone / UAV', 'Rope Access', 'ROV Subsea', 'Borescope NDT', 'Visual Walkthrough', 'Sensory Ultrasound'],
      default: 'Visual Walkthrough',
    },
    findings: {
      type: String,
      default: 'Awaiting inspection execution and sensor telemetry review.',
    },
    severityFound: {
      type: String,
      enum: ['None', 'Minor', 'Moderate', 'Severe'],
      default: 'None',
    },
    notes: [
      {
        author: { type: String, default: 'Inspector' },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

inspectionSchema.index({ turbine: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
