CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        VARCHAR(255) NOT NULL UNIQUE,
    full_name    VARCHAR(255) NOT NULL,
    avatar_url   VARCHAR(500),
    provider     VARCHAR(50)  NOT NULL DEFAULT 'google',
    provider_id  VARCHAR(255) NOT NULL UNIQUE,
    role         VARCHAR(50)  NOT NULL DEFAULT 'USER',
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);
