package com.noteapp.notetaking.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component //Generate, Extract and Validate JWT
public class JwtUtil {
    private final SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .claims(claims)
                .subject(email)
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

    public String extractEmail(String accessToken) {
        return extractAllClaims(accessToken).getSubject();
    }

    public boolean isTokenExpired(String accessToken) {
        return extractAllClaims(accessToken).getExpiration().before(new Date());
    }

    public boolean validateToken(String accessToken, String email) {
        return email.equals(extractEmail(accessToken)) && !isTokenExpired(accessToken);
    }
}
