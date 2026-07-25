const Geofence = require("../models/Geofence");

// Create a new geofence
const createGeofence = async (req, res) => {
  try {
    const { name, latitude, longitude, radius } = req.body;

    const geofence = new Geofence({
      name,
      center: { latitude, longitude },
      radius,
    });

    await geofence.save();

    res.status(201).json({
      success: true,
      message: "Geofence created successfully",
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all geofences
const getGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find();
    res.status(200).json({
      success: true,
      count: geofences.length,
      data: geofences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update geofence by ID
const updateGeofence = async (req, res) => {
  try {
    const { name, latitude, longitude, radius } = req.body;

    const geofence = await Geofence.findByIdAndUpdate(
      req.params.id,
      { name, center: { latitude, longitude }, radius },
      { new: true, runValidators: true }
    );

    if (!geofence) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    res.status(200).json({
      success: true,
      message: "Geofence updated successfully",
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete geofence by ID
const deleteGeofence = async (req, res) => {
  try {
    const geofence = await Geofence.findByIdAndDelete(req.params.id);

    if (!geofence) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    res.status(200).json({ success: true, message: "Geofence deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createGeofence, getGeofences, updateGeofence, deleteGeofence };