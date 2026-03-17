package com.noteapp.notetaking.service;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.repository.NoteRepository;
import com.noteapp.notetaking.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    public List<Note> getNotesByUser(User userDetails) {
        String email = userDetails.getUsername();
        com.noteapp.notetaking.entity.User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        return noteRepository.findAllByOwnerOrderByUpdatedAtDesc(owner);
    }

    public Note getNoteById(UUID id, User userDetails) {
        String email = userDetails.getUsername();
        com.noteapp.notetaking.entity.User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        Note note = noteRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Note not found"));
        if (!note.getOwner().getId().equals(owner.getId())) {
            throw new SecurityException("You do not have access to this note");
        }
        return note;
    }

    public Note createNote(User userDetails) {
        String email = userDetails.getUsername();
        com.noteapp.notetaking.entity.User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found: " + email));
        Note note = new Note();
        note.setOwner(owner);
        note.setTitle("");
        note.setBody("[]");
        return noteRepository.save(note);
    }

    public Note updateNote(UUID id, Note updated, User userDetails) {
        Note note = getNoteById(id, userDetails);
        note.setTitle(updated.getTitle());
        note.setBody(updated.getBody());
        return noteRepository.save(note);
    }

    public void deleteNote(UUID id, User userDetails) {
        Note note = getNoteById(id, userDetails);
        noteRepository.delete(note);
    }
}
