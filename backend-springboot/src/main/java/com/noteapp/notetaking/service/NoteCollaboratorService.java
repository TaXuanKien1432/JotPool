package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteCollaborator;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.NoteCollaboratorRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteCollaboratorService {
    private final NoteCollaboratorRepository noteCollaboratorRepository;

    public List<NoteCollaborator> getCollaboratorsByNote(Note note) {
        return noteCollaboratorRepository.findByNote(note);
    }

    public boolean isEditor(Note note, User user) {
        return noteCollaboratorRepository
                .findByNoteAndUser(note, user)
                .map(c -> c.getRole().equals("EDITOR"))
                .orElse(false);
    }

    public boolean existsByNoteAndUser(Note note, User user) {
        return noteCollaboratorRepository.existsByNoteAndUser(note, user);
    }

    @Transactional
    public void removeCollaborator(Note note, UUID collaboratorUserId, User requester) {
        boolean isOwner = note.getOwner().getId().equals(requester.getId());
        boolean isSelfRemoval = requester.getId().equals(collaboratorUserId);
        if (!isOwner && !isSelfRemoval) {
            throw new SecurityException("No permission to remove collaborator");
        }

        List<NoteCollaborator> collaborators = noteCollaboratorRepository.findByNote(note);
        NoteCollaborator collaborator = collaborators.stream()
                .filter(c -> c.getUser().getId().equals(collaboratorUserId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Collaborator not found"));

        noteCollaboratorRepository.delete(collaborator);

        if (collaborators.size() == 1 && note.isCollaborative()) {
            note.setCollaborative(false);
        }
    }

    public void createNoteCollaborator(Note note, User user, String role) {
        NoteCollaborator noteCollaborator = NoteCollaborator.builder()
                .note(note)
                .user(user)
                .role(role)
                .build();
        noteCollaboratorRepository.save(noteCollaborator);
        if (!note.isCollaborative()) {
            note.setCollaborative(true);
        }
    }
}
