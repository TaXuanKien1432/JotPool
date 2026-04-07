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
    private UUID userId;
    private String name;
    private String email;
    private String profilePicture;
    private String role;

    public static CollaboratorDTO from(NoteCollaborator collaborator) {
        return CollaboratorDTO.builder()
                .userId(collaborator.getUser().getId())
                .name(collaborator.getUser().getName())
                .email(collaborator.getUser().getEmail())
                .profilePicture(collaborator.getUser().getProfilePicture())
                .role(collaborator.getRole())
                .build();
    }
}
