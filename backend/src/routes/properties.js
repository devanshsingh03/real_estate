const express = require('express');
const crypto = require('crypto');
const { query, validationResult } = require('express-validator');
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function viewerKeyFor(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  return crypto.createHash('sha1').update(`${ip}|${ua}`).digest('hex');
}

function recordView(propertyId, viewerKey) {
  const today = new Date().toISOString().slice(0, 10);
  const already = db
    .prepare(
      `SELECT 1 FROM property_views WHERE property_id = ? AND viewer_key = ? AND date(viewed_at) = ?`
    )
    .get(propertyId, viewerKey, today);
  if (!already) {
    db.prepare('INSERT INTO property_views (property_id, viewer_key) VALUES (?, ?)').run(propertyId, viewerKey);
  }
}

function viewsToday(propertyId) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .prepare(`SELECT COUNT(*) as count FROM property_views WHERE property_id = ? AND date(viewed_at) = ?`)
    .get(propertyId, today).count;
}

function attachRelations(property) {
  const images = db
    .prepare('SELECT url FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
    .all(property.id)
    .map((r) => r.url);
  const amenities = db
    .prepare(
      `SELECT a.id, a.name, a.icon FROM amenities a
       JOIN property_amenities pa ON pa.amenity_id = a.id
       WHERE pa.property_id = ?`
    )
    .all(property.id);
  const location = property.location_id
    ? db.prepare('SELECT id, city, locality FROM locations WHERE id = ?').get(property.location_id)
    : null;
  return { ...property, images, amenities, location };
}

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 48 }).toInt(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('minArea').optional().isFloat({ min: 0 }).toFloat(),
    query('maxArea').optional().isFloat({ min: 0 }).toFloat(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const {
      search, city, propertyType, status, sort = 'newest',
      view, featured,
    } = req.query;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 12;

    const where = ['p.published = 1'];
    const params = {};

    if (search) {
      where.push('(p.title LIKE @search OR p.project_name LIKE @search OR l.city LIKE @search OR l.locality LIKE @search)');
      params.search = `%${search}%`;
    }
    if (city) {
      where.push('l.city = @city');
      params.city = city;
    }
    if (propertyType) {
      where.push('p.property_type = @propertyType');
      params.propertyType = propertyType;
    }
    if (status) {
      where.push('p.status = @status');
      params.status = status;
    }
    if (featured === 'true') {
      where.push('p.featured = 1');
    }
    if (req.query.minPrice != null) {
      where.push('p.price >= @minPrice');
      params.minPrice = req.query.minPrice;
    }
    if (req.query.maxPrice != null) {
      where.push('p.price <= @maxPrice');
      params.maxPrice = req.query.maxPrice;
    }
    if (req.query.minArea != null) {
      where.push('p.area_sqft >= @minArea');
      params.minArea = req.query.minArea;
    }
    if (req.query.maxArea != null) {
      where.push('p.area_sqft <= @maxArea');
      params.maxArea = req.query.maxArea;
    }

    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      area_asc: 'p.area_sqft ASC',
      area_desc: 'p.area_sqft DESC',
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRow = db
      .prepare(`SELECT COUNT(*) as count FROM properties p LEFT JOIN locations l ON l.id = p.location_id ${whereClause}`)
      .get(params);
    const total = countRow.count;

    const rows = db
      .prepare(
        `SELECT p.* FROM properties p
         LEFT JOIN locations l ON l.id = p.location_id
         ${whereClause}
         ORDER BY ${orderBy}
         LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });

    const data = rows.map(attachRelations);

    res.json({
      success: true,
      data,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  }
);

router.get('/layout', (req, res) => {
  const { projectName } = req.query;
  const where = ['published = 1', 'layout_x IS NOT NULL'];
  const params = {};
  if (projectName) {
    where.push('project_name = @projectName');
    params.projectName = projectName;
  }
  const rows = db
    .prepare(`SELECT id, title, slug, plot_number, price, area_sqft, status, layout_x, layout_y, layout_w, layout_d, project_name
               FROM properties WHERE ${where.join(' AND ')} ORDER BY layout_y, layout_x`)
    .all(params);
  res.json({ success: true, data: rows });
});

router.get('/projects', (req, res) => {
  const rows = db
    .prepare(`SELECT DISTINCT project_name FROM properties WHERE published = 1 AND project_name IS NOT NULL ORDER BY project_name`)
    .all();
  res.json({ success: true, data: rows.map((r) => r.project_name) });
});

router.get('/by-ids', (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) return res.json({ success: true, data: [] });
  const ids = String(idsParam)
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isInteger(n))
    .slice(0, 4);
  if (ids.length === 0) return res.json({ success: true, data: [] });

  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT * FROM properties WHERE id IN (${placeholders}) AND published = 1`)
    .all(...ids);
  const byId = new Map(rows.map((r) => [r.id, attachRelations(r)]));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  res.json({ success: true, data: ordered });
});

router.get('/:slug', optionalAuth, (req, res) => {
  const property = db.prepare('SELECT * FROM properties WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!property) return res.status(404).json({ success: false, error: 'Plot not found' });

  recordView(property.id, viewerKeyFor(req));

  const full = { ...attachRelations(property), viewsToday: viewsToday(property.id) };

  const similar = db
    .prepare(
      `SELECT id, title, slug, price, area_sqft, status, location_id FROM properties
       WHERE published = 1 AND id != ? AND location_id = ?
       ORDER BY created_at DESC LIMIT 4`
    )
    .all(property.id, property.location_id)
    .map(attachRelations);

  let isFavorited = false;
  if (req.user) {
    const fav = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND property_id = ?').get(req.user.id, property.id);
    isFavorited = !!fav;
  }

  res.json({ success: true, data: { ...full, similar, isFavorited } });
});

module.exports = router;
