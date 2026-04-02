DROP INDEX IF EXISTS idx_note_invitations_note_email_status;
ALTER TABLE note_invitations DROP COLUMN status;
CREATE INDEX idx_note_invitations_note_email ON note_invitations(note_id, email);
