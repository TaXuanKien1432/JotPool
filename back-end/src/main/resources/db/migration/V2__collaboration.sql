ALTER TABLE notes
ADD COLUMN is_collaborative BOOLEAN DEFAULT FALSE;

ALTER TABLE notes
ADD COLUMN yjs_doc BYTEA;

CREATE TABLE note_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'EDITOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(note_id, user_id)
);

CREATE TABLE note_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    inviter_id UUID REFERENCES users(id),
    invitee_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- notes
CREATE INDEX idx_notes_owner_id ON notes(owner_id);

-- collaborators
CREATE INDEX idx_note_collaborators_user
ON note_collaborators(user_id);

CREATE INDEX idx_note_collaborators_note_user
ON note_collaborators(note_id, user_id);

-- notifications
CREATE INDEX idx_notifications_user_created
ON notifications(user_id, created_at DESC);

