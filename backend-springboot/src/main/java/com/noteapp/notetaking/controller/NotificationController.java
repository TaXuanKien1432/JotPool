package com.noteapp.notetaking.controller;

import com.noteapp.notetaking.dto.NotificationDTO;
import com.noteapp.notetaking.entity.Notification;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.service.NotificationService;
import com.noteapp.notetaking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final UserService userService;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getFromUserDetails(userDetails);
        List<Notification> notifications = notificationService.getNotificationsByUser(user);
        List<NotificationDTO> notificationDTOS = notifications.stream()
                .map(NotificationDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(notificationDTOS);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeIsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("is_read") boolean isRead
            ) {
        User user = userService.getFromUserDetails(userDetails);
        notificationService.changeIsRead(id, user, isRead);
        return ResponseEntity.noContent().build();
    }
}
