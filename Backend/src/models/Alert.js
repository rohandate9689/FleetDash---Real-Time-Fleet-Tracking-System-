const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
    },

    geofenceName: {
      type: String,
      default: null, // Optional for overspeed alerts
    },

    type: {
      type: String,
      enum: [
        "ENTRY",
        "EXIT",
        "OVERSPEED",
        "LOW_FUEL",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);