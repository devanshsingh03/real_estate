const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.* FROM favorites f
       JOIN properties p ON p.id = f.property_id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`
    )
    .all(req.user.id);

  const data = rows.map((property) => {
    const images = db
      .prepare('SELECT url FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
      .all(property.id)
      .map((r) => r.url);
    const amenities = db
      .prepare(
        `SELECT a.id, a.name, a.icon FROM amenities a
         JOIN property_amenities pa ON pa.amenity_id = a.id
         WHERE pa.property_id = ?`
      )
      .all(property.id);
    const location = property.location_id
      ? db.prepare('SELECT id, city, locality FROM locations WHERE id = ?').get(property.location_id)
      : null;
    return { ...property, images, amenities, location, isFavorited: true };
  });

  res.json({ success: true, data });
});

router.post('/:propertyId', (req, res) => {
  const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(req.params.propertyId);
  if (!property) return res.status(404).json({ success: false, error: 'Plot not found' });
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)').run(req.user.id, property.id);
  res.status(201).json({ success: true, data: null });
});

router.delete('/:propertyId', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(req.user.id, req.params.propertyId);
  res.json({ success: true, data: null });
});

module.exports = router;
