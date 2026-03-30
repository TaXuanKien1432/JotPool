package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteInvitation;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteInvitationService {
    private final NoteInvitationRepository noteInvitationRepository;

    public void createNoteInvitation(Note note, User inviter, String email, String role) {
        NoteInvitation noteInvitation = NoteInvitation.builder()
                .id(UUID.randomUUID())
                .note(note)
                .email(email)
                .inviter(inviter)
                .status("PENDING")
                .role(role)
                .token(UUID.randomUUID() + "-" + System.currentTimeMillis())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        noteInvitationRepository.save(noteInvitation);
    }

    public boolean hasPendingInvitation(Note note, String email) {
        return noteInvitationRepository
                .existsByNoteAndEmailAndStatusAndExpiresAtAfter(note, email, "PENDING", LocalDateTime.now());
    }
}
