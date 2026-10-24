const bcrypt = require('bcryptjs');
const db = require('./index');

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function seedPlans() {
  const plans = [
    {
      key: 'seller_standard',
      audience: 'seller',
      name: 'Standard Listing',
      description: 'Submit your plot for review. No cost.',
      price_paise: 0,
      billing_period: 'one_time',
      features: JSON.stringify(['Listed after admin review', 'Standard placement', 'Basic support']),
      sort_order: 1,
    },
    {
      key: 'seller_featured',
      audience: 'seller',
      name: 'Featured Listing',
      description: 'Priority review and featured placement on the homepage and search results.',
      price_paise: 49900,
      billing_period: 'one_time',
      features: JSON.stringify(['Priority review (within 24 hours)', 'Featured on homepage', 'Highlighted in search results', 'Verified badge fast-tracked']),
      sort_order: 2,
    },
    {
      key: 'buyer_free',
      audience: 'buyer',
      name: 'Free',
      description: 'Everything you need to start browsing.',
      price_paise: 0,
      billing_period: 'one_time',
      features: JSON.stringify(['Browse all plots', 'Up to 3 saved searches', 'Wishlist & enquiries']),
      sort_order: 1,
    },
    {
      key: 'buyer_premium',
      audience: 'buyer',
      name: 'Premium Buyer',
      description: 'Unlimited saved searches and priority enquiry handling.',
      price_paise: 19900,
      billing_period: 'monthly',
      features: JSON.stringify(['Unlimited saved searches', 'Priority enquiry handling', 'Early access to new listings', 'Priority support']),
      sort_order: 2,
    },
  ];

  const insert = db.prepare(`
    INSERT INTO plans (key, audience, name, description, price_paise, billing_period, features, sort_order)
    VALUES (@key, @audience, @name, @description, @price_paise, @billing_period, @features, @sort_order)
    ON CONFLICT(key) DO UPDATE SET
      name=excluded.name, description=excluded.description, price_paise=excluded.price_paise,
      billing_period=excluded.billing_period, features=excluded.features, sort_order=excluded.sort_order
  `);
  plans.forEach((p) => insert.run(p));
  console.log(`Seeded/updated ${plans.length} billing plans.`);
}

function seed() {
  seedPlans();

  const existing = db.prepare('SELECT COUNT(*) as count FROM properties').get();
  if (existing.count > 0) {
    console.log('Database already seeded. Skipping property seed.');
    return;
  }

  const locations = [
    { city: 'Katni', locality: 'Bargawan', image_url: '/seed/locations/bargawan.svg', description: 'Growing residential belt close to the city centre.' },
    { city: 'Katni', locality: 'Madhav Nagar', image_url: '/seed/locations/madhav-nagar.svg', description: 'Well-connected locality with established infrastructure.' },
    { city: 'Katni', locality: 'Vijayraghavgarh', image_url: '/seed/locations/vijayraghavgarh.svg', description: 'Emerging plotted developments on the city outskirts.' },
    { city: 'Katni', locality: 'Sleemanabad', image_url: '/seed/locations/sleemanabad.svg', description: 'Quiet, spacious plots along the highway corridor.' },
    { city: 'Katni', locality: 'Barhi', image_url: '/seed/locations/barhi.svg', description: 'Affordable plots with good road connectivity.' },
  ];
  const insertLocation = db.prepare('INSERT INTO locations (city, locality, image_url, description) VALUES (?, ?, ?, ?)');
  const locationIds = locations.map((l) => insertLocation.run(l.city, l.locality, l.image_url, l.description).lastInsertRowid);

  const amenities = [
    { name: 'Gated Community', icon: 'shield' },
    { name: 'Tarred Roads', icon: 'road' },
    { name: '24x7 Water Supply', icon: 'droplet' },
    { name: 'Underground Electricity', icon: 'zap' },
    { name: 'Street Lighting', icon: 'lightbulb' },
    { name: 'Clubhouse', icon: 'building' },
    { name: 'Children\'s Park', icon: 'trees' },
    { name: 'Security Cabin', icon: 'shield-check' },
  ];
  const insertAmenity = db.prepare('INSERT INTO amenities (name, icon) VALUES (?, ?)');
  const amenityIds = amenities.map((a) => insertAmenity.run(a.name, a.icon).lastInsertRowid);

  const propertyTypes = ['residential', 'residential', 'commercial', 'agricultural'];
  const statuses = ['available', 'available', 'available', 'available', 'reserved', 'sold'];
  const projectNames = ['Emerald Meadows', 'Silver Oak Estate', 'Riverstone Enclave', 'Palm Grove Residency', 'Hilltop Greens'];

  const insertProperty = db.prepare(`
    INSERT INTO properties (
      title, slug, description, property_type, status, published, featured,
      price, area_sqft, dimensions, frontage, location_id, address,
      latitude, longitude, project_name, verified, plot_number,
      layout_x, layout_y, layout_w, layout_d, seo_title, seo_description
    ) VALUES (@title, @slug, @description, @property_type, @status, 1, @featured,
      @price, @area_sqft, @dimensions, @frontage, @location_id, @address,
      @latitude, @longitude, @project_name, @verified, @plot_number,
      @layout_x, @layout_y, @layout_w, @layout_d, @seo_title, @seo_description)
  `);
  const insertImage = db.prepare('INSERT INTO property_images (property_id, url, sort_order) VALUES (?, ?, ?)');
  const insertPropertyAmenity = db.prepare('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)');

  const totalPlots = 24;
  const gridCols = 3;
  const projectPlotIndex = {};
  for (let i = 0; i < totalPlots; i++) {
    const locationIdx = i % locations.length;
    const location = locations[locationIdx];
    const project = projectNames[locationIdx % projectNames.length];
    const areaOptions = [1200, 1500, 1800, 2000, 2400, 3000];
    const area = areaOptions[i % areaOptions.length];
    const pricePerSqft = 2800 + (i % 5) * 300;
    const price = Math.round((area * pricePerSqft) / 1000) * 1000;
    const status = statuses[i % statuses.length];
    const type = propertyTypes[(i + 1) % propertyTypes.length];
    const plotNumber = `${project.split(' ')[0].toUpperCase().slice(0, 2)}-${String(i + 1).padStart(3, '0')}`;
    const title = `Plot ${plotNumber} — ${area} sq.ft. ${type === 'commercial' ? 'Commercial' : type === 'agricultural' ? 'Agricultural' : 'Residential'} Plot in ${project}`;
    const slug = slugify(`${title}-${location.city}-${i + 1}`);

    const projectIndex = projectPlotIndex[project] ?? 0;
    projectPlotIndex[project] = projectIndex + 1;
    const col = projectIndex % gridCols;
    const row = Math.floor(projectIndex / gridCols);
    const plotW = 8;
    const plotD = 10;
    const gap = 2;

    const result = insertProperty.run({
      title,
      slug,
      description: `A well-positioned ${area} sq.ft. plot in ${project}, ${location.locality}, ${location.city}. Part of a professionally developed layout with clear boundaries and planned infrastructure. Ideal for ${type === 'agricultural' ? 'farming or a weekend retreat' : type === 'commercial' ? 'retail or office development' : 'building your dream home'}.`,
      property_type: type,
      status,
      featured: i < 8 ? 1 : 0,
      price,
      area_sqft: area,
      dimensions: `${Math.round(Math.sqrt(area))} ft x ${Math.round(area / Math.round(Math.sqrt(area)))} ft`,
      frontage: `${30 + (i % 4) * 5} ft`,
      location_id: locationIds[locationIdx],
      address: `${project}, ${location.locality}, ${location.city}`,
      latitude: 23.83 + (i % 10) * 0.01,
      longitude: 80.39 + (i % 10) * 0.01,
      project_name: project,
      verified: i % 3 === 0 ? 1 : 0,
      plot_number: plotNumber,
      layout_x: col * (plotW + gap),
      layout_y: row * (plotD + gap),
      layout_w: plotW,
      layout_d: plotD,
      seo_title: `${title} | ${project}`,
      seo_description: `${area} sq.ft. ${type} plot for sale in ${location.locality}, ${location.city}. Priced at ₹${price.toLocaleString('en-IN')}.`,
    });

    const propertyId = result.lastInsertRowid;
    for (let imgIdx = 0; imgIdx < 4; imgIdx++) {
      insertImage.run(propertyId, `/seed/plots/plot-${(i % 8) + 1}-${imgIdx + 1}.svg`, imgIdx);
    }

    const amenityCount = 3 + (i % 4);
    const shuffled = [...amenityIds].sort(() => Math.random() - 0.5).slice(0, amenityCount);
    shuffled.forEach((aid) => insertPropertyAmenity.run(propertyId, aid));
  }

  const adminPasswordHash = bcrypt.hashSync('Admin@12345', 10);
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`).run(
    'Site Administrator',
    'admin@example.com',
    adminPasswordHash
  );

  const buyerPasswordHash = bcrypt.hashSync('Buyer@12345', 10);
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'buyer')`).run(
    'Demo Buyer',
    'buyer@example.com',
    buyerPasswordHash
  );

  console.log(`Seeded ${totalPlots} plots across ${locations.length} locations.`);
  console.log('Demo admin login: admin@example.com / Admin@12345');
  console.log('Demo buyer login: buyer@example.com / Buyer@12345');
}

seed();
