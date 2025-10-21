// ============================================
// FILE: backend/routes/healthMetrics.js (NEW)
// ============================================
const express = require('express');
const router = express.Router();
const HealthMetric = require('../models/HealthMetric');
const { protect } = require('../middleware/auth');

// @route   POST /api/health-metrics
// @desc    Add or update health metrics
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      bloodPressure,
      heartRate,
      weight,
      height,
      temperature,
      bloodSugar,
      cholesterol,
    } = req.body;

    // Calculate BMI
    const bmi = weight / ((height / 100) ** 2);

    const metricData = {
      patient: req.user.id,
      bloodPressure,
      heartRate,
      weight,
      height,
      bmi: parseFloat(bmi.toFixed(1)),
      temperature,
      bloodSugar,
      cholesterol,
    };

    // Update existing or create new
    let metrics = await HealthMetric.findOneAndUpdate(
      { patient: req.user.id },
      metricData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error saving health metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/health-metrics/latest
// @desc    Get latest health metrics for patient
// @access  Private
router.get('/latest', protect, async (req, res) => {
  try {
    const metrics = await HealthMetric.findOne({ patient: req.user.id })
      .sort({ updatedAt: -1 });

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message: 'No health metrics found',
      });
    }

    res.status(200).json({
      success: true,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/health-metrics/history
// @desc    Get health metrics history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ patient: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(30); // Last 30 entries

    res.status(200).json({
      success: true,
      count: metrics.length,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;