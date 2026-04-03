package com.noteapp.notetaking.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoteInviteRequestDTO {
    private String email;
    private String role;
}
