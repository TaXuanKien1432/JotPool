package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findAllByOwnerOrderByUpdatedAtDesc(User owner);
}
