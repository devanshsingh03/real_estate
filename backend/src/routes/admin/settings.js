const express = require('express');
const { getSettings, setSettings } = require('../../utils/settings');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: getSettings() });
});

router.put('/', (req, res) => {
  const allowedKeys = ['brandName', 'whatsappNumber', 'contactEmail', 'logoUrl', 'facebookUrl', 'instagramUrl', 'twitterUrl'];
  const partial = {};
  allowedKeys.forEach((key) => {
    if (req.body[key] !== undefined) partial[key] = req.body[key];
  });
  const updated = setSettings(partial);
  res.json({ success: true, data: updated });
});

module.exports = router;
