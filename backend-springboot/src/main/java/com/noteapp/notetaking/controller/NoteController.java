package com.noteapp.notetaking.controller;

import com.noteapp.notetaking.dto.NoteInviteRequestDTO;
import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.service.NoteService;
import com.noteapp.notetaking.service.UserService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Note>> getNotesByUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        List<Note> notes = noteService.getNotesByUser(user);
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        Note note = noteService.getNoteById(id, user);
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        Note note = noteService.createNote(user);
        return ResponseEntity.ok(note);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable UUID id, @RequestBody Note updated, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        Note note = noteService.updateNote(id, updated, user);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        noteService.deleteNote(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NoteInviteRequestDTO noteInviteRequestDTO) {
        User inviter = userService.getFromUserDetails(userDetails);

        try {
            noteService.inviteUser(noteInviteRequestDTO.getEmail(), id, inviter, noteInviteRequestDTO.getRole());
        } catch (MessagingException e) {
            return ResponseEntity.status(502).body(Map.of("message", "Failed to send invitation email"));
        }

        return ResponseEntity.noContent().build();
    }
}
