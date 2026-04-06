package com.noteapp.notetaking.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNoteRequestDTO {
    private String title;
    private String body;
}
