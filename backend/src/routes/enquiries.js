const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many enquiries submitted. Please try again later.' },
});

router.post(
  '/',
  enquiryLimiter,
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().isLength({ min: 7 }).withMessage('A valid phone number is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email must be valid'),
    body('type').optional().isIn(['enquiry', 'callback', 'site_visit', 'contact']),
    body('propertyId').optional({ checkFalsy: true }).isInt(),
    body('message').optional({ checkFalsy: true }).isString().isLength({ max: 2000 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, phone, email, preferredTime, message, type = 'enquiry', propertyId } = req.body;

    if (propertyId) {
      const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(propertyId);
      if (!property) return res.status(404).json({ success: false, error: 'Plot not found' });
    }

    const result = db
      .prepare(
        `INSERT INTO enquiries (property_id, user_id, name, phone, email, preferred_time, message, type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`
      )
      .run(propertyId || null, req.user?.id || null, name, phone, email || null, preferredTime || null, message || null, type);

    db.prepare(`INSERT INTO enquiry_status_history (enquiry_id, status, changed_by) VALUES (?, 'new', ?)`).run(
      result.lastInsertRowid,
      req.user?.id || null
    );

    res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
  }
);

router.get('/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT e.*, p.title as property_title, p.slug as property_slug FROM enquiries e
       LEFT JOIN properties p ON p.id = e.property_id
       WHERE e.user_id = ? ORDER BY e.created_at DESC`
    )
    .all(req.user.id);
  res.json({ success: true, data: rows });
});

module.exports = router;
