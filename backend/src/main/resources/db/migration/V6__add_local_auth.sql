-- Add local (email/password) authentication support
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255),
    ADD COLUMN username       VARCHAR(100) UNIQUE;

-- Allow null provider_id for local users (Google users already have it set)
ALTER TABLE users ALTER COLUMN provider_id DROP NOT NULL;
