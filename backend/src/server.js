require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { getSettings } = require('./utils/settings');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const locationRoutes = require('./routes/locations');
const favoriteRoutes = require('./routes/favorites');
const enquiryRoutes = require('./routes/enquiries');
const savedSearchRoutes = require('./routes/savedSearches');
const assistantRoutes = require('./routes/assistant');

const adminStatsRoutes = require('./routes/admin/stats');
const adminPropertyRoutes = require('./routes/admin/properties');
const adminEnquiryRoutes = require('./routes/admin/enquiries');
const adminLocationRoutes = require('./routes/admin/locations');
const adminAmenityRoutes = require('./routes/admin/amenities');
const adminSettingsRoutes = require('./routes/admin/settings');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, '..', process.env.UPLOADS_DIR || './uploads')));
app.use('/seed', express.static(path.resolve(__dirname, '..', 'public', 'seed')));

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.get('/api/config', (req, res) => res.json({ success: true, data: getSettings() }));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/assistant', assistantRoutes);

app.use('/api/admin', requireAuth, requireAdmin);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/properties', adminPropertyRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/locations', adminLocationRoutes);
app.use('/api/admin/amenities', adminAmenityRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
