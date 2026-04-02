package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteInvitation;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteInvitationService {
    private final NoteInvitationRepository noteInvitationRepository;
    private final NoteCollaboratorService noteCollaboratorService;
    private final NotificationService notificationService;

    public void createNoteInvitation(Note note, User inviter, String email, String role) {
        NoteInvitation noteInvitation = NoteInvitation.builder()
                .id(UUID.randomUUID())
                .note(note)
                .email(email)
                .inviter(inviter)
                .role(role)
                .token(UUID.randomUUID() + "-" + System.currentTimeMillis())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        noteInvitationRepository.save(noteInvitation);
    }

    public boolean hasPendingInvitation(Note note, String email) {
        return noteInvitationRepository
                .existsByNoteAndEmailAndExpiresAtAfter(note, email, LocalDateTime.now());
    }

    public void handlePendingInvitations(User user) {
        List<NoteInvitation> pendingInvitations = noteInvitationRepository
                .findByEmailAndExpiresAtAfter(user.getEmail(), LocalDateTime.now());
        for (NoteInvitation invitation : pendingInvitations) {
            noteCollaboratorService.createNoteCollaborator(invitation.getNote(), user, invitation.getRole());
            notificationService.createCollaboratorAddedNotification(
                    invitation.getInviter(), invitation.getNote(), user, invitation.getRole());
        }
        noteInvitationRepository.deleteAll(pendingInvitations);
    }
}
