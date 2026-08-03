# SQL Usage in AI-Travel-Agent

This document describes how SQL can be used in the AI-Travel-Agent project, a suggested database schema for core features, example SQL statements, and example Node.js integration snippets. Add this file to the repository to document the solution and share SQL usage with contributors.

---

## Purpose

The project is primarily JavaScript-based and may use SQL for persistent storage of users, trips, bookings, and agent data. This file outlines a recommended relational schema and example queries and demonstrates how to integrate SQL from Node.js.

## Recommended schema

Example schema for typical travel-agent features: users, destinations, trips, bookings, agents, and sessions.

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Destinations
CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trips (offers/generated itineraries)
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  details JSONB,
  price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agent logs or sessions (AI session metadata)
CREATE TABLE agent_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_trips_destination ON trips(destination_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
```

Notes:
- Use JSONB for storing variable itinerary or model output data.
- Use proper FK constraints to keep referential integrity.
- For SQLite, replace SERIAL with INTEGER PRIMARY KEY AUTOINCREMENT and use DATETIME.

## Example queries

Select available trips for a destination:

```sql
SELECT t.id, t.title, t.price, d.name AS destination
FROM trips t
JOIN destinations d ON d.id = t.destination_id
WHERE d.name ILIKE '%paris%'
ORDER BY t.price ASC
LIMIT 20;
```

Create a booking transaction (Postgres example using a transaction):

```sql
BEGIN;

INSERT INTO bookings (user_id, trip_id, status, total_amount)
VALUES ($1, $2, 'confirmed', $3)
RETURNING id;

-- Optionally update seat inventory or trip availability here

COMMIT;
```

Search stored AI session records for a user:

```sql
SELECT id, created_at, session_data->>'intent' AS intent
FROM agent_sessions
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 50;
```

## Node.js integration examples

Below are sample snippets for common Node.js drivers. Always use parameterized queries to avoid SQL injection.

Postgres with `pg`:

```js
// Example using node-postgres (pg)
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function findTripsByDestination(destName) {
  const sql = `SELECT t.id, t.title, t.price, d.name AS destination
               FROM trips t
               JOIN destinations d ON d.id = t.destination_id
               WHERE d.name ILIKE $1
               ORDER BY t.price ASC
               LIMIT 20;`;
  const values = [`%${destName}%`];
  const { rows } = await pool.query(sql, values);
  return rows;
}

async function createBooking(userId, tripId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertSql = `INSERT INTO bookings (user_id, trip_id, status, total_amount)
                       VALUES ($1, $2, $3, $4)
                       RETURNING id`;
    const res = await client.query(insertSql, [userId, tripId, 'confirmed', amount]);
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

SQLite with `better-sqlite3`:

```js
const Database = require('better-sqlite3');
const db = new Database('data.db');

function getTrips(destName) {
  const stmt = db.prepare(`SELECT t.id, t.title, t.price, d.name AS destination
                           FROM trips t
                           JOIN destinations d ON d.id = t.destination_id
                           WHERE d.name LIKE ?
                           ORDER BY t.price ASC
                           LIMIT 20`);
  return stmt.all(`%${destName}%`);
}
```

## Migrations and setup

- Use a migration tool (node-pg-migrate, knex, typeorm migrations, Flyway, or Sequelize migrations).
- Keep migrations in a /migrations directory and run them as part of deploy scripts.
- Example npm scripts in package.json:

```json
{
  "scripts": {
    "migrate": "node ./scripts/migrate.js",
    "migrate:up": "node ./scripts/migrate-up.js"
  }
}
```

## Security and best practices

- Always use parameterized queries or query builders; never concatenate user input into SQL.
- Limit DB user permissions (use a user with only the privileges it needs).
- Store DB credentials in environment variables (e.g., DATABASE_URL) and never in source control.
- Use connection pooling in production.
- Validate and sanitize data before storing, and use JSONB for flexible fields instead of storing raw text.

## Testing

- Use a test database (or in-memory SQLite) for running unit/integration tests.
- Run migrations in test setup and teardown.

## Example SQL files to include

Place SQL scripts under `db/` or `sql/`:
- db/001_create_schema.sql  -- initial CREATE TABLE statements
- db/002_add_indexes.sql -- performance indexes
- db/003_seed_data.sql -- optional seed data for development

## Where to add this file

Suggested path: `docs/SQL_USAGE.md` or `db/README.md`.

---

If you want, I can:
- Add a migration SQL file (db/001_create_schema.sql) based on the schema above.
- Add Node.js helper functions to an existing database utility file in the repo if you point me to the file path.

