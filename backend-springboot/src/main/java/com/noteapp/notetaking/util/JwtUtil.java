package com.noteapp.notetaking.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component //Generate, Extract and Validate JWT
public class JwtUtil {
    private final SecretKey SECRET_KEY;
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    public JwtUtil(@Value("${app.jwt-secret}") String jwtSecret) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UUID userId) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .claims(claims)
                .subject(userId.toString())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Claims extractAllClaims(String accessToken) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(accessToken)
                .getPayload();
    }

    public UUID extractUserId(String accessToken) {
        return UUID.fromString(extractAllClaims(accessToken).getSubject());
    }

    public boolean isTokenExpired(String accessToken) {
        return extractAllClaims(accessToken).getExpiration().before(new Date());
    }

    public boolean validateToken(String accessToken, UUID userId) {
        return userId.equals(extractUserId(accessToken)) && !isTokenExpired(accessToken);
    }
}
