package com.noteapp.notetaking.controller;

import com.noteapp.notetaking.dto.AuthResponseDTO;
import com.noteapp.notetaking.dto.LoginDTO;
import com.noteapp.notetaking.dto.RegisterDTO;
import com.noteapp.notetaking.dto.UserDTO;
import com.noteapp.notetaking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) throws Exception {
        try {
            AuthResponseDTO authResponseDTO = authService.register(registerDTO);
            return ResponseEntity.ok(authResponseDTO);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(400).body(Map.of("message", "Email already in use"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) throws Exception {
        try {
            AuthResponseDTO authResponseDTO = authService.login(loginDTO);
            return ResponseEntity.ok(authResponseDTO);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Missing Authorization header"));
        }
        if (!authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid token format"));
        }
        String accessToken = authHeader.substring(7);
        try {
            UserDTO userDTO = authService.getCurrentUser(accessToken);
            return ResponseEntity.ok(userDTO);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }
}
