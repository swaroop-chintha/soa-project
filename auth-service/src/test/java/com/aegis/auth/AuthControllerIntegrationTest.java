package com.aegis.auth;

import com.aegis.auth.dto.LoginRequestDTO;
import com.aegis.auth.dto.OAuthCallbackRequestDTO;
import com.aegis.auth.dto.RegisterRequestDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "oauth2.google.client-id=test-google-client-id.apps.googleusercontent.com",
        "oauth2.google.client-secret=test-google-client-secret",
        "oauth2.google.redirect-uri=http://localhost:3000/oauth2/callback"
})
@AutoConfigureMockMvc
@SuppressWarnings("null")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Valid admin login -> 200 OK with JWT token and ROLE_ADMIN")
    void testAdminLogin_Success() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin", "admin123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token", not(emptyOrNullString())))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.role", is("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("2. Valid user login -> 200 OK with JWT token and ROLE_USER")
    void testUserLogin_Success() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("user", "user123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.username", is("user")))
                .andExpect(jsonPath("$.role", is("ROLE_USER")));
    }

    @Test
    @DisplayName("3. Invalid username -> 401 Unauthorized")
    void testInvalidUsername_Unauthorized() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("nonexistent_user", "password123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("4. Invalid password -> 401 Unauthorized")
    void testInvalidPassword_Unauthorized() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("admin", "wrong_password");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("5. Missing credentials -> 400 Bad Request")
    void testMissingCredentials_BadRequest() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("", "");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors.username").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("6. Successful registration -> 201 Created with JWT and strictly ROLE_USER")
    void testRegistration_Success() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Alice Smith",
                "alicesmith",
                "alice.smith@example.com",
                "SecurePassword123"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.username", is("alicesmith")))
                .andExpect(jsonPath("$.role", is("ROLE_USER")));

        // Verify newly registered user can subsequently login
        LoginRequestDTO loginRequest = new LoginRequestDTO("alicesmith", "SecurePassword123");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("alicesmith")))
                .andExpect(jsonPath("$.role", is("ROLE_USER")));
    }

    @Test
    @DisplayName("7. Duplicate username registration -> 400 Bad Request")
    void testRegistration_DuplicateUsername() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Admin Duplicate",
                "admin", // already taken by initial admin
                "unique.email@example.com",
                "Password123"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Username 'admin' is already taken")));
    }

    @Test
    @DisplayName("8. Duplicate email registration -> 400 Bad Request")
    void testRegistration_DuplicateEmail() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Duplicate Email User",
                "newuser123",
                "user@aegis.com", // already taken by initial user
                "Password123"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email 'user@aegis.com' is already registered")));
    }

    @Test
    @DisplayName("9. Registration validation failure -> 400 Bad Request")
    void testRegistration_ValidationFailure() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "Bob",
                "b", // too short (min 3)
                "invalid-email", // invalid email
                "123" // too short (min 6)
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.username").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("10. Google OAuth authorization URL -> 200 OK with state and Google URL")
    void testGoogleOAuthUrl_Success() throws Exception {
        mockMvc.perform(get("/auth/oauth2/google/url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorizationUrl", containsString("accounts.google.com/o/oauth2/v2/auth")))
                .andExpect(jsonPath("$.authorizationUrl", containsString("test-google-client-id.apps.googleusercontent.com")))
                .andExpect(jsonPath("$.authorizationUrl", containsString("http%3A%2F%2Flocalhost%3A3000%2Foauth2%2Fcallback")))
                .andExpect(jsonPath("$.state").isString())
                .andExpect(jsonPath("$.state", not(emptyOrNullString())));
    }

    @Test
    @DisplayName("11. Google OAuth callback with invalid state -> 400 Bad Request")
    void testGoogleOAuthCallback_InvalidState() throws Exception {
        OAuthCallbackRequestDTO request = new OAuthCallbackRequestDTO("fake-code-123", "invalid-unissued-state");

        mockMvc.perform(post("/auth/oauth2/callback/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid or expired OAuth state")));
    }
}
