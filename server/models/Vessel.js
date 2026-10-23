const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    callsign: {
      type: String,
      default: 'OV-981',
    },
    type: {
      type: String,
      enum: [
        'Service Operation Vessel',
        'Crew Transfer Vessel',
        'Tug & Anchor Handler',
        'Subsea Survey Vessel',
        'Heavy Lift Crane Vessel',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['At Port', 'En Route', 'On Site', 'Returning', 'Weather Delayed', 'Active'],
      default: 'At Port',
    },
    location: {
      description: { type: String, default: 'Harbor Berth 4' },
      x: { type: Number, default: 10 }, // normalized 0-100 for offshore map
      y: { type: Number, default: 90 },
      lat: { type: Number, default: 55.45 },
      lng: { type: Number, default: 7.20 },
      heading: { type: Number, default: 45 },
    },
    speedKnots: {
      type: Number,
      default: 12.5,
    },
    assignedTurbine: {
      type: String,
      default: 'None',
    },
    eta: {
      type: String,
      default: '--:--',
    },
    crew: {
      type: Number,
      default: 12,
    },
    maxCapacity: {
      type: Number,
      default: 30,
    },
    weatherSuitability: {
      type: String,
      enum: ['OPERATIONAL', 'MARGINAL', 'EXCEEDED'],
      default: 'OPERATIONAL',
    },
    maxHs: {
      type: Number,
      default: 2.5, // max safe wave height
    },
    fuelLevel: {
      type: Number,
      default: 84, // %
    },
  },
  {
    timestamps: true,
  }
);

vesselSchema.index({ status: 1 });

module.exports = mongoose.model('Vessel', vesselSchema);
