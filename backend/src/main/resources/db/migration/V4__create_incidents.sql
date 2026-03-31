CREATE TABLE incident_tickets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id      UUID REFERENCES resources(id),
    reported_by      UUID NOT NULL REFERENCES users(id),
    assigned_to      UUID REFERENCES users(id),
    title            VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    category         VARCHAR(50)  NOT NULL,
    priority         VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    location_detail  VARCHAR(255),
    contact_phone    VARCHAR(20),
    contact_email    VARCHAR(255),
    status           VARCHAR(50)  NOT NULL DEFAULT 'OPEN',
    resolution_notes TEXT,
    rejection_reason TEXT,
    resolved_at      TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_attachments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id     UUID NOT NULL REFERENCES incident_tickets(id) ON DELETE CASCADE,
    uploaded_by   UUID NOT NULL REFERENCES users(id),
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_size     BIGINT NOT NULL,
    content_type  VARCHAR(100) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES incident_tickets(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    is_edited   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_reported_by   ON incident_tickets(reported_by, status);
CREATE INDEX idx_tickets_assigned_to   ON incident_tickets(assigned_to);
CREATE INDEX idx_tickets_status_prio   ON incident_tickets(status, priority);
CREATE INDEX idx_attachments_ticket    ON ticket_attachments(ticket_id);
CREATE INDEX idx_comments_ticket       ON ticket_comments(ticket_id, created_at);
