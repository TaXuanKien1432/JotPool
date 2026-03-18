package com.noteapp.notetaking.service;

import com.noteapp.notetaking.dto.AuthResponseDTO;
import com.noteapp.notetaking.dto.LoginDTO;
import com.noteapp.notetaking.dto.RegisterDTO;
import com.noteapp.notetaking.dto.UserDTO;
import com.noteapp.notetaking.entity.User;
import com.noteapp.notetaking.repository.UserRepository;
import com.noteapp.notetaking.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponseDTO register(RegisterDTO registerDTO) throws ResponseStatusException {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(409), "Email already in use");
        }
        User user = User.builder()
                .name(registerDTO.getName())
                .email(registerDTO.getEmail())
                .passwordHash(passwordEncoder.encode(registerDTO.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String accessToken = jwtUtil.generateToken(saved.getEmail());
        return AuthResponseDTO.builder().accessToken(accessToken).build();
    }

    public AuthResponseDTO login(LoginDTO loginDTO) throws BadCredentialsException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
        );
        User user = userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        String accessToken = jwtUtil.generateToken(user.getEmail());
        return AuthResponseDTO.builder().accessToken(accessToken).build();
    }

    public void oauth2Success(HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        System.out.println(">>> oauth2Success email: " + email);
        if (email == null) email = oAuth2User.getAttribute("login") + "@github.local";
        String accessToken = jwtUtil.generateToken(email);
        String redirectUrl = "http://localhost:5173/oauth2/redirect?token=" + accessToken;

        response.sendRedirect(redirectUrl);
    }

    public UserDTO getCurrentUser(String accessToken) {
        String email = jwtUtil.extractEmail(accessToken);
        if (!jwtUtil.validateToken(accessToken, email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
