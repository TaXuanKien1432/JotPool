package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.NoteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public List<Note> getNotesByUser(User owner) {
        return noteRepository.findAllByOwnerOrderByUpdatedAtDesc(owner);
    }

    public Note getNoteById(UUID id, User owner) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Note not found"));
        if (!note.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("You do not have access to this note");
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

    public Note updateNote(UUID id, Note updated, User owner) {
        Note note = getNoteById(id, owner);
        note.setTitle(updated.getTitle());
        note.setBody(updated.getBody());
        return noteRepository.save(note);
    }

    public void deleteNote(UUID id, User owner) {
        Note note = getNoteById(id, owner);
        noteRepository.delete(note);
    }
}
