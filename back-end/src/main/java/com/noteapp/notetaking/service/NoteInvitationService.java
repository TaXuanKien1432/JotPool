package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteInvitation;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteInvitationService {
    private final NoteInvitationRepository noteInvitationRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final NoteCollaboratorRepository noteCollaboratorRepository;
    private final NotificationService notificationService;

    @Transactional
    public void inviteUser(UUID noteId, User inviter, String email, String role) {
        email = email.trim().toLowerCase();
        Note note = noteRepository.findById(noteId)
            .orElseThrow(() -> new RuntimeException("Note not found"));

        boolean isOwner = note.getOwner().getId().equals(inviter.getId());
        boolean isEditor = noteCollaboratorRepository
                .findByNoteAndUser(note, inviter)
                .map(c -> c.getRole().equals("EDITOR"))
                .orElse(false);
        if (!isOwner && !isEditor) throw new RuntimeException("No permission to invite");

        if (inviter.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Inviter cannot invite him/herself");
        }

        if (!List.of("EDITOR", "VIEWER").contains(role)) throw new RuntimeException("Invalid role");

        User invitee = userRepository.findByEmail(email).orElse(null);
        if (invitee != null && noteCollaboratorRepository.existsByNoteAndUser(note, invitee)) {
            throw new RuntimeException("User already a collaborator");
        }

        boolean invitationExists = noteInvitationRepository
                .existsByNoteAndEmailAndStatusAndExpiresAtAfter(note, email, "PENDING", LocalDateTime.now());
        if (invitationExists) throw new RuntimeException("Invitation already sent");

        String token = UUID.randomUUID() + "-" + System.currentTimeMillis();
        NoteInvitation noteInvitation = NoteInvitation.builder()
                .id(UUID.randomUUID())
                .note(note)
                .email(email)
                .inviter(inviter)
                .invitee(invitee)
                .token(token)
                .role(role)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        NoteInvitation savedInvitation = noteInvitationRepository.save(noteInvitation);

        if (invitee != null) {
            notificationService.createInvitationNotification(savedInvitation.getId(), inviter, note, invitee);
        }
    }
}
