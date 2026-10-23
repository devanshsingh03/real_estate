const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', (req, res) => {
  const { search, status, type, page = 1, pageSize = 20 } = req.query;
  const where = [];
  const params = {};

  if (search) {
    where.push('(e.name LIKE @search OR e.phone LIKE @search OR e.email LIKE @search)');
    params.search = `%${search}%`;
  }
  if (status) {
    where.push('e.status = @status');
    params.status = status;
  }
  if (type) {
    where.push('e.type = @type');
    params.type = type;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) as count FROM enquiries e ${whereClause}`).get(params).count;

  const rows = db
    .prepare(
      `SELECT e.*, p.title as property_title, p.slug as property_slug
       FROM enquiries e
       LEFT JOIN properties p ON p.id = e.property_id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: Number(pageSize), offset: (Number(page) - 1) * Number(pageSize) });

  res.json({
    success: true,
    data: rows,
    meta: { page: Number(page), pageSize: Number(pageSize), total, totalPages: Math.ceil(total / pageSize) },
  });
});

router.get('/:id', (req, res) => {
  const enquiry = db
    .prepare(
      `SELECT e.*, p.title as property_title, p.slug as property_slug
       FROM enquiries e LEFT JOIN properties p ON p.id = e.property_id WHERE e.id = ?`
    )
    .get(req.params.id);
  if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });

  const history = db
    .prepare(
      `SELECT h.*, u.name as changed_by_name FROM enquiry_status_history h
       LEFT JOIN users u ON u.id = h.changed_by WHERE h.enquiry_id = ? ORDER BY h.created_at ASC`
    )
    .all(enquiry.id);

  res.json({ success: true, data: { ...enquiry, history } });
});

router.patch('/:id', (req, res) => {
  const { status, internalNotes, followUpDate } = req.body;
  const existing = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Enquiry not found' });

  const updates = [];
  const params = { id: existing.id };

  if (status !== undefined) {
    if (!['new', 'contacted', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    updates.push('status=@status');
    params.status = status;
  }
  if (internalNotes !== undefined) {
    updates.push('internal_notes=@internalNotes');
    params.internalNotes = internalNotes;
  }
  if (followUpDate !== undefined) {
    updates.push('follow_up_date=@followUpDate');
    params.followUpDate = followUpDate || null;
  }
  if (updates.length === 0) return res.status(400).json({ success: false, error: 'No changes provided' });

  db.prepare(`UPDATE enquiries SET ${updates.join(', ')} WHERE id=@id`).run(params);

  if (status !== undefined && status !== existing.status) {
    db.prepare(`INSERT INTO enquiry_status_history (enquiry_id, status, changed_by) VALUES (?, ?, ?)`).run(
      existing.id,
      status,
      req.user.id
    );
  }

  const updated = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(existing.id);
  res.json({ success: true, data: updated });
});

module.exports = router;
