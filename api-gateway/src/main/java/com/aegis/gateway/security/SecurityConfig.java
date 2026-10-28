package com.aegis.gateway.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
@SuppressWarnings("null")
public class SecurityConfig {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8080}")
    private String allowedOrigins;

    @Bean
    public org.springframework.web.cors.reactive.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        java.util.List<String> origins = java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        for (String origin : origins) {
            configuration.addAllowedOriginPattern(origin);
        }
        configuration.addAllowedOriginPattern("chrome-extension://*");
        configuration.addAllowedOriginPattern("moz-extension://*");
        configuration.addAllowedOriginPattern("*");
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setExposedHeaders(java.util.List.of("X-Correlation-ID", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            JwtAuthenticationManager authenticationManager,
            JwtServerAuthenticationConverter authenticationConverter) {

        AuthenticationWebFilter authenticationWebFilter =
                new AuthenticationWebFilter(authenticationManager);
        authenticationWebFilter.setServerAuthenticationConverter(authenticationConverter);
        authenticationWebFilter.setAuthenticationFailureHandler(
                new org.springframework.security.web.server.authentication.ServerAuthenticationEntryPointFailureHandler(authenticationEntryPoint()));

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        // Preflight OPTIONS requests
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        // Public Endpoints
                        .pathMatchers("/auth/**", "/api/v1/auth/**", "/login/oauth2/code/**").permitAll()
                        .pathMatchers("/actuator/health", "/actuator/info").permitAll()

                        .pathMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/webjars/**").permitAll()
                        .pathMatchers("/ws-claims/**", "/api/v1/ws-claims/**").permitAll()

                        // Policy validation accessible to USER and ADMIN
                        .pathMatchers(HttpMethod.POST, "/policies/*/validate", "/api/v1/policies/*/validate").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.GET, "/policies/*/validate", "/api/v1/policies/*/validate").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // ADMIN Only Operations
                        .pathMatchers(HttpMethod.POST, "/policies", "/policies/**", "/api/v1/policies", "/api/v1/policies/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/policies", "/policies/**", "/api/v1/policies", "/api/v1/policies/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.DELETE, "/policies", "/policies/**", "/api/v1/policies", "/api/v1/policies/**").hasAuthority("ROLE_ADMIN")
                        .pathMatchers(HttpMethod.PUT, "/claims/*/status", "/api/v1/claims/*/status").hasAuthority("ROLE_ADMIN")

                        // USER & ADMIN Allowed Operations
                        .pathMatchers(HttpMethod.GET, "/policies", "/policies/**", "/api/v1/policies", "/api/v1/policies/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.POST, "/claims", "/claims/**", "/api/v1/claims", "/api/v1/claims/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.GET, "/claims", "/claims/**", "/api/v1/claims", "/api/v1/claims/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.GET, "/approvals", "/approvals/**", "/api/v1/approvals", "/api/v1/approvals/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                        .pathMatchers(HttpMethod.POST, "/approvals", "/approvals/**", "/api/v1/approvals", "/api/v1/approvals/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // Any other request must be authenticated
                        .anyExchange().authenticated()
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .build();
    }

    @Bean
    public org.springframework.cloud.gateway.filter.GlobalFilter identityHeaderFilter() {
        return (exchange, chain) -> {
            // Anti-spoofing: remove untrusted external identity headers
            org.springframework.http.server.reactive.ServerHttpRequest.Builder requestBuilder =
                    exchange.getRequest().mutate()
                            .headers(httpHeaders -> {
                                httpHeaders.remove("X-User-Name");
                                httpHeaders.remove("X-User-Roles");
                            });

            return org.springframework.security.core.context.ReactiveSecurityContextHolder.getContext()
                    .filter(c -> c.getAuthentication() != null && c.getAuthentication().isAuthenticated())
                    .map(org.springframework.security.core.context.SecurityContext::getAuthentication)
                    .map(auth -> {
                        String username = auth.getName();
                        String roles = auth.getAuthorities().stream()
                                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                                .collect(java.util.stream.Collectors.joining(","));
                        return exchange.mutate()
                                .request(requestBuilder
                                        .header("X-User-Name", username)
                                        .header("X-User-Roles", roles)
                                        .build())
                                .build();
                    })
                    .defaultIfEmpty(exchange.mutate().request(requestBuilder.build()).build())
                    .flatMap(chain::filter);
        };
    }

    @Bean
    public ServerAuthenticationEntryPoint authenticationEntryPoint() {
        return (exchange, ex) -> {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("timestamp", LocalDateTime.now().toString());
            responseBody.put("status", HttpStatus.UNAUTHORIZED.value());
            responseBody.put("error", "Unauthorized");
            responseBody.put("message", "Authentication token is missing or invalid");
            responseBody.put("path", exchange.getRequest().getPath().value());

            byte[] bytes;
            try {
                bytes = objectMapper.writeValueAsBytes(responseBody);
            } catch (JsonProcessingException e) {
                bytes = "{\"status\":401,\"error\":\"Unauthorized\"}".getBytes(StandardCharsets.UTF_8);
            }

            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        };
    }

    @Bean
    public ServerAccessDeniedHandler accessDeniedHandler() {
        return (exchange, denied) -> {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("timestamp", LocalDateTime.now().toString());
            responseBody.put("status", HttpStatus.FORBIDDEN.value());
            responseBody.put("error", "Forbidden");
            responseBody.put("message", "Access Denied: Insufficient permissions for role");
            responseBody.put("path", exchange.getRequest().getPath().value());

            byte[] bytes;
            try {
                bytes = objectMapper.writeValueAsBytes(responseBody);
            } catch (JsonProcessingException e) {
                bytes = "{\"status\":403,\"error\":\"Forbidden\"}".getBytes(StandardCharsets.UTF_8);
            }

            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        };
    }
}
