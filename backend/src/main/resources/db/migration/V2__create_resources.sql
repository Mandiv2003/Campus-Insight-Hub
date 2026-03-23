CREATE TABLE resources (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50)  NOT NULL,
    capacity    INTEGER,
    location    VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    image_url   VARCHAR(500),
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE availability_windows (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL
);

CREATE INDEX idx_resources_type_status ON resources(type, status);
CREATE INDEX idx_availability_resource ON availability_windows(resource_id);
