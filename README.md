# Real Estate Bros

A premium real estate / plot marketplace: browse, filter, and explore land plots
(including a genuine interactive 3D layout explorer), submit enquiries, manage a
wishlist as a registered buyer, and manage the entire catalog from an admin dashboard.

## Stack

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, Framer Motion, React Three Fiber / Drei, React Router
- **Backend:** Node.js + Express, SQLite (via Node's built-in `node:sqlite`, no native build step), JWT auth, Multer

## Project Structure

```
backend/   Express API, SQLite schema + seed data
frontend/  React app (Vite)
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env     # edit values as needed
npm run seed              # creates backend/data/real_estate.db with 24 demo plots
npm run dev                # http://localhost:4000
```

Demo accounts created by the seed script:
- Admin: `admin@example.com` / `Admin@12345`
- Buyer: `buyer@example.com` / `Buyer@12345`

### Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The frontend expects the API at `http://localhost:4000` by default (override with
`VITE_API_URL` in a `frontend/.env` file).

## Key Features Implemented

### Public site
- Cinematic animated homepage with a genuine Three.js 3D building scene in the hero, search panel, featured plots, locations, and FAQ
- Searchable/filterable plot marketplace with grid/list views, sort, and pagination
- Interactive 3D plot layout explorer (React Three Fiber) with onboarding guidance, auto-rotate demo, and a 2D fallback for devices without WebGL
- Plot detail pages with image gallery/lightbox, amenities, similar plots, and enquiry form
- JWT authentication (register/login/logout), wishlist, and "my enquiries"
- Enquiry system (general contact, per-plot enquiry, callback, site visit) with rate limiting
- WhatsApp click-to-chat and click-to-call, configurable from the admin Settings page
- Responsive, accessible UI with reduced-motion support

### Admin dashboard (`/admin`, admin accounts only)
- **Dashboard** — listing counts by status, publish state, new enquiries, registered buyers, recent enquiries, recent admin activity log
- **Properties** — search/filter/paginate, publish/unpublish, feature/unfeature, verify, delete with confirmation; full add/edit form (pricing, dimensions, location, amenities, 3D Explorer grid position, SEO fields); image upload, reordering, and deletion wired to real file storage (`backend/uploads`)
- **Enquiries** — search/filter by status and type, inline quick status change, detail view with contact info, message, internal notes, follow-up date, and full status-change history
- **Locations** — add/edit/delete the cities/localities shown across the site (blocked from deleting a location still in use by a plot)
- **Settings** — brand name, contact email, WhatsApp number, logo and social links, stored in the database and served live via `/api/config`
- Server-side authorization on every `/api/admin/*` route (`requireAuth` + `requireAdmin`) — the frontend route guard is a UX convenience only, not the security boundary
- No public admin registration: the only way to get an admin account is the seed script / direct DB access

## Notes on Demo Data

Seed data (24 plots across 5 locations in Katni, Madhya Pradesh) is generated for development.
Plot and location imagery is a set of custom-generated SVG illustrations (house/building/skyline
art in the site's palette) rather than real photography, so every demo listing has a relevant,
on-brand visual with zero external dependency. Replace with real listings and photography via the
admin dashboard's image upload (or swap in Cloudinary) before using this in production.

The 3D explorer's layout is an **illustrative sample layout** generated from listing data,
not a legally surveyed site plan — this is also stated in the UI.

## Maps

Plot detail pages and the Contact page embed a live Google Map (via Google's free, keyless
`maps.google.com/maps?...&output=embed` iframe) using each plot's latitude/longitude, with a
"Get Directions" link out to full Google Maps. No API key is required for this. If you'd rather
use the full Google Maps JavaScript API (for things like a draggable pin picker in the admin
property form), add a `VITE_GOOGLE_MAPS_API_KEY` and swap `MapEmbed` for the JS API — the
iframe approach was chosen so maps work out of the box with zero configuration.

## Known Limitations / Next Steps

- No automated test suite yet
- Image uploads are stored on local disk (`backend/uploads`), not a cloud bucket — fine for a single server, would need Cloudinary/S3 for a multi-instance deployment
