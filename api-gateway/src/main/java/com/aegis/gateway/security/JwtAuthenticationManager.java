package com.aegis.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtValidator jwtValidator;

    public JwtAuthenticationManager(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials().toString();

        Claims claims = jwtValidator.validateAndExtractClaims(token);
        if (claims == null) {
            return Mono.error(new BadCredentialsException("Invalid or expired JWT token"));
        }

        String username = claims.getSubject();
        String role = claims.get("role", String.class);

        if (role == null) {
            role = "ROLE_USER";
        }
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, token, authorities);

        return Mono.just(auth);
    }
}
