const express = require('express');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const db = require('../../db');
const { upload } = require('../../middleware/upload');

const router = express.Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function uniqueSlug(base, excludeId) {
  let slug = slugify(base);
  let n = 1;
  while (true) {
    const existing = excludeId
      ? db.prepare('SELECT id FROM properties WHERE slug = ? AND id != ?').get(slug, excludeId)
      : db.prepare('SELECT id FROM properties WHERE slug = ?').get(slug);
    if (!existing) return slug;
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
}

function logActivity(adminId, action, entityType, entityId, details) {
  db.prepare(
    `INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`
  ).run(adminId, action, entityType, entityId || null, details ? JSON.stringify(details) : null);
}

function attachRelations(property) {
  const images = db
    .prepare('SELECT id, url, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
    .all(property.id);
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

router.get('/', (req, res) => {
  const { search, status, published, page = 1, pageSize = 20 } = req.query;
  const where = [];
  const params = {};

  if (search) {
    where.push('(p.title LIKE @search OR p.plot_number LIKE @search OR p.project_name LIKE @search)');
    params.search = `%${search}%`;
  }
  if (status) {
    where.push('p.status = @status');
    params.status = status;
  }
  if (published !== undefined && published !== '') {
    where.push('p.published = @published');
    params.published = published === 'true' ? 1 : 0;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = db
    .prepare(`SELECT COUNT(*) as count FROM properties p ${whereClause}`)
    .get(params).count;

  const rows = db
    .prepare(
      `SELECT p.* FROM properties p ${whereClause} ORDER BY p.created_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: Number(pageSize), offset: (Number(page) - 1) * Number(pageSize) });

  res.json({
    success: true,
    data: rows.map(attachRelations),
    meta: { page: Number(page), pageSize: Number(pageSize), total, totalPages: Math.ceil(total / pageSize) },
  });
});

router.get('/:id', (req, res) => {
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!property) return res.status(404).json({ success: false, error: 'Plot not found' });
  res.json({ success: true, data: attachRelations(property) });
});

const propertyValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('propertyType').isIn(['residential', 'commercial', 'agricultural']),
  body('price').isFloat({ min: 0 }),
  body('areaSqft').isFloat({ min: 0 }),
  body('locationId').optional({ checkFalsy: true }).isInt(),
];

router.post('/', propertyValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

  const b = req.body;
  const slug = uniqueSlug(`${b.title}-${Date.now()}`);

  const result = db
    .prepare(
      `INSERT INTO properties (
        title, slug, description, property_type, status, published, featured,
        price, area_sqft, dimensions, frontage, location_id, address,
        latitude, longitude, project_name, verified, plot_number,
        layout_x, layout_y, layout_w, layout_d, seo_title, seo_description
      ) VALUES (@title, @slug, @description, @propertyType, @status, @published, @featured,
        @price, @areaSqft, @dimensions, @frontage, @locationId, @address,
        @latitude, @longitude, @projectName, @verified, @plotNumber,
        @layoutX, @layoutY, @layoutW, @layoutD, @seoTitle, @seoDescription)`
    )
    .run({
      title: b.title,
      slug,
      description: b.description || null,
      propertyType: b.propertyType,
      status: b.status || 'available',
      published: b.published ? 1 : 0,
      featured: b.featured ? 1 : 0,
      price: b.price,
      areaSqft: b.areaSqft,
      dimensions: b.dimensions || null,
      frontage: b.frontage || null,
      locationId: b.locationId || null,
      address: b.address || null,
      latitude: b.latitude || null,
      longitude: b.longitude || null,
      projectName: b.projectName || null,
      verified: b.verified ? 1 : 0,
      plotNumber: b.plotNumber || null,
      layoutX: b.layoutX ?? null,
      layoutY: b.layoutY ?? null,
      layoutW: b.layoutW ?? null,
      layoutD: b.layoutD ?? null,
      seoTitle: b.seoTitle || null,
      seoDescription: b.seoDescription || null,
    });

  const propertyId = result.lastInsertRowid;

  if (Array.isArray(b.amenityIds)) {
    const insertPA = db.prepare('INSERT OR IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)');
    b.amenityIds.forEach((aid) => insertPA.run(propertyId, aid));
  }

  logActivity(req.user.id, 'create', 'property', propertyId, { title: b.title });

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
  res.status(201).json({ success: true, data: attachRelations(property) });
});

router.put('/:id', propertyValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg });

  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Plot not found' });

  const b = req.body;
  const slug = b.title !== existing.title ? uniqueSlug(b.title, existing.id) : existing.slug;

  db.prepare(
    `UPDATE properties SET
      title=@title, slug=@slug, description=@description, property_type=@propertyType, status=@status,
      published=@published, featured=@featured, price=@price, area_sqft=@areaSqft, dimensions=@dimensions,
      frontage=@frontage, location_id=@locationId, address=@address, latitude=@latitude, longitude=@longitude,
      project_name=@projectName, verified=@verified, plot_number=@plotNumber,
      layout_x=@layoutX, layout_y=@layoutY, layout_w=@layoutW, layout_d=@layoutD,
      seo_title=@seoTitle, seo_description=@seoDescription, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id: existing.id,
    title: b.title,
    slug,
    description: b.description || null,
    propertyType: b.propertyType,
    status: b.status || existing.status,
    published: b.published ? 1 : 0,
    featured: b.featured ? 1 : 0,
    price: b.price,
    areaSqft: b.areaSqft,
    dimensions: b.dimensions || null,
    frontage: b.frontage || null,
    locationId: b.locationId || null,
    address: b.address || null,
    latitude: b.latitude || null,
    longitude: b.longitude || null,
    projectName: b.projectName || null,
    verified: b.verified ? 1 : 0,
    plotNumber: b.plotNumber || null,
    layoutX: b.layoutX ?? null,
    layoutY: b.layoutY ?? null,
    layoutW: b.layoutW ?? null,
    layoutD: b.layoutD ?? null,
    seoTitle: b.seoTitle || null,
    seoDescription: b.seoDescription || null,
  });

  if (Array.isArray(b.amenityIds)) {
    db.prepare('DELETE FROM property_amenities WHERE property_id = ?').run(existing.id);
    const insertPA = db.prepare('INSERT OR IGNORE INTO property_amenities (property_id, amenity_id) VALUES (?, ?)');
    b.amenityIds.forEach((aid) => insertPA.run(existing.id, aid));
  }

  logActivity(req.user.id, 'update', 'property', existing.id, { title: b.title });

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(existing.id);
  res.json({ success: true, data: attachRelations(property) });
});

router.patch('/:id/status', (req, res) => {
  const { status, published, featured, verified } = req.body;
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Plot not found' });

  const updates = [];
  const params = { id: existing.id };
  if (status !== undefined) {
    if (!['available', 'reserved', 'sold'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    updates.push('status=@status');
    params.status = status;
  }
  if (published !== undefined) {
    updates.push('published=@published');
    params.published = published ? 1 : 0;
  }
  if (featured !== undefined) {
    updates.push('featured=@featured');
    params.featured = featured ? 1 : 0;
  }
  if (verified !== undefined) {
    updates.push('verified=@verified');
    params.verified = verified ? 1 : 0;
  }
  if (updates.length === 0) return res.status(400).json({ success: false, error: 'No changes provided' });

  updates.push("updated_at=datetime('now')");
  db.prepare(`UPDATE properties SET ${updates.join(', ')} WHERE id=@id`).run(params);
  logActivity(req.user.id, 'status_update', 'property', existing.id, req.body);

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(existing.id);
  res.json({ success: true, data: attachRelations(property) });
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Plot not found' });

  const images = db.prepare('SELECT url FROM property_images WHERE property_id = ?').all(existing.id);
  const uploadsDir = path.resolve(__dirname, '..', '..', '..', process.env.UPLOADS_DIR || './uploads');
  images.forEach((img) => {
    if (img.url.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(img.url));
      fs.unlink(filePath, () => {});
    }
  });

  db.prepare('DELETE FROM properties WHERE id = ?').run(existing.id);
  logActivity(req.user.id, 'delete', 'property', existing.id, { title: existing.title });
  res.json({ success: true, data: null });
});

router.post('/:id/images', upload.array('images', 10), (req, res) => {
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Plot not found' });
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No images uploaded' });
  }

  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM property_images WHERE property_id = ?')
    .get(existing.id).maxOrder;

  const insertImage = db.prepare('INSERT INTO property_images (property_id, url, sort_order) VALUES (?, ?, ?)');
  req.files.forEach((file, i) => {
    insertImage.run(existing.id, `/uploads/${file.filename}`, maxOrder + 1 + i);
  });

  logActivity(req.user.id, 'upload_images', 'property', existing.id, { count: req.files.length });

  const images = db
    .prepare('SELECT id, url, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
    .all(existing.id);
  res.status(201).json({ success: true, data: images });
});

router.delete('/:id/images/:imageId', (req, res) => {
  const image = db
    .prepare('SELECT * FROM property_images WHERE id = ? AND property_id = ?')
    .get(req.params.imageId, req.params.id);
  if (!image) return res.status(404).json({ success: false, error: 'Image not found' });

  if (image.url.startsWith('/uploads/')) {
    const uploadsDir = path.resolve(__dirname, '..', '..', '..', process.env.UPLOADS_DIR || './uploads');
    fs.unlink(path.join(uploadsDir, path.basename(image.url)), () => {});
  }

  db.prepare('DELETE FROM property_images WHERE id = ?').run(image.id);
  res.json({ success: true, data: null });
});

router.put('/:id/images/reorder', (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ success: false, error: 'order must be an array of image IDs' });

  const update = db.prepare('UPDATE property_images SET sort_order = ? WHERE id = ? AND property_id = ?');
  order.forEach((imageId, i) => update.run(i, imageId, req.params.id));

  const images = db
    .prepare('SELECT id, url, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC')
    .all(req.params.id);
  res.json({ success: true, data: images });
});

module.exports = router;
