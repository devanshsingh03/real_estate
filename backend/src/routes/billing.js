const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { isConfigured, getClient } = require('../utils/razorpay');

const router = express.Router();

function parsePlan(row) {
  return { ...row, features: JSON.parse(row.features) };
}

router.get('/plans', (req, res) => {
  const rows = db.prepare('SELECT * FROM plans WHERE active = 1 ORDER BY audience, sort_order').all();
  res.json({ success: true, data: { configured: isConfigured(), plans: rows.map(parsePlan) } });
});

router.get('/me', requireAuth, (req, res) => {
  const sub = db
    .prepare(
      `SELECT s.*, p.key as plan_key, p.name as plan_name FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = ? AND s.status = 'active' AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
       ORDER BY s.started_at DESC LIMIT 1`
    )
    .get(req.user.id);

  res.json({
    success: true,
    data: {
      isPremium: !!sub,
      plan: sub ? { key: sub.plan_key, name: sub.plan_name, expiresAt: sub.expires_at } : null,
      savedSearchLimit: sub ? 50 : 3,
    },
  });
});

router.post(
  '/create-order',
  requireAuth,
  [body('planKey').trim().notEmpty(), body('listingEnquiryId').optional({ checkFalsy: true }).isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    if (!isConfigured()) {
      return res.status(503).json({ success: false, error: 'Payments are not configured yet. Please check back soon.' });
    }

    const plan = db.prepare('SELECT * FROM plans WHERE key = ? AND active = 1').get(req.body.planKey);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    if (plan.price_paise <= 0) return res.status(400).json({ success: false, error: 'This plan is free and does not require payment' });

    if (req.body.listingEnquiryId) {
      const enquiry = db.prepare('SELECT id FROM enquiries WHERE id = ?').get(req.body.listingEnquiryId);
      if (!enquiry) return res.status(404).json({ success: false, error: 'Listing submission not found' });
    }

    try {
      const razorpay = getClient();
      const order = await razorpay.orders.create({
        amount: plan.price_paise,
        currency: 'INR',
        receipt: `plan_${plan.key}_${req.user.id}_${Date.now()}`,
        notes: { planKey: plan.key, userId: String(req.user.id) },
      });

      db.prepare(
        `INSERT INTO orders (user_id, plan_id, razorpay_order_id, amount_paise, currency, status, listing_enquiry_id)
         VALUES (?, ?, ?, ?, 'INR', 'created', ?)`
      ).run(req.user.id, plan.id, order.id, plan.price_paise, req.body.listingEnquiryId || null);

      res.status(201).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          planName: plan.name,
        },
      });
    } catch (err) {
      console.error('Razorpay order creation failed:', err.message);
      res.status(502).json({ success: false, error: 'Could not start payment. Please try again.' });
    }
  }
);

router.post(
  '/verify',
  requireAuth,
  [
    body('razorpay_order_id').trim().notEmpty(),
    body('razorpay_payment_id').trim().notEmpty(),
    body('razorpay_signature').trim().notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    if (!isConfigured()) {
      return res.status(503).json({ success: false, error: 'Payments are not configured yet.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE razorpay_order_id = ? AND user_id = ?').get(razorpay_order_id, req.user.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    db.prepare(`UPDATE orders SET status = 'paid', razorpay_payment_id = ?, paid_at = datetime('now') WHERE id = ?`).run(
      razorpay_payment_id,
      order.id
    );

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(order.plan_id);

    if (plan.audience === 'buyer') {
      const expiresAt =
        plan.billing_period === 'monthly'
          ? `datetime('now', '+1 month')`
          : plan.billing_period === 'yearly'
          ? `datetime('now', '+1 year')`
          : 'NULL';
      db.prepare(
        `INSERT INTO subscriptions (user_id, plan_id, order_id, status, expires_at) VALUES (?, ?, ?, 'active', ${expiresAt})`
      ).run(req.user.id, plan.id, order.id);
    } else if (plan.audience === 'seller' && order.listing_enquiry_id) {
      db.prepare(
        `UPDATE enquiries SET internal_notes = COALESCE(internal_notes || char(10), '') || 'Paid Featured Listing (₹' || ? || ')' WHERE id = ?`
      ).run((plan.price_paise / 100).toFixed(0), order.listing_enquiry_id);
    }

    res.json({ success: true, data: { status: 'paid', plan: plan.name } });
  }
);

module.exports = router;
