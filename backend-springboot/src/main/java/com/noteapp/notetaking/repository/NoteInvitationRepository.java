package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface NoteInvitationRepository extends JpaRepository<NoteInvitation, UUID> {
    boolean existsByNoteAndEmailAndStatusAndExpiresAtAfter(Note note, String email, String status, LocalDateTime time);
}
