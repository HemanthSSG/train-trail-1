# RAILCUE Backend
Secure API layer for the existing RAILCUE frontend.

## Run
1. Install PostgreSQL + PostGIS.
2. Create database `railcue`.
3. Run `backend/sql/001_schema.sql`.
4. Copy `.env.example` to `.env` and set `DATABASE_URL`.
5. From `backend`: `npm install && npm run dev`.

## API
- GET /health
- GET /api/stations/nearby?latitude=&longitude=&radius=
- GET /api/crossings/nearby?latitude=&longitude=&radius=
- GET /api/trains/search?q=
- GET /api/trains/:trainNumber/status
- GET /api/trains/live
- POST /api/route
- POST /api/journey/overview
- GET /api/osm/import-preview?latitude=&longitude=&radius=

## Data rules
Mapped OSM infrastructure is not live telemetry. Gate status remains UNKNOWN unless a legitimate telemetry adapter supplies OPEN/CLOSED/WARNING with source and timestamp. No train coordinates, speed or ETA are fabricated. A live train API is intentionally an adapter: set TRAIN_API_BASE_URL and TRAIN_API_KEY only for a provider you have verified and are authorized to use.

## Security
Secrets stay server-side. CORS, Helmet, JSON limits, rate limiting, validation and structured errors are enabled. Rotate any credentials previously exposed in browser code.

## Production
Put the backend behind HTTPS and a reverse proxy. Restrict CORS to the deployed frontend origin. Use a managed PostGIS database and add Redis for multi-instance live-data caching when a verified live provider is connected.
