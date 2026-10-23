const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../db');

const router = express.Router();

router.get('/', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY city, locality').all();
  res.json({ success: true, data: locations });
});

router.post(
  '/',
  [body('city').trim().notEmpty(), body('locality').trim().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    const { city, locality, imageUrl, description } = req.body;
    const result = db
      .prepare('INSERT INTO locations (city, locality, image_url, description) VALUES (?, ?, ?, ?)')
      .run(city, locality, imageUrl || null, description || null);
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: location });
  }
);

router.put(
  '/:id',
  [body('city').trim().notEmpty(), body('locality').trim().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Location not found' });

    const { city, locality, imageUrl, description } = req.body;
    db.prepare('UPDATE locations SET city=?, locality=?, image_url=?, description=? WHERE id=?').run(
      city,
      locality,
      imageUrl || null,
      description || null,
      existing.id
    );
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(existing.id);
    res.json({ success: true, data: location });
  }
);

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Location not found' });

  const inUse = db.prepare('SELECT COUNT(*) as count FROM properties WHERE location_id = ?').get(existing.id).count;
  if (inUse > 0) {
    return res.status(409).json({ success: false, error: `Cannot delete — ${inUse} plot(s) reference this location` });
  }

  db.prepare('DELETE FROM locations WHERE id = ?').run(existing.id);
  res.json({ success: true, data: null });
});

module.exports = router;
