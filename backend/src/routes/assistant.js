const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { extractBudget, extractLocation, extractPropertyType, extractStatus, detectIntent } = require('../utils/assistantNlp');
const { getSettings } = require('../utils/settings');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many messages, please slow down.' },
});

function attachRelations(property) {
  const images = db
    .prepare('SELECT url FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
    .all(property.id)
    .map((r) => r.url);
  const location = property.location_id
    ? db.prepare('SELECT id, city, locality FROM locations WHERE id = ?').get(property.location_id)
    : null;
  return { ...property, images, location };
}

function formatINR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function searchProperties(ctx) {
  const where = ['p.published = 1'];
  const params = {};

  if (ctx.city) {
    where.push('l.city = @city');
    params.city = ctx.city;
  }
  if (ctx.locality) {
    where.push('l.locality = @locality');
    params.locality = ctx.locality;
  }
  if (ctx.propertyType) {
    where.push('p.property_type = @propertyType');
    params.propertyType = ctx.propertyType;
  }
  if (ctx.status) {
    where.push('p.status = @status');
    params.status = ctx.status;
  }
  if (ctx.minPrice) {
    where.push('p.price >= @minPrice');
    params.minPrice = ctx.minPrice;
  }
  if (ctx.maxPrice) {
    where.push('p.price <= @maxPrice');
    params.maxPrice = ctx.maxPrice;
  }

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM properties p LEFT JOIN locations l ON l.id = p.location_id WHERE ${where.join(' AND ')}`)
    .get(params).count;

  const rows = db
    .prepare(
      `SELECT p.* FROM properties p LEFT JOIN locations l ON l.id = p.location_id
       WHERE ${where.join(' AND ')} ORDER BY p.featured DESC, p.created_at DESC LIMIT 5`
    )
    .all(params);

  return { total, properties: rows.map(attachRelations) };
}

function describeContext(ctx) {
  const parts = [];
  if (ctx.locality) parts.push(ctx.locality);
  else if (ctx.city) parts.push(ctx.city);
  if (ctx.propertyType) parts.push(ctx.propertyType);
  if (ctx.status) parts.push(ctx.status);
  if (ctx.minPrice || ctx.maxPrice) {
    const min = ctx.minPrice ? formatINR(ctx.minPrice) : '₹0';
    const max = ctx.maxPrice ? formatINR(ctx.maxPrice) : 'any budget';
    parts.push(`${min} – ${max}`);
  }
  return parts.join(', ');
}

router.post(
  '/chat',
  chatLimiter,
  [body('message').trim().isLength({ min: 1, max: 300 })],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

    const { message } = req.body;
    const prevContext = req.body.context && typeof req.body.context === 'object' ? req.body.context : {};
    const settings = getSettings();
    const locations = db.prepare('SELECT * FROM locations').all();

    let intent = detectIntent(message);
    const budget = extractBudget(message);
    const location = extractLocation(message, locations);
    const propertyType = extractPropertyType(message);
    const status = extractStatus(message);

    if (intent === 'unknown' && (location || propertyType || status || budget.minPrice || budget.maxPrice)) {
      intent = 'search';
    }

    // "reset"/new search phrases clear prior context
    const isFreshSearch = /\b(new search|start over|reset|something else|different)\b/i.test(message);
    const base = isFreshSearch ? {} : prevContext;

    const context = {
      ...base,
      ...(location?.city ? { city: location.city } : {}),
      ...(location?.locality ? { locality: location.locality } : {}),
      ...(propertyType ? { propertyType } : {}),
      ...(status ? { status } : {}),
      ...(budget.minPrice ? { minPrice: budget.minPrice } : {}),
      ...(budget.maxPrice ? { maxPrice: budget.maxPrice } : {}),
    };

    let reply;
    let properties;
    let suggestedReplies;

    switch (intent) {
      case 'greeting':
        reply = `Hi! I'm here to help you find a plot or answer questions about ${settings.brandName}. What are you looking for?`;
        suggestedReplies = ['Residential plots under 50L', 'Show me plots in Katni', 'How does EMI work?', 'Talk to a human'];
        break;

      case 'thanks':
        reply = "You're welcome! Anything else I can help you find?";
        suggestedReplies = ['Show more plots', 'Schedule a site visit', 'Talk to a human'];
        break;

      case 'emi':
        reply = 'Every plot page has a built-in EMI Calculator — adjust your down payment, interest rate, and loan tenure to see an estimated monthly payment. Open any plot and scroll to the price card to try it.';
        suggestedReplies = ['Show me some plots', 'Talk to a human'];
        break;

      case 'site_visit':
        reply = `You can request a site visit right from any plot's page — there's a "Schedule a Site Visit" button, or message us on WhatsApp${settings.whatsappNumber ? ` at +${settings.whatsappNumber}` : ''} and we'll arrange it.`;
        suggestedReplies = ['Show me plots to visit', 'Talk to a human'];
        break;

      case 'contact':
        reply = `You can reach our team via WhatsApp${settings.whatsappNumber ? ` (+${settings.whatsappNumber})` : ''}${settings.contactEmail ? ` or email at ${settings.contactEmail}` : ''}, or fill out the contact form on our Contact page.`;
        suggestedReplies = ['Show me plots', 'How does EMI work?'];
        break;

      case 'verified':
        reply = 'Listings marked "Verified" have had their documentation and plot boundaries checked by our team. We never mark a listing verified unless that check has actually happened — unverified listings are clearly shown as such.';
        suggestedReplies = ['Show me verified plots', 'Show me plots'];
        break;

      case 'compare':
        reply = 'You can compare up to 3 plots side by side — tap "Add to Compare" on any plot card while browsing, then hit "Compare" in the bar that appears at the bottom.';
        suggestedReplies = ['Show me plots', 'Talk to a human'];
        break;

      case 'wishlist':
        reply = 'Tap the heart icon on any plot to save it to your wishlist — you can review saved plots anytime from your account menu. You will need to be logged in.';
        suggestedReplies = ['Show me plots', 'How do I log in?'];
        break;

      case 'explorer':
        reply = 'Our 3D Plot Explorer lets you rotate, zoom, and click through an interactive layout of plots in a project — look for "3D Explorer" in the main menu.';
        suggestedReplies = ['Show me plots', 'Talk to a human'];
        break;

      case 'sell':
        reply = 'If you want to list your own plot, head to "List Your Plot" in the menu and submit your details — our team will review and reach out.';
        suggestedReplies = ['Talk to a human'];
        break;

      case 'documents':
        reply = 'Ownership and documentation details are shown on a plot\'s page only where the seller has supplied and we have verified them. For anything not shown, ask us directly and we\'ll check with the seller.';
        suggestedReplies = ['Show me verified plots', 'Talk to a human'];
        break;

      case 'search': {
        const { total, properties: found } = searchProperties(context);
        properties = found;
        const desc = describeContext(context);
        if (total === 0) {
          reply = desc
            ? `I couldn't find any plots matching ${desc}. Want to try a wider budget or a different location?`
            : "I couldn't find any plots matching that. Could you tell me a city, budget, or plot type?";
          suggestedReplies = ['Show all plots', 'Residential under 50L', 'Talk to a human'];
        } else {
          reply = desc
            ? `I found ${total} plot${total === 1 ? '' : 's'} matching ${desc}${total > 5 ? ' — here are the top 5' : ''}:`
            : `Here ${total === 1 ? 'is' : 'are'} ${total} plot${total === 1 ? '' : 's'} I found:`;
          suggestedReplies = ['Only available ones', 'Show cheaper options', 'Talk to a human'];
        }
        break;
      }

      default:
        reply = "I can help you find plots by budget, location, or type, or answer questions about EMI, site visits, and verification. What would you like to know?";
        suggestedReplies = ['Residential plots under 50L', 'Show me plots in Katni', 'How does EMI work?', 'Talk to a human'];
    }

    res.json({ success: true, data: { reply, properties, suggestedReplies, context } });
  }
);

module.exports = router;
