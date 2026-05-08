package com.noteapp.notetaking.controller;

import com.noteapp.notetaking.dto.AccessDTO;
import com.noteapp.notetaking.service.NoteService;
import com.noteapp.notetaking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/notes")
@RequiredArgsConstructor
public class InternalNoteController {
    private final NoteService noteService;
    private final UserService userService;

    @GetMapping("/{id}/access")
    public ResponseEntity<AccessDTO> getAccess(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(noteService.getAccess(id, userId));
    }
}
