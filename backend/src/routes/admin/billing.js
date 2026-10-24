const express = require('express');
const db = require('../../db');
const { isConfigured } = require('../../utils/razorpay');

const router = express.Router();

router.get('/', (req, res) => {
  const orders = db
    .prepare(
      `SELECT o.*, u.name as user_name, u.email as user_email, p.name as plan_name, p.audience
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN plans p ON p.id = o.plan_id
       ORDER BY o.created_at DESC LIMIT 100`
    )
    .all();

  const totalRevenuePaise = db.prepare(`SELECT COALESCE(SUM(amount_paise), 0) as total FROM orders WHERE status = 'paid'`).get().total;
  const activeSubscriptions = db
    .prepare(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now'))`)
    .get().count;

  res.json({
    success: true,
    data: {
      configured: isConfigured(),
      totalRevenuePaise,
      activeSubscriptions,
      orders,
    },
  });
});

module.exports = router;
