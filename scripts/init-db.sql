-- Runs once, on first container start (mounted into docker-entrypoint-initdb.d).
-- PostGIS for the geo matching query, pgcrypto for gen_random_uuid(),
-- and the schema pg-boss expects to own.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS pgboss;
