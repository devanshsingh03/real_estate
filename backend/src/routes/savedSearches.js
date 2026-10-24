const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function savedSearchLimit(userId) {
  const sub = db
    .prepare(
      `SELECT 1 FROM subscriptions WHERE user_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now')) LIMIT 1`
    )
    .get(userId);
  return sub ? 50 : 3;
}

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map((r) => ({ ...r, criteria: JSON.parse(r.criteria) }));
  res.json({ success: true, data: rows });
});

router.post(
  '/',
  [body('label').trim().notEmpty(), body('criteria').isObject()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    const limit = savedSearchLimit(req.user.id);
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM saved_searches WHERE user_id = ?').get(req.user.id).count;
    if (existingCount >= limit) {
      return res.status(409).json({
        success: false,
        error:
          limit === 3
            ? 'Free accounts can save up to 3 searches. Upgrade to Premium for unlimited saved searches.'
            : `You can save up to ${limit} searches. Delete one to add more.`,
      });
    }

    const result = db
      .prepare('INSERT INTO saved_searches (user_id, label, criteria) VALUES (?, ?, ?)')
      .run(req.user.id, req.body.label, JSON.stringify(req.body.criteria));
    const row = db.prepare('SELECT * FROM saved_searches WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: { ...row, criteria: JSON.parse(row.criteria) } });
  }
);

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM saved_searches WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Saved search not found' });
  db.prepare('DELETE FROM saved_searches WHERE id = ?').run(existing.id);
  res.json({ success: true, data: null });
});

module.exports = router;
