package com.aegis.auth.controller;

import com.aegis.auth.dto.LoginRequestDTO;
import com.aegis.auth.dto.LoginResponseDTO;
import com.aegis.auth.dto.OAuthCallbackRequestDTO;
import com.aegis.auth.dto.OAuthUrlResponseDTO;
import com.aegis.auth.dto.RegisterRequestDTO;
import com.aegis.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Management", description = "Endpoints for user authentication, registration, Google OAuth, and JWT token issuance")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Authenticates user credentials and returns a signed JWT bearer token with assigned roles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Validation error on credentials payload")
    })
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Registers a new user account with ROLE_USER and returns a signed JWT bearer token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Validation error, duplicate username, or duplicate email")
    })
    public ResponseEntity<LoginResponseDTO> register(@Valid @RequestBody RegisterRequestDTO registerRequest) {
        LoginResponseDTO response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/oauth2/google/url")
    @Operation(summary = "Get Google OAuth authorization URL", description = "Generates a cryptographically random OAuth state and constructs Google OAuth 2.0 authorization URL")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authorization URL generated"),
            @ApiResponse(responseCode = "503", description = "Google OAuth credentials not configured")
    })
    public ResponseEntity<OAuthUrlResponseDTO> getGoogleAuthorizationUrl() {
        OAuthUrlResponseDTO response = authService.getGoogleAuthorizationUrl();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth2/callback/google")
    @Operation(summary = "Exchange Google OAuth code", description = "Exchanges Google authorization code for identity tokens, validates ID claims, resolves/registers user, and issues Aegis JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "OAuth authentication successful"),
            @ApiResponse(responseCode = "400", description = "Invalid code, expired state, or token claim verification failed"),
            @ApiResponse(responseCode = "503", description = "Google OAuth credentials not configured or upstream error")
    })
    public ResponseEntity<LoginResponseDTO> processGoogleOAuthCallback(@Valid @RequestBody OAuthCallbackRequestDTO callbackRequest) {
        LoginResponseDTO response = authService.processGoogleOAuthCallback(callbackRequest);
        return ResponseEntity.ok(response);
    }
}
