package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteCollaborator;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.NoteCollaboratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
