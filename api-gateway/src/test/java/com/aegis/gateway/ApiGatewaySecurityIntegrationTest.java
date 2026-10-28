package com.aegis.gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@SuppressWarnings("null")
class ApiGatewaySecurityIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey key;

    @BeforeEach
    void setUp() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private String createTestToken(String username, String role, long durationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + durationMs);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("1. Public endpoint /auth/login is accessible without JWT")
    void testPublicAuthEndpoint() {
        webTestClient.post()
                .uri("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"username\":\"user\",\"password\":\"user123\"}")
                .exchange()
                // Should not return 401/403 from security filter
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(403, status);
                });
    }

    @Test
    @DisplayName("2. Missing JWT accessing protected endpoint -> 401 Unauthorized")
    void testMissingToken_Unauthorized() {
        webTestClient.get()
                .uri("/claims")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401)
                .jsonPath("$.error").isEqualTo("Unauthorized");
    }

    @Test
    @DisplayName("3. Malformed JWT -> 401 Unauthorized")
    void testMalformedToken_Unauthorized() {
        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-malformed-token")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    @DisplayName("4. Expired JWT -> 401 Unauthorized")
    void testExpiredToken_Unauthorized() {
        String expiredToken = createTestToken("user", "ROLE_USER", -10000); // Expired 10s ago

        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    @DisplayName("5. Invalid signature JWT -> 401 Unauthorized")
    void testInvalidSignatureToken_Unauthorized() {
        SecretKey wrongKey = Keys.hmacShaKeyFor("different_secret_key_that_is_at_least_32_bytes_long_12345".getBytes(StandardCharsets.UTF_8));
        String tamperedToken = Jwts.builder()
                .subject("admin")
                .claim("role", "ROLE_ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(wrongKey)
                .compact();

        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tamperedToken)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    @DisplayName("6. USER role attempting POST /policies -> 403 Forbidden")
    void testUserRole_PostPolicies_Forbidden() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        webTestClient.post()
                .uri("/policies")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"policyNumber\":\"POL1\"}")
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403)
                .jsonPath("$.error").isEqualTo("Forbidden");
    }

    @Test
    @DisplayName("7. USER role attempting PUT /policies/1 -> 403 Forbidden")
    void testUserRole_PutPolicies_Forbidden() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        webTestClient.put()
                .uri("/policies/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"policyNumber\":\"POL1\"}")
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403);
    }

    @Test
    @DisplayName("8. USER role attempting DELETE /policies/1 -> 403 Forbidden")
    void testUserRole_DeletePolicies_Forbidden() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        webTestClient.delete()
                .uri("/policies/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403);
    }

    @Test
    @DisplayName("9. USER role attempting claim status update -> 403 Forbidden")
    void testUserRole_PutClaimStatus_Forbidden() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        webTestClient.put()
                .uri("/claims/1/status")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"status\":\"APPROVED\"}")
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403);
    }

    @Test
    @DisplayName("10. ADMIN role accessing admin-only functionality -> Passes security filter")
    void testAdminRole_PostPolicies_Authorized() {
        String adminToken = createTestToken("admin", "ROLE_ADMIN", 60000);

        webTestClient.post()
                .uri("/policies")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"policyNumber\":\"POL_TEST\"}")
                .exchange()
                // Security filter passes: status must NOT be 401 Unauthorized or 403 Forbidden
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(403, status);
                });
    }

    @Test
    @DisplayName("11. ADMIN role accessing protected claims -> Passes security filter")
    void testAdminRole_GetClaims_Authorized() {
        String adminToken = createTestToken("admin", "ROLE_ADMIN", 60000);

        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(403, status);
                });
    }

    @Test
    @DisplayName("12. USER role accessing allowed protected policies -> Passes security filter")
    void testUserRole_GetPolicies_Authorized() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        webTestClient.get()
                .uri("/policies")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(403, status);
                });
    }

    @Test
    @DisplayName("13. Header spoofing rejected: External X-User-Name / X-User-Roles headers are stripped and not trusted")
    void testHeaderSpoofingRejected() {
        String userToken = createTestToken("user", "ROLE_USER", 60000);

        // Client attempts to spoof ADMIN role via headers while presenting USER token
        webTestClient.post()
                .uri("/policies")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken)
                .header("X-User-Name", "fake-admin")
                .header("X-User-Roles", "ROLE_ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"policyNumber\":\"POL_SPOOF\"}")
                .exchange()
                // Gateway security must rely on the JWT (which is ROLE_USER) and reject with 403 Forbidden!
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403);
    }

    @Test
    @DisplayName("14. Empty Bearer header ('Bearer ') -> 401 Unauthorized")
    void testEmptyBearerToken_Unauthorized() {
        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer ")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo(401)
                .jsonPath("$.error").isEqualTo("Unauthorized");
    }

    @Test
    @DisplayName("15. Unrecognized / Insufficient role ('ROLE_GUEST') attempting /claims -> 403 Forbidden")
    void testGuestRole_InsufficientPermissions_Forbidden() {
        String guestToken = createTestToken("guest", "ROLE_GUEST", 60000);

        webTestClient.get()
                .uri("/claims")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + guestToken)
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo(403)
                .jsonPath("$.error").isEqualTo("Forbidden");
    }
}
