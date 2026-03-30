package com.noteapp.notetaking.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
    private String name;
    private String email;
    private String password;
}
