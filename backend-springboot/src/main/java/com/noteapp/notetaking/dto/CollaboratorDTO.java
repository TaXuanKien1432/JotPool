package com.noteapp.notetaking.dto;

import com.noteapp.notetaking.entity.NoteCollaborator;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorDTO {
    private UUID id;
    private String name;
    private String email;
    private String role;

    public static CollaboratorDTO from(NoteCollaborator collaborator) {
        return CollaboratorDTO.builder()
                .id(collaborator.getUser().getId())
                .name(collaborator.getUser().getName())
                .email(collaborator.getUser().getEmail())
                .role(collaborator.getRole())
                .build();
    }
}
