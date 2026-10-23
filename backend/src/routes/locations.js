const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY city, locality').all();
  const data = locations.map((loc) => {
    const counts = db
      .prepare(
        `SELECT COUNT(*) as activeListings FROM properties WHERE location_id = ? AND published = 1 AND status = 'available'`
      )
      .get(loc.id);
    const types = db
      .prepare(`SELECT DISTINCT property_type FROM properties WHERE location_id = ? AND published = 1`)
      .all(loc.id)
      .map((r) => r.property_type);
    return { ...loc, activeListings: counts.activeListings, propertyTypes: types };
  });
  res.json({ success: true, data });
});

module.exports = router;
