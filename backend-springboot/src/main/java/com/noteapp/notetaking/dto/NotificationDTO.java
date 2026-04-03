package com.noteapp.notetaking.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private UUID id;
    private String type;
    private String payload;
    private boolean isRead;
    private LocalDateTime createdAt;
}
