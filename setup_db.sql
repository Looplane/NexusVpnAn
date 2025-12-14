-- Create the database if it doesn't exist
-- Note: You cannot run CREATE DATABASE inside a transaction block or if you are connected to the database you are trying to create.
-- Connect to 'postgres' database first.
CREATE DATABASE nexusvpn;
-- Verify user exists (optional, usually postgres/postgres is default)
-- CREATE USER nexus WITH PASSWORD 'secure_password_123';
-- GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexus;