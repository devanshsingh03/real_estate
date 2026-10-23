const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../../db');

const router = express.Router();

router.get('/', (req, res) => {
  const amenities = db.prepare('SELECT * FROM amenities ORDER BY name').all();
  res.json({ success: true, data: amenities });
});

router.post('/', [body('name').trim().notEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

  const { name, icon } = req.body;
  try {
    const result = db.prepare('INSERT INTO amenities (name, icon) VALUES (?, ?)').run(name, icon || null);
    const amenity = db.prepare('SELECT * FROM amenities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: amenity });
  } catch {
    res.status(409).json({ success: false, error: 'An amenity with this name already exists' });
  }
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM amenities WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Amenity not found' });
  db.prepare('DELETE FROM amenities WHERE id = ?').run(existing.id);
  res.json({ success: true, data: null });
});

module.exports = router;
