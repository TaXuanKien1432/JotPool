package com.noteapp.notetaking.controller;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getNotesByUser(@AuthenticationPrincipal User userDetails) {
        List<Note> notes = noteService.getNotesByUser(userDetails);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable UUID id, @AuthenticationPrincipal User userDetails) {
        Note note = noteService.getNoteById(id, userDetails);
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@AuthenticationPrincipal User userDetails) {
        Note note = noteService.createNote(userDetails);
        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable UUID id, @RequestBody Note updated, @AuthenticationPrincipal User userDetails) {
        Note note = noteService.updateNote(id, updated, userDetails);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID id, @AuthenticationPrincipal User userDetails) {
        noteService.deleteNote(id, userDetails);
        return ResponseEntity.noContent().build();
    }
}
