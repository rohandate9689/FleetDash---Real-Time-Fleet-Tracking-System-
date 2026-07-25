const express = require("express");
const router = express.Router();

const {
  createGeofence,
  getGeofences,
  updateGeofence,
  deleteGeofence,
} = require("../controllers/geofenceController");

router.post("/", createGeofence);
router.get("/", getGeofences);
router.put("/:id", updateGeofence);
router.delete("/:id", deleteGeofence);

module.exports = router;