const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    workOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    turbine: {
      type: String,
      required: true, // e.g. "WT-024"
      trim: true,
    },
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    assignedTo: {
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
      enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue'],
      default: 'Scheduled',
    },
    notes: [
      {
        author: { type: String, default: 'Operator' },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    vesselRequired: {
      type: String,
      default: 'None',
    },
    estimatedHours: {
      type: Number,
      default: 4,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ turbine: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
