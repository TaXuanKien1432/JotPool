package com.noteapp.notetaking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.Notification;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.exception.ForbiddenException;
import com.noteapp.notetaking.exception.ResourceNotFoundException;
import com.noteapp.notetaking.repository.NotificationRepository;
import java.time.LocalDateTime;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void createCollaboratorAddedNotification(User inviter, Note note, User invitee, String role) {
        Map<String, Object> payloadObj = Map.ofEntries(
                Map.entry("noteId", note.getId().toString()),
                Map.entry("noteTitle", note.getTitle()),
                Map.entry("inviterName", inviter.getName()),
                Map.entry("inviterEmail", inviter.getEmail()),
                Map.entry("role", role)
        );
        String payload;
        try {
            payload = objectMapper.writeValueAsString(payloadObj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON conversion error");
        }

        Notification notification = Notification.builder()
                .user(invitee)
                .payload(payload)
                .type("COLLABORATOR_ADDED")
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getNotificationsByUserAndIsReadFalse(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void deleteReadNotificationsOlderThan(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        int deleted = notificationRepository.deleteReadNotificationsOlderThan(cutoff);
        System.out.println("Deleted " + deleted + " read notifications older than " + days + " days");
    }

    @Transactional
    public void markAllAsRead(User user) {
        int updated = notificationRepository.markAllAsRead(user);
        System.out.println("Marked " + updated + " notifications as read for user " + user.getEmail());
    }

    @Transactional
    public void changeIsRead(UUID notificationId, User user, boolean isRead) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) throw new ForbiddenException("No permission to change read status");
        notification.setRead(isRead);
    }
}
