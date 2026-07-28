console.log("✅ telemetryController loaded");

const turf = require("@turf/turf");

const TelemetryBucket = require("../models/TelemetryBucket");
const Vehicle = require("../models/Vehicle");
const Geofence = require("../models/Geofence");
const Alert = require("../models/Alert");

const { getIO } = require("../socket");

const addTelemetry = async (req, res) => {
  try {
    console.log("========== TELEMETRY RECEIVED ==========");
    console.log(req.body);

    const {
      vehicleId,
      latitude,
      longitude,
      speed,
      fuel,
    } = req.body;

    // ==========================
    // SAVE TELEMETRY BUCKET
    // ==========================

    const hour = new Date().toISOString().slice(0, 13);

    let bucket = await TelemetryBucket.findOne({
      vehicleId,
      hour,
    });

    if (!bucket) {
      bucket = new TelemetryBucket({
        vehicleId,
        hour,
        telemetry: [],
      });
    }

    bucket.telemetry.push({
      latitude,
      longitude,
      speed,
      fuel,
      timestamp: new Date(),
    });

    await bucket.save();

    // ==========================
    // UPDATE VEHICLE
    // ==========================

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { vehicleId },
      {
        currentLocation: {
          latitude,
          longitude,
        },
        speed,
        fuel,
        updatedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

    console.log("Vehicle Updated:");
    console.log(updatedVehicle);

    // ==========================
    // GEOFENCE ENTRY / EXIT
    // ==========================

    const geofences = await Geofence.find();

    for (const geofence of geofences) {

      const vehiclePoint = turf.point([
        longitude,
        latitude,
      ]);

      const centerPoint = turf.point([
        geofence.center.longitude,
        geofence.center.latitude,
      ]);

      const distance = turf.distance(
        vehiclePoint,
        centerPoint,
        {
          units: "meters",
        }
      );

      const inside = distance <= geofence.radius;

      // ENTRY

      if (
        inside &&
        updatedVehicle.lastGeofence !== geofence.name
      ) {

        updatedVehicle.lastGeofence = geofence.name;

        await updatedVehicle.save();

        const alert = await Alert.create({
          vehicleId,
          geofenceName: geofence.name,
          type: "ENTRY",
          message: `${vehicleId} entered ${geofence.name}`,
        });

        getIO().emit("new-alert", alert);

        console.log("🟢 ENTRY:", geofence.name);
      }

      // EXIT

      else if (
        !inside &&
        updatedVehicle.lastGeofence === geofence.name
      ) {

        updatedVehicle.lastGeofence = null;

        await updatedVehicle.save();

        const alert = await Alert.create({
          vehicleId,
          geofenceName: geofence.name,
          type: "EXIT",
          message: `${vehicleId} exited ${geofence.name}`,
        });

        getIO().emit("new-alert", alert);

        console.log("🔴 EXIT:", geofence.name);
      }
    }

    // ==========================
    // SOCKET.IO LIVE UPDATE
    // ==========================

    const io = getIO();

    console.log(
      "📡 Connected Clients:",
      io.engine.clientsCount
    );

    io.emit("telemetry-update", {
      vehicleId,
      latitude,
      longitude,
      speed,
      fuel,
      timestamp: new Date(),
    });

    console.log("✅ Telemetry event emitted");

    // ==========================
// OVERSPEED DETECTION
// ==========================

const SPEED_LIMIT = 80;

if (speed > SPEED_LIMIT) {

  // Check if latest alert is already OVERSPEED
  const latestAlert = await Alert.findOne({
    vehicleId,
    type: "OVERSPEED",
  }).sort({ createdAt: -1 });

  // Create only if there isn't a recent overspeed alert
  if (
    !latestAlert ||
    (Date.now() - new Date(latestAlert.createdAt).getTime()) > 60000
  ) {

    const alert = await Alert.create({
      vehicleId,
      geofenceName: null,
      type: "OVERSPEED",
      message: `${vehicleId} exceeded ${SPEED_LIMIT} km/h (${speed} km/h)`,
    });

    getIO().emit("new-alert", alert);

    console.log("🚨 OVERSPEED:", vehicleId);
  }
}

  // ==========================
// LOW FUEL ALERT
// ==========================

if (fuel < 20) {

  const existingFuelAlert = await Alert.findOne({
    vehicleId,
    type: "LOW_FUEL",
  }).sort({ createdAt: -1 });

  if (
    !existingFuelAlert ||
    Date.now() - existingFuelAlert.createdAt.getTime() > 5 * 60 * 1000
  ) {

    const alert = await Alert.create({
      vehicleId,
      type: "LOW_FUEL",
      geofenceName: null,
      message: `${vehicleId} fuel is low (${fuel}%)`,
    });

    getIO().emit("new-alert", alert);

    console.log("⛽ LOW FUEL:", vehicleId);
  }
}

    // ==========================
    // RESPONSE
    // ==========================

    res.status(201).json({
      success: true,
      message: "Telemetry Added Successfully",
      bucket,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  addTelemetry,
};