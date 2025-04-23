CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pwd_hash TEXT NOT NULL
);

CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  geometry GEOMETRY(POLYGON, 4326) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_types TEXT[] NOT NULL
);

DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  last_updated_timestamp TIMESTAMP NOT NULL,
  geometry GEOMETRY(POINT, 4326),
  formatted_address TEXT
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP DEFAULT NOW()
);
