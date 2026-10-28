# Aegis Claims System

Enterprise Insurance Claims Adjudication & Lifecycle Management Platform.

---

## Overview

The insurance claim adjudication lifecycle requires verifying active policy coverage, inspecting risk limits, enforcing audit traceability, and guaranteeing high availability during unpredictable peak submission loads.

The **Aegis Claims System** is a production-hardened, reactive, distributed microservices platform built with **Java 17**, **Spring Boot 3.3.4**, and **Spring Cloud 2023.0.3**. It automates claim intake, policy validation, fraud-resistant idempotent submission, real-time status transitions, and fault-tolerant approval adjudication behind an edge API Gateway.

---

## Architecture

The system implements the **Database-per-Service** and **API Gateway** microservice patterns:
- **Client**: External web, mobile, or third-party partner applications.
- **API Gateway (Edge)**: Perimeter security, JWT validation, anti-spoofing header sanitization, rate limiting, and distributed correlation tracking (`X-Correlation-ID`).
- **Eureka Server**: Centralized service discovery registry supporting elastic service scaling and client-side load balancing.
- **Business Microservices**: Loosely coupled services communicating via load-balanced HTTP `RestClient` with Resilience4j circuit breakers, timeouts, and retries.

### Architecture Diagram

```mermaid
graph TD
    Client["Client (Web / Mobile / Adjuster)"]
    Gateway["API Gateway (Port 8080)<br/>JWT Validation • RBAC • CORS<br/>Rate Limiting • Correlation ID"]
    Eureka["Eureka Server (Port 8761)<br/>Service Registry & Health Discovery"]
    
    Auth["Auth Service (Port 8084)<br/>BCrypt • JWT Issuance"]
    Policy["Policy Service (Port 8081)<br/>Policy Coverage & Validation"]
    Claim["Claim Service (Port 8082)<br/>Lifecycle • Idempotency • Audit History"]
    Approval["Approval Service (Port 8083)<br/>Adjudication Engine"]
    
    WS["WebSocket / STOMP Broker<br/>/ws-claims -> /topic/claims"]
    
    DB_Policy[("Policy DB<br/>(H2 / PostgreSQL)")]
    DB_Claim[("Claim DB<br/>(H2 / PostgreSQL)")]
    DB_Approval[("Approval DB<br/>(H2 / PostgreSQL)")]

    Client -->|HTTP / REST| Gateway
    Client -.->|STOMP Subscriptions| WS
    Gateway -.->|Discovery| Eureka
    
    Gateway -->|lb://auth-service| Auth
    Gateway -->|lb://policy-service| Policy
    Gateway -->|lb://claim-service| Claim
    Gateway -->|lb://approval-service| Approval
    
    Claim -->|Validate Coverage| Policy
    Claim -->|Adjudicate Claim<br/>(Resilience4j CB / Retry)| Approval
    Claim -->|Push Events| WS
    
    Policy --> DB_Policy
    Claim --> DB_Claim
    Approval --> DB_Approval
```

---

## Services

| Service | Port | Responsibility | Database |
| :--- | :--- | :--- | :--- |
| **`eureka-server`** | `8761` | Dynamic service discovery, instance heartbeat tracking, registry replication. | In-Memory Registry |
| **`api-gateway`** | `8080` | Unified API entrypoint, JWT verification, RBAC enforcement, rate limiting, CORS. | Stateless |
| **`auth-service`** | `8084` | User credentials verification, BCrypt password hashing, signed JWT token issuance. | In-Memory (Dev) / Ext (Prod) |
| **`policy-service`** | `8081` | Insurance policy catalog management, coverage date and amount validation. | `policydb` (Isolated) |
| **`claim-service`** | `8082` | Claim intake, state machine transitions, idempotency guard, audit history, WebSocket broker. | `claimdb` (Isolated) |
| **`approval-service`** | `8083` | Automated underwriting logic and payout decision engine based on policy limits. | `approvaldb` (Isolated) |

---

## Technology Stack

- **Runtime & Language**: Java 17 (Eclipse Temurin JRE)
- **Frameworks**: Spring Boot 3.3.4, Spring Cloud 2023.0.3 (Eureka, Spring Cloud Gateway WebFlux, Spring Cloud LoadBalancer)
- **Security**: Spring Security 6, Nimbus JOSE / JWT (HMAC-SHA256), BCrypt
- **Fault Tolerance**: Resilience4j (Circuit Breaker, Retry, TimeLimiter)
- **Persistence & Migrations**: Spring Data JPA, Hibernate 6, Flyway 10 (PostgreSQL automated migrations, baseline-on-migrate), isolated H2 (development) and PostgreSQL 15 (production)
- **Real-Time Messaging**: Spring WebSocket with STOMP protocol over SockJS
- **API Documentation**: SpringDoc OpenAPI 2.6.0 (Swagger UI v3)
- **Containerization**: Docker multi-stage builds (non-root `appuser`), Docker Compose 3.8

---

## Claim Lifecycle

Every insurance claim strictly traverses an audited state machine:

```
[ SUBMITTED ]
      │
      ▼
[ POLICY_VALIDATED ]
      │
      ▼
[ UNDER_REVIEW ]  ◄── (Approval service outage triggers graceful fallback)
      │
      ├───────────────────────┐
      ▼                       ▼
 [ APPROVED ]            [ REJECTED ]
(Within Policy Cap)   (Exceeds Limit / Inactive)
```

1. **`SUBMITTED`**: Claim received, assigned unique identifier, validated against schema and client-supplied `Idempotency-Key`.
2. **`POLICY_VALIDATED`**: Communicates with `policy-service` to confirm policy is `ACTIVE` and effective dates encompass claim date.
3. **`UNDER_REVIEW`**: Claim forwarded to `approval-service`. If `approval-service` is temporarily unavailable or times out, the claim safely parks in `UNDER_REVIEW` and returns HTTP 503 without corrupting state.
4. **`APPROVED`**: Adjudication logic confirms claim amount does not exceed policy coverage amount.
5. **`REJECTED`**: Claim rejected due to coverage cap violations or policy inactivity.

---

## Authentication & Authorization

### JWT Token Issuance
Clients authenticate by submitting credentials to the API Gateway:
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```
The response returns a signed JWT Bearer token:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ...",
  "tokenType": "Bearer",
  "username": "admin",
  "role": "ROLE_ADMIN",
  "expiresInMs": 86400000
}
```

### Role-Based Access Control (RBAC)

| Endpoint | Method | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Public | Obtain JWT token |
| `/actuator/health` | `GET` | Public | Container and service health check |
| `/policies` | `GET` | `ROLE_USER`, `ROLE_ADMIN` | View policy records |
| `/policies/*/validate` | `POST` | `ROLE_USER`, `ROLE_ADMIN` | Validate policy eligibility |
| `/policies` | `POST`, `PUT`, `DELETE` | `ROLE_ADMIN` Only | Policy creation and mutation |
| `/claims` | `POST` | `ROLE_USER`, `ROLE_ADMIN` | Submit insurance claim |
| `/claims` | `GET` | `ROLE_USER`, `ROLE_ADMIN` | Query submitted claims |
| `/claims/{id}/history` | `GET` | `ROLE_USER`, `ROLE_ADMIN` | Query immutable transition audit logs |
| `/claims/{id}/status` | `PUT` | `ROLE_ADMIN` Only | Manual adjudication status override |
| `/approvals/**` | `GET`, `POST` | `ROLE_USER`, `ROLE_ADMIN` | Adjudication lookup |

### Header Anti-Spoofing
The API Gateway strips incoming client-supplied identity headers (`X-User-Name`, `X-User-Roles`) on all perimeter requests. Only when the Gateway successfully verifies the cryptographic signature and expiration of the JWT does it inject trusted downstream identity headers.

---

## Resilience & Fault Tolerance

The `claim-service` integrates Resilience4j when calling downstream dependencies (`policy-service` and `approval-service`):
- **TimeLimiter**: Calls are aborted after 3000ms.
- **Retry**: Up to 3 attempts with 500ms backoff on transient network failures.
- **Circuit Breaker**: Evaluates the last 10 calls. If failure rate exceeds 50%, the breaker trips `OPEN` for 5 seconds, immediately shedding load.
- **Graceful Fallback**: If `approval-service` goes offline, claims remain safely stored in `UNDER_REVIEW` status, and an informative HTTP 503 response is returned to the user without crashing the thread pool.

---

## Idempotency & Concurrency Protection

To prevent duplicate claims caused by mobile network retries:
1. Clients provide an `Idempotency-Key: <unique-uuid>` request header.
2. The database enforces a `UNIQUE` constraint on `claims.idempotency_key`.
3. If a duplicate submission arrives concurrently or sequentially, the existing claim and its audit history are immediately returned with zero duplicate records created.

---

## Real-Time Updates (WebSocket & STOMP)

Status changes publish events to `/topic/claims` via STOMP:
- **Handshake Endpoint**: `http://localhost:8080/ws-claims`
- **Subscription Topic**: `/topic/claims`
- **Payload**: JSON containing `claimId`, `claimNumber`, `status`, `customerName`, `claimAmount`, `timestamp`.

---

## API Documentation (OpenAPI / Swagger)

Interactive Swagger UI consoles are available at:
- **API Gateway**: `http://localhost:8080/swagger-ui.html`
- **Auth Service**: `http://localhost:8084/swagger-ui.html`
- **Policy Service**: `http://localhost:8081/swagger-ui.html`
- **Claim Service**: `http://localhost:8082/swagger-ui.html`
- **Approval Service**: `http://localhost:8083/swagger-ui.html`
- **Eureka Dashboard**: `http://localhost:8761`

---

## Running Locally (Native Maven)

### Prerequisites
- JDK 17+ installed (`java -version`)
- Apache Maven 3.8+ (`mvn -version`)

### 1. Compile and Test All Modules
```bash
mvn clean test
```

### 2. Build Deployable Artifacts
```bash
mvn clean package -DskipTests
```

### 3. Start Services in Recommended Sequence
Start services in separate terminal sessions (or background processes):
```bash
# 1. Start Eureka Registry
java -jar eureka-server/target/eureka-server-1.0.0-SNAPSHOT.jar

# 2. Start Auth Service
java -jar auth-service/target/auth-service-1.0.0-SNAPSHOT.jar

# 3. Start Policy Service
java -jar policy-service/target/policy-service-1.0.0-SNAPSHOT.jar

# 4. Start Approval Service
java -jar approval-service/target/approval-service-1.0.0-SNAPSHOT.jar

# 5. Start Claim Service
java -jar claim-service/target/claim-service-1.0.0-SNAPSHOT.jar

# 6. Start API Gateway
java -jar api-gateway/target/api-gateway-1.0.0-SNAPSHOT.jar
```

---

## Running with Docker & Docker Compose

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Build and Launch Containers
```bash
docker compose up -d --build
```

### 3. Check Container Health
```bash
docker compose ps
```

### 4. Stop Containers
```bash
docker compose down
```

---

## Database Migrations (Flyway)

Each persistent microservice (`policy-service`, `claim-service`, `approval-service`) owns its dedicated PostgreSQL schema managed via Flyway 10.

### Production Migration Behavior
- On application startup with `SPRING_PROFILES_ACTIVE=prod`, Flyway automatically executes pending versioned migrations from `src/main/resources/db/migration/` before JPA initialization.
- Hibernate runs with `spring.jpa.hibernate.ddl-auto: validate`, verifying that the physical database schema matches the JPA entity definitions. Any schema discrepancy halts application startup immediately.
- `spring.flyway.baseline-on-migrate: true` and `baseline-version: 0` ensure that existing populated databases are safely baselined without data loss.

### Migration Directory Layout
```text
policy-service/src/main/resources/db/migration/V1__initial_schema.sql
claim-service/src/main/resources/db/migration/V1__initial_schema.sql
approval-service/src/main/resources/db/migration/V1__initial_schema.sql
```

### Versioning Protocol for Future Migrations
1. Add new migrations using the format: `V{version}__{description}.sql` (e.g., `V2__add_policy_deductible.sql`).
2. Applied migrations are immutable: never modify an already-executed migration script.
3. Always guard statements with safe DDL (`IF NOT EXISTS`, avoid table drops, preserve existing rows).

---

## Failure Scenarios & Self-Healing Verification

To verify system resilience during an outage:
1. Terminate the `approval-service`:
   ```bash
   docker compose stop approval-service
   ```
2. Submit a claim via Gateway:
   ```bash
   curl -i -X POST http://localhost:8080/claims \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"policyId":1,"customerName":"Jane Doe","claimAmount":1500.00,"description":"Theft","claimDate":"2026-05-10"}'
   ```
3. The response returns **HTTP 503 Service Unavailable** while the claim is safely recorded as `UNDER_REVIEW`.
4. Restart the `approval-service`:
   ```bash
   docker compose start approval-service
   ```
5. Subsequent claims immediately adjudicate to `APPROVED` automatically upon circuit closure.
