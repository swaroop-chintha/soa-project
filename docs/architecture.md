# Architecture Decision Records (ADR) — Aegis Claims System

This document captures the foundational architectural decisions, rationale, and tradeoffs made in the engineering of the Aegis Claims System.

---

## ADR 1: Microservices Architecture

### Context
Insurance claim processing involves heterogeneous domains with distinct scalability, availability, and audit requirements: policy verification, claim intake, risk/adjudication rules, and real-time claimant notifications.

### Decision
Decompose the backend into six decoupled services:
- **`eureka-server`**: Service registry and dynamic endpoint discovery.
- **`api-gateway`**: Unified perimeter edge, authentication, rate limiting, and request tracing.
- **`auth-service`**: Identity issuance and role management.
- **`policy-service`**: Policy lifecycle, coverage caps, and validation rules.
- **`claim-service`**: Claim ingestion, lifecycle state machine, idempotency, and audit history.
- **`approval-service`**: Adjudication logic and payout decision engine.

### Rationale & Tradeoffs
- **Pros**: Independent deployability, clear domain boundaries (Bounded Contexts), localized blast radius during failures, independent scaling.
- **Tradeoffs**: Increased operational complexity, eventual consistency considerations, network latency between services (mitigated by non-blocking gateways and connection pooling).

---

## ADR 2: Eureka Service Discovery

### Context
In dynamic cloud/container environments, service instances scale elastically and assign ephemeral IP addresses. Hardcoding IP addresses or DNS records creates tight coupling and configuration fragility.

### Decision
Adopt Netflix Eureka (`spring-cloud-starter-netflix-eureka-server` & `client`).

### Rationale & Tradeoffs
- **Pros**: Client-side load balancing via Spring Cloud LoadBalancer, automated heartbeat-based health tracking, zero DNS reconfiguration overhead.
- **Tradeoffs**: Requires dedicated registry cluster; mitigated by fast local registry caching (3-second fetch intervals).

---

## ADR 3: API Gateway as Single Edge Entrypoint

### Context
Direct client-to-microservice communication exposes internal topologies, complicates CORS/SSL termination, scatters authentication logic across services, and allows malicious clients to spoof internal identity headers.

### Decision
Implement Spring Cloud Gateway (reactive WebFlux) as the sole perimeter entrypoint.

### Rationale & Tradeoffs
- **Pros**:
  - Centralized JWT verification and RBAC enforcement.
  - Header anti-spoofing (`X-User-Name`, `X-User-Roles` stripped from external requests and injected only after verified JWT decode).
  - Distributed correlation ID generation (`X-Correlation-ID`).
  - In-memory sliding window rate limiting on brute-force sensitive endpoints (`/auth/login`).
  - Unified CORS negotiation.
- **Tradeoffs**: Gateway constitutes a single point of entry; mitigated by stateless horizontal scalability.

---

## ADR 4: Database-per-Service Pattern

### Context
Shared databases tightly couple microservice schemas, invite cross-domain table joins, and violate domain encapsulation.

### Decision
Each business microservice (`policy-service`, `claim-service`, `approval-service`) owns its private, logically and physically segregated database. No service may directly read or write to another service's database tables.

### Rationale & Tradeoffs
- **Pros**: Total schema autonomy, zero cross-service schema lock-in, independent migrations, isolation of data corruption.
- **Tradeoffs**: Cross-service data queries require synchronous REST calls or asynchronous messaging; mitigated by lightweight DTO payloads and Resilience4j circuit breakers.

---

## ADR 5: Stateless JWT Authentication & Role-Based Access Control (RBAC)

### Context
High-throughput distributed systems cannot afford database session lookups or shared session caches (e.g. Redis) on every inter-service call.

### Decision
Implement digitally signed HMAC-SHA256 JSON Web Tokens (JWT) containing cryptographic claims (`sub` = username, `role` = authority, `exp` = expiration timestamp).

### Rationale & Tradeoffs
- **Pros**: Zero database latency on token validation, completely stateless edge verification at API Gateway, transparent identity propagation downstream via trusted headers.
- **Tradeoffs**: Cannot instantaneously revoke a token prior to expiration without token blacklisting; mitigated by configurable short expiration windows (`JWT_EXPIRATION_MS`).

---

## ADR 6: Fault Tolerance with Resilience4j (Circuit Breakers, Timeouts, Retries)

### Context
When downstream dependencies (such as the `approval-service` or `policy-service`) experience high latency, database deadlocks, or network partitions, cascading failure can exhaust thread pools across the entire cluster.

### Decision
Protect all inter-service REST clients with Resilience4j:
1. **TimeLimiter**: Enforce strict 3-second SLA timeouts on downstream calls.
2. **Retry**: Up to 3 attempts with exponential backoff on transient I/O network errors.
3. **CircuitBreaker**: Monitor rolling failure rates (50% threshold over 10 calls); transition to `OPEN` state to short-circuit calls immediately for 5 seconds when downstream dependencies fail.

### Rationale & Tradeoffs
- **Pros**: Graceful degradation: when approval service fails, claims enter `UNDER_REVIEW` rather than crashing the submission process, and clients receive HTTP 503 with actionable details.

---

## ADR 7: Distributed Idempotency via Unique Client Keys

### Context
Mobile and web clients operating on unreliable networks may retry HTTP `POST /claims` requests upon network drops or gateway timeouts, resulting in duplicate claims and incorrect insurance payouts.

### Decision
Support an optional or mandatory `Idempotency-Key` HTTP request header stored directly on the `Claim` entity with a database-level unique constraint (`claims.idempotency_key UNIQUE`).

### Rationale & Tradeoffs
- **Pros**: When an identical `Idempotency-Key` is received within a duplicate request, the system detects the unique constraint and returns the existing persisted claim and status history without re-triggering adjudication or generating duplicate financial liabilities.

---

## ADR 8: Immutable Claim Status Audit History

### Context
Insurance regulations demand full legal traceability of state transitions (who changed what, when, previous status, new status, and justification).

### Decision
Introduce a dedicated `claim_status_history` entity and centralized `ClaimStatusTransitionService` that records every lifecycle transition (`SUBMITTED` -> `POLICY_VALIDATED` -> `UNDER_REVIEW` -> `APPROVED`/`REJECTED`) atomically inside the database transaction.

### Rationale & Tradeoffs
- **Pros**: Non-repudiation, tamper-evident audit logs, complete traceability for compliance and regulatory review.

---

## ADR 9: Real-Time Event Broadcasting via WebSocket / STOMP

### Context
Claim adjudication can transition asynchronously (e.g., manual underwriting review or external batch checks). Claimants and claim adjusters should receive instant status alerts without aggressive polling.

### Decision
Integrate Spring WebSocket with STOMP messaging protocol on `/ws-claims`, broadcasting status events to the `/topic/claims` broker.

### Rationale & Tradeoffs
- **Pros**: Sub-millisecond frontend push notifications, reduced HTTP polling traffic.

---

## ADR 10: Dual Profile Strategy: H2 for Fast Local Development & PostgreSQL for Production

### Context
Developers and CI test pipelines need instant build cycles (`mvn clean test`) without requiring external PostgreSQL database daemons running on local developer workstations. Production, however, requires durable, ACID-compliant relational storage with connection pooling.

### Decision
- **`dev` Profile (Default)**: In-memory H2 database per service with schema auto-generation (`ddl-auto: update`).
- **`prod` Profile**: Production PostgreSQL connection strings driven entirely by environment variables (`DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`), tuned with HikariCP connection pools (`max-size: 10`, `min-idle: 2`). Versioned migration scripts (`V1__initial_schema.sql`) define exact DDL schemas.

### Rationale & Tradeoffs
- **Pros**: Zero-friction developer onboarding and lightning-fast test execution while guaranteeing production database parity and durability.

---

## ADR 11: Inter-Service Security Boundaries & Network Isolation

### Context
In distributed microservice topologies, exposing internal services to public network ingress invites token bypass, direct table tampering, and header spoofing vulnerabilities. Downstream services (`policy-service`, `claim-service`, `approval-service`) trust upstream identity headers (`X-User-Name`, `X-User-Roles`) propagated by the API Gateway.

### Decision
1. **Perimeter Enforcement**: Only the API Gateway (`api-gateway`, Port 8080) exposes a public ingress port. All downstream business services communicate exclusively within an isolated private bridge network (`aegis-net`).
2. **Anti-Spoofing Protocol**: The Gateway strictly sanitizes untrusted caller headers on every external ingress, discarding any client-provided `X-User-Name` or `X-User-Roles` headers before injecting validated claims from cryptographically verified JWT tokens.
3. **Failure Isolation**: Inter-service REST clients are secured with non-blocking timeouts (3s), retries (exponential backoff), and circuit breakers (Resilience4j). Downstream outages (e.g. approval engine unavailable) safely preserve in-flight claim states in `UNDER_REVIEW` without rolling back recorded intake or corrupting financial audits.

### Rationale & Tradeoffs
- **Pros**: Minimal overhead, defense-in-depth network isolation, zero duplicate token decoding latency on internal REST calls.
- **Tradeoffs**: Requires network perimeter hygiene in production container runtimes (e.g., Docker, Kubernetes NetworkPolicies).

---

## ADR 12: Observability Architecture & Actuator Telemetry Standard

### Context
Operating distributed claims adjudication across 6 microservices requires unified correlation tracking across network hops, standardized health checking for container orchestrators, and application metrics exposure for infrastructure dashboards.

### Decision
1. **End-to-End Correlation Tracking**: Every request entering the API Gateway is stamped with a unique `X-Correlation-ID` (UUID) via `CorrelationIdGlobalFilter` and echoed back to the caller in response headers.
2. **MDC Log Propagation**: Each downstream service captures `X-Correlation-ID` in a high-precedence servlet filter (`CorrelationIdFilter`), binds it to SLF4J `MDC` (`correlationId`), and outputs it in all structured console log patterns. Outgoing inter-service `RestClient` calls propagate the correlation ID forward.
3. **Telemetry & Actuator Exposure**: All microservices standardize on exposing `/actuator/health`, `/actuator/info`, and `/actuator/metrics`. Health probes verify container liveness, while metrics provide telemetry for JVM, HTTP latency, HikariCP connection pool utilization, and Resilience4j circuit breaker state transitions.

### Rationale & Tradeoffs
- **Pros**: Consistent log tracing across service boundaries, real-time observability, zero operational lock-in.
- **Tradeoffs**: High log volume at DEBUG/INFO levels under peak load (mitigated by environment-configurable log levels `LOG_LEVEL_ROOT` and `LOG_LEVEL_APP`).

---

## ADR 13: Database Migration Integration (Flyway) & Schema Versioning Standards

### Context
Relying on Hibernate auto-DDL (`ddl-auto: update`) in production introduces severe risks: implicit schema drift, non-deterministic table alterations, untracked index mutations, and lack of rollback traceability. Production environments require explicit, versioned, reproducible DDL migrations executed deterministically before application runtime initialization.

### Decision
1. **Flyway Integration per Bounded Context**:
   - Each persistence microservice (`policy-service`, `claim-service`, `approval-service`) integrates `flyway-core` and `flyway-database-postgresql` (Flyway 10.10.x).
   - Each service migrates strictly its own database (`policy_db`, `claim_db`, `approval_db`) from its own migration classpath (`classpath:db/migration`).
2. **Deterministic Lifecycle Ordering**:
   - In production (`prod` profile), Flyway runs before Hibernate entity manager initialization (`spring.flyway.enabled: true`).
   - Hibernate DDL auto-generation is disabled in production and switched to schema validation (`spring.jpa.hibernate.ddl-auto: validate`). Hibernate verifies that the physical database schema strictly conforms to JPA entity mappings on startup; any discrepancy aborts startup immediately (`SchemaManagementException`).
3. **Data Safety & Non-Destructive Baseline**:
   - `spring.flyway.baseline-on-migrate: true` and `baseline-version: 0` are configured.
   - For existing databases with populated tables, Flyway initializes `flyway_schema_history` at baseline 0 and executes `V1__initial_schema.sql` safely without dropping tables or deleting data (guarded by `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`).
   - For fresh databases, Flyway executes all migrations from version 1 upward.
4. **Development Parity**:
   - Development profile (`dev` profile) maintains fast in-memory H2 test cycles with `spring.flyway.enabled: false` and `ddl-auto: update`, avoiding external database daemon requirements for unit tests.
5. **Future Migration Versioning Protocol**:
   - **Naming convention**: `V{major}.{minor}__{descriptive_name}.sql` (e.g., `V2__add_policy_deductible.sql`, `V3__add_claim_adjuster_assignment.sql`).
   - **Immutability rule**: Once a migration is committed and merged, its file content and checksum are immutable. Schema changes must always be rolled forward in a new numbered version.
   - **Idempotency & Non-blocking DDL**: Use `IF NOT EXISTS` for table/index creation, avoid dropping active columns in a single release (follow expand/contract pattern), and never delete historical records.
