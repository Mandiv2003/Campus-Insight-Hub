CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id         UUID NOT NULL REFERENCES resources(id),
    requested_by        UUID NOT NULL REFERENCES users(id),
    reviewed_by         UUID REFERENCES users(id),
    title               VARCHAR(255) NOT NULL,
    purpose             TEXT NOT NULL,
    expected_attendees  INTEGER,
    start_datetime      TIMESTAMP NOT NULL,
    end_datetime        TIMESTAMP NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rejection_reason    TEXT,
    cancellation_note   TEXT,
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Critical index: conflict check queries filter on resource + status + time range
CREATE INDEX idx_bookings_resource_time
    ON bookings(resource_id, start_datetime, end_datetime)
    WHERE status = 'APPROVED';

CREATE INDEX idx_bookings_requester ON bookings(requested_by, status);
