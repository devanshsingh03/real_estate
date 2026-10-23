const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', (req, res) => {
  const totalListings = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
  const availablePlots = db.prepare(`SELECT COUNT(*) as count FROM properties WHERE status = 'available'`).get().count;
  const reservedPlots = db.prepare(`SELECT COUNT(*) as count FROM properties WHERE status = 'reserved'`).get().count;
  const soldPlots = db.prepare(`SELECT COUNT(*) as count FROM properties WHERE status = 'sold'`).get().count;
  const publishedListings = db.prepare('SELECT COUNT(*) as count FROM properties WHERE published = 1').get().count;
  const draftListings = totalListings - publishedListings;

  const newEnquiries = db.prepare(`SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'`).get().count;
  const totalEnquiries = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;
  const totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'buyer'`).get().count;

  const recentEnquiries = db
    .prepare(
      `SELECT e.id, e.name, e.type, e.status, e.created_at, p.title as property_title
       FROM enquiries e LEFT JOIN properties p ON p.id = e.property_id
       ORDER BY e.created_at DESC LIMIT 6`
    )
    .all();

  const recentActivity = db
    .prepare(
      `SELECT l.*, u.name as admin_name FROM admin_activity_log l
       LEFT JOIN users u ON u.id = l.admin_id ORDER BY l.created_at DESC LIMIT 8`
    )
    .all();

  res.json({
    success: true,
    data: {
      totalListings,
      availablePlots,
      reservedPlots,
      soldPlots,
      publishedListings,
      draftListings,
      newEnquiries,
      totalEnquiries,
      totalUsers,
      recentEnquiries,
      recentActivity,
    },
  });
});

module.exports = router;
