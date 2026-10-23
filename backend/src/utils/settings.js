const db = require('../db');

const DEFAULTS = {
  brandName: process.env.BRAND_NAME || 'Real Estate Bros',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  contactEmail: process.env.CONTACT_EMAIL || '',
  logoUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
};

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...stored };
}

function setSettings(partial) {
  const upsert = db.prepare(
    `INSERT INTO settings (key, value) VALUES (@key, @value)
     ON CONFLICT(key) DO UPDATE SET value = @value`
  );
  Object.entries(partial).forEach(([key, value]) => {
    if (value === undefined) return;
    upsert.run({ key, value: String(value) });
  });
  return getSettings();
}

module.exports = { getSettings, setSettings, DEFAULTS };
