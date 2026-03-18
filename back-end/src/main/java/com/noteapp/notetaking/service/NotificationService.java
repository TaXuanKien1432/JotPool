package com.noteapp.notetaking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.Notification;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void createInvitationNotification(UUID invitationId, User inviter, Note note, User invitee) {
        Map<String, Object> payloadObj = Map.ofEntries(
                Map.entry("invitationId", invitationId.toString()),
                Map.entry("noteId", note.getId().toString()),
                Map.entry("noteTitle", note.getTitle()),
                Map.entry("inviterName", inviter.getName()),
                Map.entry("inviterEmail", inviter.getEmail())
        );
        String payload;
        try {
            payload = objectMapper.writeValueAsString(payloadObj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON conversion error");
        }

        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .user(invitee)
                .payload(payload)
                .type("INVITATION")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }
}
