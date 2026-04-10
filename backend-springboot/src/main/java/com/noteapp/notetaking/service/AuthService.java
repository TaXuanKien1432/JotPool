package com.noteapp.notetaking.service;

import com.noteapp.notetaking.dto.AuthResponseDTO;
import com.noteapp.notetaking.dto.LoginDTO;
import com.noteapp.notetaking.dto.RegisterDTO;
import com.noteapp.notetaking.dto.UserDTO;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.UserRepository;
import com.noteapp.notetaking.exception.BadRequestException;
import com.noteapp.notetaking.exception.ConflictException;
import com.noteapp.notetaking.exception.ResourceNotFoundException;
import com.noteapp.notetaking.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final NoteInvitationService noteInvitationService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Transactional
    public AuthResponseDTO register(RegisterDTO registerDTO) {
        String email = registerDTO.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email already in use");
        }
        User user = User.builder()
                .name(registerDTO.getName())
                .email(email)
                .passwordHash(passwordEncoder.encode(registerDTO.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        noteInvitationService.handlePendingInvitations(savedUser);
        String accessToken = jwtUtil.generateToken(savedUser.getEmail());
        return AuthResponseDTO.builder().accessToken(accessToken).build();
    }

    public AuthResponseDTO login(LoginDTO loginDTO) {
        String email = loginDTO.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getPasswordHash() == null) {
            throw new BadRequestException(
                    "This account uses " + user.getAuthProvider() + " login. Please sign in with " + user.getAuthProvider() + " or register to set a password.");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, loginDTO.getPassword())
        );
        if (user == null) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String accessToken = jwtUtil.generateToken(user.getEmail());
        return AuthResponseDTO.builder().accessToken(accessToken).build();
    }

    public void oauth2Success(HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        System.out.println(">>> oauth2Success email: " + email);
        if (email == null) email = oAuth2User.getAttribute("login") + "@github.local";
        String accessToken = jwtUtil.generateToken(email);
        String redirectUrl = frontendBaseUrl + "/oauth2/redirect?token=" + accessToken;

        response.sendRedirect(redirectUrl);
    }

    public UserDTO getCurrentUser(String accessToken) {
        String email = jwtUtil.extractEmail(accessToken);
        if (!jwtUtil.validateToken(accessToken, email)) {
            throw new BadCredentialsException("Invalid or expired token");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
