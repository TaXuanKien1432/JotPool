ALTER TABLE note_invitations DROP COLUMN invitee_id;

CREATE INDEX idx_note_invitations_note_email_status
ON note_invitations(note_id, email, status);

