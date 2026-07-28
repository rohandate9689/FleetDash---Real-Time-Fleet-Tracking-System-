const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
    },

    driverName: {
      type: String,
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Running", "Idle", "Offline"],
      default: "Idle",
    },

    currentLocation: {
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
    },

    speed: Number,
    fuel: Number,

    lastGeofence: {
      type: String,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);