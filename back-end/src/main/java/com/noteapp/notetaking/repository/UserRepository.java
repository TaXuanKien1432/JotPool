package com.noteapp.notetaking.repository;

import com.noteapp.notetaking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;


public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(UUID id);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByGithubId(String githubId);
}
