package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.Notification;
import com.noteapp.notetaking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.createdAt < :cutoff")
    int deleteReadNotificationsOlderThan(LocalDateTime cutoff);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
    int markAllAsRead(User user);
}
