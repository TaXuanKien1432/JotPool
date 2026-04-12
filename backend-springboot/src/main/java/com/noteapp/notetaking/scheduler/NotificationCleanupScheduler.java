package com.noteapp.notetaking.scheduler;

import com.noteapp.notetaking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldReadNotifications() {
        notificationService.deleteReadNotificationsOlderThan(30);
    }
}
