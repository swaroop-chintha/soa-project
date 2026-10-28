package com.aegis.auth.service.impl;

import com.aegis.auth.dto.LoginRequestDTO;
import com.aegis.auth.dto.LoginResponseDTO;
import com.aegis.auth.dto.OAuthCallbackRequestDTO;
import com.aegis.auth.dto.OAuthUrlResponseDTO;
import com.aegis.auth.dto.RegisterRequestDTO;
import com.aegis.auth.exception.InvalidCredentialsException;
import com.aegis.auth.service.AuthService;
import com.aegis.auth.util.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    public static class UserAccount {
        private final String username;
        private final String passwordHash;
        private final String role;
        private final String email;
        private final String fullName;
        private final String googleSub;

        public UserAccount(String username, String passwordHash, String role, String email, String fullName,
                String googleSub) {
            this.username = username;
            this.passwordHash = passwordHash;
            this.role = role;
            this.email = email;
            this.fullName = fullName;
            this.googleSub = googleSub;
        }

        public String getUsername() {
            return username;
        }

        public String getPasswordHash() {
            return passwordHash;
        }

        public String getRole() {
            return role;
        }

        public String getEmail() {
            return email;
        }

        public String getFullName() {
            return fullName;
        }

        public String getGoogleSub() {
            return googleSub;
        }
    }

    private final Map<String, UserAccount> userStore = new ConcurrentHashMap<>();
    private final Map<String, UserAccount> emailStore = new ConcurrentHashMap<>();
    private final Map<String, UserAccount> googleSubStore = new ConcurrentHashMap<>();
    private final Map<String, Long> validOAuthStates = new ConcurrentHashMap<>();

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${oauth2.google.client-id:}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth2.google.redirect-uri:http://localhost:8084/login/oauth2/code/google}")
    private String googleRedirectUri;

    @jakarta.annotation.PostConstruct
    public void initDiagnosticLog() {
        log.info(
                "Google OAuth service configuration status: clientIdConfigured={}, clientSecretConfigured={}, normalizedRedirectUri={}",
                (googleClientId != null && !googleClientId.isBlank()),
                (googleClientSecret != null && !googleClientSecret.isBlank()),
                googleRedirectUri != null ? googleRedirectUri.trim() : "NOT_SET");
    }

    public AuthServiceImpl(

            JwtTokenProvider jwtTokenProvider,
            RestTemplateBuilder restTemplateBuilder,
            @Value("${auth.users.admin.password:admin123}") String adminPassword,
            @Value("${auth.users.user.password:user123}") String userPassword) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();

        // Initialize admin account
        UserAccount adminUser = new UserAccount(
                "admin",
                passwordEncoder.encode(adminPassword),
                "ROLE_ADMIN",
                "admin@aegis.com",
                "System Administrator",
                null);
        userStore.put("admin", adminUser);
        emailStore.put("admin@aegis.com", adminUser);

        // Initialize default user account
        UserAccount regularUser = new UserAccount(
                "user",
                passwordEncoder.encode(userPassword),
                "ROLE_USER",
                "user@aegis.com",
                "Standard Policyholder",
                null);
        userStore.put("user", regularUser);
        emailStore.put("user@aegis.com", regularUser);
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        String identifier = loginRequest.getUsername().trim();
        String password = loginRequest.getPassword();

        // Support login by username or registered email
        UserAccount user = userStore.get(identifier.toLowerCase());
        if (user == null) {
            user = emailStore.get(identifier.toLowerCase());
        }

        if (user == null || user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

        return new LoginResponseDTO(
                token,
                "Bearer",
                user.getUsername(),
                user.getRole(),
                jwtTokenProvider.getExpirationMs());
    }

    @Override
    public LoginResponseDTO register(RegisterRequestDTO registerRequest) {
        String username = registerRequest.getUsername().trim();
        String email = registerRequest.getEmail().trim();
        String password = registerRequest.getPassword();
        String fullName = registerRequest.getFullName() != null ? registerRequest.getFullName().trim() : username;

        // Check for duplicate username
        if (userStore.containsKey(username.toLowerCase())) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        // Check for duplicate email
        if (emailStore.containsKey(email.toLowerCase())) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered");
        }

        // Enforce role policy: Public registration can NEVER assign ROLE_ADMIN
        String assignedRole = "ROLE_USER";

        String encodedPassword = passwordEncoder.encode(password);
        UserAccount newUser = new UserAccount(
                username,
                encodedPassword,
                assignedRole,
                email,
                fullName,
                null);

        userStore.put(username.toLowerCase(), newUser);
        emailStore.put(email.toLowerCase(), newUser);

        log.info("Registered new user: username={}, role={}", username, assignedRole);

        String token = jwtTokenProvider.generateToken(newUser.getUsername(), newUser.getRole());

        return new LoginResponseDTO(
                token,
                "Bearer",
                newUser.getUsername(),
                newUser.getRole(),
                jwtTokenProvider.getExpirationMs());
    }

    @Override
    public OAuthUrlResponseDTO getGoogleAuthorizationUrl() {
        if (googleClientId == null || googleClientId.isBlank() ||
                googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new IllegalStateException(
                    "Google OAuth credentials are not configured. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
        }

        // Purge expired states (>10 minutes)
        long now = System.currentTimeMillis();
        validOAuthStates.entrySet().removeIf(entry -> entry.getValue() < now);

        // Generate cryptographically random state
        String state = UUID.randomUUID().toString();
        validOAuthStates.put(state, now + 600000); // 10 minutes TTL

        String authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + URLEncoder.encode(googleClientId.trim(), StandardCharsets.UTF_8) +
                "&redirect_uri=" + URLEncoder.encode(googleRedirectUri.trim(), StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8) +
                "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8) +
                "&access_type=offline" +
                "&prompt=select_account";

        return new OAuthUrlResponseDTO(authUrl, state);
    }

    @Override
    @SuppressWarnings("unchecked")
    public LoginResponseDTO processGoogleOAuthCallback(OAuthCallbackRequestDTO callbackRequest) {
        if (googleClientId == null || googleClientId.isBlank() ||
                googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new IllegalStateException(
                    "Google OAuth credentials are not configured. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
        }

        String state = callbackRequest.getState();
        String code = callbackRequest.getCode();

        // 1. Validate state parameter (prevents CSRF and replay attacks)
        Long expiry = validOAuthStates.remove(state);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            throw new IllegalArgumentException(
                    "Invalid or expired OAuth state parameter. Please restart authentication.");
        }

        // 2. Server-side authorization code exchange with Google token endpoint
        log.info(
                "Initiating Google OAuth code exchange: endpointHost=oauth2.googleapis.com, clientIdConfigured={}, clientSecretConfigured={}, redirectUri={}",
                (googleClientId != null && !googleClientId.isBlank()),
                (googleClientSecret != null && !googleClientSecret.isBlank()),
                googleRedirectUri.trim());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> formParams = new LinkedMultiValueMap<>();
        formParams.add("code", code.trim());
        formParams.add("client_id", googleClientId.trim());
        formParams.add("client_secret", googleClientSecret.trim());
        formParams.add("redirect_uri", googleRedirectUri.trim());
        formParams.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(formParams, headers);

        Map<String, Object> tokenResponse;
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    requestEntity,
                    Map.class);
            tokenResponse = response.getBody();
        } catch (HttpStatusCodeException ex) {
            String sanitizedError = ex.getResponseBodyAsString()
                    .replaceAll("(?i)(client_secret|code|refresh_token|access_token|id_token)=\\S+", "$1=[REDACTED]");
            log.error("Google token exchange failed: endpointHost=oauth2.googleapis.com, httpStatus={}, response={}",
                    ex.getStatusCode(), sanitizedError);
            throw new IllegalArgumentException(
                    "Google authorization code exchange failed (" + ex.getStatusCode() + "): " + sanitizedError);
        } catch (Exception ex) {
            log.error("Error communicating with Google token endpoint: endpointHost=oauth2.googleapis.com, error={}",
                    ex.getMessage());
            throw new IllegalArgumentException("Unable to contact Google OAuth service: " + ex.getMessage());
        }

        if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
            throw new IllegalArgumentException("Google token exchange response did not contain an id_token");
        }

        String idToken = (String) tokenResponse.get("id_token");

        // 3. Cryptographically verify Google ID token claims using Google's tokeninfo
        // API
        Map<String, Object> tokenInfo;
        try {
            ResponseEntity<Map> tokenInfoResponse = restTemplate.getForEntity(
                    "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken,
                    Map.class);
            tokenInfo = tokenInfoResponse.getBody();
        } catch (HttpStatusCodeException ex) {
            log.error("Google token verification failed: {}", ex.getResponseBodyAsString());
            throw new IllegalArgumentException(
                    "Google identity token verification failed: " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("Error verifying Google identity token", ex);
            throw new IllegalArgumentException("Failed to verify Google token claims: " + ex.getMessage());
        }

        if (tokenInfo == null) {
            throw new IllegalArgumentException("Google tokeninfo returned an empty payload");
        }

        // Validate issuer, audience, and subject claims
        String iss = (String) tokenInfo.get("iss");
        if (iss == null || (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com"))) {
            throw new IllegalArgumentException("Invalid token issuer: " + iss);
        }

        String aud = (String) tokenInfo.get("aud");
        if (aud == null || !aud.equals(googleClientId.trim())) {
            throw new IllegalArgumentException(
                    "Invalid token audience. Expected " + googleClientId + " but received " + aud);
        }

        String sub = (String) tokenInfo.get("sub");
        if (sub == null || sub.isBlank()) {
            throw new IllegalArgumentException("Google identity subject identifier (sub) is missing");
        }

        String email = (String) tokenInfo.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google identity email claim is missing");
        }

        // Email verified check
        Object emailVerifiedObj = tokenInfo.get("email_verified");
        boolean emailVerified = emailVerifiedObj != null &&
                (Boolean.TRUE.equals(emailVerifiedObj) || "true".equalsIgnoreCase(String.valueOf(emailVerifiedObj)));
        if (!emailVerified) {
            throw new IllegalArgumentException("Google account email is not verified");
        }

        String name = (String) tokenInfo.getOrDefault("name", email.split("@")[0]);

        // 4. Resolve or create user account safely
        UserAccount user = googleSubStore.get(sub);
        if (user == null) {
            // Check if user with this email exists
            UserAccount existingByEmail = emailStore.get(email.toLowerCase());
            if (existingByEmail != null) {
                // Link Google identity to existing account safely (preserving existing role)
                user = new UserAccount(
                        existingByEmail.getUsername(),
                        existingByEmail.getPasswordHash(),
                        existingByEmail.getRole(),
                        existingByEmail.getEmail(),
                        existingByEmail.getFullName(),
                        sub);
                userStore.put(user.getUsername().toLowerCase(), user);
                emailStore.put(user.getEmail().toLowerCase(), user);
                googleSubStore.put(sub, user);
                log.info("Linked Google identity (sub={}) to existing user: {}", sub, user.getUsername());
            } else {
                // Register a new user with strictly ROLE_USER
                String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
                if (baseUsername.length() < 3)
                    baseUsername = "user_" + baseUsername;
                String finalUsername = baseUsername;
                int suffix = 1;
                while (userStore.containsKey(finalUsername.toLowerCase())) {
                    finalUsername = baseUsername + suffix++;
                }

                user = new UserAccount(
                        finalUsername,
                        null, // OAuth user with no local password
                        "ROLE_USER",
                        email,
                        name,
                        sub);
                userStore.put(finalUsername.toLowerCase(), user);
                emailStore.put(email.toLowerCase(), user);
                googleSubStore.put(sub, user);
                log.info("Created new user from Google OAuth: username={}, email={}, role=ROLE_USER", finalUsername,
                        email);
            }
        }

        // 5. Issue application's Aegis JWT
        String aegisJwt = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

        return new LoginResponseDTO(
                aegisJwt,
                "Bearer",
                user.getUsername(),
                user.getRole(),
                jwtTokenProvider.getExpirationMs());
    }
}
