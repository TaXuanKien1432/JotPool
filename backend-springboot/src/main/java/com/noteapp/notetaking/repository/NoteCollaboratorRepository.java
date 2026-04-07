package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.Note;
import com.noteapp.notetaking.entity.NoteCollaborator;
import com.noteapp.notetaking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteCollaboratorRepository extends JpaRepository<NoteCollaborator, UUID> {
    boolean existsByNoteAndUser(Note note, User user);
    Optional<NoteCollaborator> findByNoteAndUser(Note note, User user);
    List<NoteCollaborator> findByNote(Note note);
}
