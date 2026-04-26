const express = require('express');
const Beneficiary = require('../models/Beneficiary');
const router = express.Router();

// POST /api/beneficiaries
router.post('/', async (req, res) => {
  try {
    const entry = await Beneficiary.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/beneficiaries
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = city;
    const entries = await Beneficiary.find(filter)
      .populate('deliveredBy', 'name')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/beneficiaries/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalPeople, totalHouseholds, aidBreakdown] = await Promise.all([
      Beneficiary.aggregate([{ $group: { _id: null, total: { $sum: '$householdSize' } } }]),
      Beneficiary.countDocuments(),
      Beneficiary.aggregate([
        { $unwind: '$aidProvided' },
        { $group: { _id: '$aidProvided', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({
      totalPeopleReached: totalPeople[0]?.total || 0,
      totalHouseholds,
      aidBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
