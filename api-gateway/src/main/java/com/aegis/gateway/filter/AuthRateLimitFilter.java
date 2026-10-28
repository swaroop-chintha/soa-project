package com.aegis.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight in-memory sliding window rate limiter to protect authentication endpoints
 * (e.g. POST /auth/login) against brute-force attacks without requiring external Redis infrastructure.
 */
@Component
@SuppressWarnings("null")
public class AuthRateLimitFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(AuthRateLimitFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gateway.ratelimit.auth.max-requests:30}")
    private int maxRequestsPerMinute;

    @Value("${gateway.ratelimit.auth.window-seconds:60}")
    private long windowSeconds;

    // IP address -> Queue of timestamp milliseconds
    private final ConcurrentHashMap<String, Deque<Long>> requestLogs = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        HttpMethod method = exchange.getRequest().getMethod();

        // Check if this is an auth login request
        if (HttpMethod.POST.equals(method) && (path.endsWith("/auth/login") || path.endsWith("/auth/login/"))) {
            String clientIp = resolveClientIp(exchange);
            long now = System.currentTimeMillis();
            long windowMillis = windowSeconds * 1000;

            Deque<Long> timestamps = requestLogs.computeIfAbsent(clientIp, k -> new ArrayDeque<>());

            synchronized (timestamps) {
                // Evict timestamps outside the sliding window
                while (!timestamps.isEmpty() && (now - timestamps.peekFirst() > windowMillis)) {
                    timestamps.pollFirst();
                }

                if (timestamps.size() >= maxRequestsPerMinute) {
                    log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
                    return handleRateLimitExceeded(exchange, path);
                }

                timestamps.addLast(now);
            }
        }

        return chain.filter(exchange);
    }

    private String resolveClientIp(ServerWebExchange exchange) {
        HttpHeaders headers = exchange.getRequest().getHeaders();
        String xForwardedFor = headers.getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        return "unknown-ip";
    }

    private Mono<Void> handleRateLimitExceeded(ServerWebExchange exchange, String path) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set("Retry-After", String.valueOf(windowSeconds));

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now().toString());
        errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
        errorDetails.put("error", "Too Many Requests");
        errorDetails.put("message", "Rate limit exceeded for authentication endpoint. Please retry after " + windowSeconds + " seconds.");
        errorDetails.put("path", path);

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorDetails);
        } catch (JsonProcessingException e) {
            bytes = "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded\"}".getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        // Run before standard filters, but after CorrelationIdGlobalFilter (-1000)
        return -500;
    }
}
