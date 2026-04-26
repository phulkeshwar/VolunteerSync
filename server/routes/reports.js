const express = require('express');
const Report = require('../models/Report');
const router = express.Router();

// POST /api/reports — Public, no auth needed
router.post('/', async (req, res) => {
  try {
    const { needs, peopleCount, urgency, location, contactPhone, details } = req.body;
    const report = await Report.create({
      needs: needs || [],
      peopleCount: peopleCount || 1,
      urgency: urgency || 'need_soon',
      location: location || {},
      contactPhone: contactPhone || '',
      details: details || '',
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports — Auth required (coordinator)
router.get('/', async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reports/:id — Update status
router.put('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
