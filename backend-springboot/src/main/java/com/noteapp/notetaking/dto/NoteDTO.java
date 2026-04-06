package com.noteapp.notetaking.dto;

import com.noteapp.notetaking.entity.Note;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteDTO {
    private UUID id;
    private String title;
    private String body;
    private boolean collaborative;
    private UUID ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteDTO from(Note note) {
        return NoteDTO.builder()
                .id(note.getId())
                .title(note.getTitle())
                .body(note.getBody())
                .collaborative(note.isCollaborative())
                .ownerId(note.getOwner().getId())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
