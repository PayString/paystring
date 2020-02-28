-- We use this to generate random UUIDs from inside Postgres.
-- It also adds hashing and encryption functions.
-- https://www.postgresql.org/docs/current/pgcrypto.html

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
