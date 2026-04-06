package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByOwnerOrderByUpdatedAtDesc(User owner);

    @Query("""
            SELECT DISTINCT n FROM Note n
            LEFT JOIN NoteCollaborator c ON c.note = n
            WHERE n.owner = :user OR c.user = :user
            ORDER BY n.updatedAt DESC
            """)
    List<Note> findAccessibleByUserOrderByUpdatedAtDesc(@Param("user") User user);
}
