package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.exception.BadRequestException;
import com.noteapp.notetaking.exception.ConflictException;
import com.noteapp.notetaking.exception.ForbiddenException;
import com.noteapp.notetaking.exception.ResourceNotFoundException;
import com.noteapp.notetaking.repository.NoteRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final NoteCollaboratorService noteCollaboratorService;
    private final UserService userService;
    private final NoteInvitationService noteInvitationService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    public List<Note> getNotesByUser(User user) {
        return noteRepository.findAccessibleByUserOrderByUpdatedAtDesc(user);
    }

    public Note getNoteById(UUID id, User user) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        boolean isOwner = note.getOwner().getId().equals(user.getId());
        boolean isCollaborator = noteCollaboratorService.existsByNoteAndUser(note, user);
        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("You do not have access to this note");
        }
        return note;
    }

    public Note createNote(User owner) {
        Note note = Note.builder()
            .owner(owner)
            .title("")
            .body("[]")
            .build();
        return noteRepository.save(note);
    }

    public Note updateNote(UUID id, String title, String body, User user) {
        Note note = getNoteById(id, user);
        note.setTitle(title);
        note.setBody(body);
        return noteRepository.save(note);
    }

    public void deleteNote(UUID id, User owner) {
        Note note = getNoteById(id, owner);
        noteRepository.delete(note);
    }

    @Transactional
    public void inviteUser(String email, UUID noteId, User inviter, String role) throws MessagingException {
        email = email.trim().toLowerCase();
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        boolean isOwner = note.getOwner().getId().equals(inviter.getId());
        boolean isEditor = noteCollaboratorService.isEditor(note, inviter);
        if (!isOwner && !isEditor) throw new ForbiddenException("No permission to invite");

        if (inviter.getEmail().equalsIgnoreCase(email)) {
            throw new BadRequestException("You cannot invite yourself");
        }

        if (!List.of("EDITOR", "VIEWER").contains(role)) throw new BadRequestException("Invalid role");


        User invitee = userService.findByEmail(email).orElse(null);
        if (invitee != null) {
            if (noteCollaboratorService.existsByNoteAndUser(note, invitee)) throw new ConflictException("User already a collaborator");
            // create new note collaborator immediately, create new notification, also send email
            noteCollaboratorService.createNoteCollaborator(note, invitee, role);
            notificationService.createCollaboratorAddedNotification(inviter, note, invitee, role);

            String noteUrl = frontendBaseUrl + "/home/" + noteId;
            emailService.sendCollaborationEmail(email, inviter.getName(), note.getTitle(), role, noteUrl);
        }
        else {
            // create new note invitation, also send email
            if (noteInvitationService.hasPendingInvitation(note, email)) throw new ConflictException("Invitation already sent");
            noteInvitationService.createNoteInvitation(note, inviter, email, role);

            String registerUrl = frontendBaseUrl + "/signup?redirect=/home/" + noteId;
            emailService.sendInvitationEmail(email, inviter.getName(), note.getTitle(), role, registerUrl);
        }
    }
}
