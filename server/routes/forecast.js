const express = require('express');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { forecastZoneDemand } = require('../services/geminiService');

const router = express.Router();

// GET /api/forecast/demand — predictive demand forecasting per zone
router.get('/demand', protect, requireRole('coordinator'), async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [currentZones, historicalRaw, volunteerZones] = await Promise.all([
      // Current active task counts per city
      Task.aggregate([
        { $match: { status: { $in: ['Open', 'Assigned', 'In Progress'] } } },
        {
          $group: {
            _id: { $ifNull: ['$city', 'Unassigned'] },
            activeTasks: { $sum: 1 },
            criticalTasks: {
              $sum: { $cond: [{ $eq: ['$urgency', 'Critical'] }, 1, 0] },
            },
          },
        },
      ]),
      // Historical task completion data
      Task.aggregate([
        { $match: { status: 'Completed', completedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $ifNull: ['$city', 'Unassigned'] },
            completed: { $sum: 1 },
          },
        },
      ]),
      // Volunteer city distribution
      Volunteer.aggregate([
        { $match: { role: 'volunteer' } },
        {
          $group: {
            _id: { $ifNull: ['$location.city', 'Unassigned'] },
            volunteers: { $sum: 1 },
            availableVolunteers: {
              $sum: { $cond: ['$availability', 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Merge city data
    const cityMap = new Map();

    currentZones.forEach((z) => {
      cityMap.set(z._id, {
        city: z._id,
        activeTasks: z.activeTasks,
        criticalTasks: z.criticalTasks,
        volunteers: 0,
        availableVolunteers: 0,
      });
    });

    volunteerZones.forEach((vz) => {
      const city = vz._id || 'Unassigned';
      const existing = cityMap.get(city) || { city, activeTasks: 0, criticalTasks: 0 };
      existing.volunteers = vz.volunteers;
      existing.availableVolunteers = vz.availableVolunteers;
      cityMap.set(city, existing);
    });

    const currentData = Array.from(cityMap.values());
    const historicalData = historicalRaw.map((h) => ({
      city: h._id,
      completed: h.completed,
      avgUrgency: 'Medium',
    }));

    const forecast = await forecastZoneDemand(historicalData, currentData);

    return res.json(forecast);
  } catch (error) {
    console.error('Demand forecast error:', error);
    return res.status(500).json({ message: 'Failed to generate demand forecast.' });
  }
});

module.exports = router;
