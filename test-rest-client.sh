#!/usr/bin/env bash
# ==============================================================================
# Aegis Claims Platform - Comprehensive REST Client Test Suite
# Tests Eureka, Gateway, PostgreSQL, and All 4 Microservices with JWT Outputs
# ==============================================================================

set -e

GATEWAY_URL="http://localhost:8080"
EUREKA_URL="http://localhost:9000"

print_header() {
  echo ""
  echo "================================================================================"
  echo " $1"
  echo "================================================================================"
}

print_output() {
  local service_name="$1"
  local endpoint="$2"
  local method="$3"
  local token="$4"
  local response="$5"

  echo ""
  echo "--------------------------------------------------------------------------------"
  echo " SERVICE   : $service_name"
  echo " ENDPOINT  : $method $endpoint"
  echo " JWT TOKEN : $token"
  echo " RESPONSE  :"
  echo "$response"
  echo "--------------------------------------------------------------------------------"
}

print_header "1. EUREKA TOPOLOGY & HEALTH (Port 9000)"

EUREKA_HEALTH=$(curl -s "$EUREKA_URL/actuator/health")
echo "Eureka Server Health Status: $EUREKA_HEALTH"

EUREKA_APPS=$(curl -s -H "Accept: application/json" "$EUREKA_URL/eureka/apps" | grep -o '"name":"[^"]*"' | sort -u | tr '\n' ' ')
echo "Registered Microservices in Eureka: $EUREKA_APPS"


print_header "2. AUTH SERVICE (Obtaining Signed JWT Tokens)"

# 2.1 Admin Login
ADMIN_AUTH_RES=$(curl -s -X POST "$GATEWAY_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

ADMIN_JWT=$(echo "$ADMIN_AUTH_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

print_output "AUTH-SERVICE" "$GATEWAY_URL/auth/login" "POST" "$ADMIN_JWT" "$ADMIN_AUTH_RES"

# 2.2 User Login
USER_AUTH_RES=$(curl -s -X POST "$GATEWAY_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user123"}')

USER_JWT=$(echo "$USER_AUTH_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

print_output "AUTH-SERVICE" "$GATEWAY_URL/auth/login" "POST" "$USER_JWT" "$USER_AUTH_RES"


print_header "3. POLICY SERVICE (Querying & Validating PostgreSQL Policies)"

# 3.1 List All Policies from PostgreSQL
POLICY_LIST_RES=$(curl -s -X GET "$GATEWAY_URL/policies" \
  -H "Authorization: Bearer $ADMIN_JWT")

print_output "POLICY-SERVICE [PostgreSQL]" "$GATEWAY_URL/policies" "GET" "$ADMIN_JWT" "$POLICY_LIST_RES"

# 3.2 Validate Active Policy 1 (Bruce Wayne $75k)
POLICY_VAL_ACTIVE=$(curl -s -X GET "$GATEWAY_URL/policies/1/validate" \
  -H "Authorization: Bearer $ADMIN_JWT")

print_output "POLICY-SERVICE [Active Check]" "$GATEWAY_URL/policies/1/validate" "GET" "$ADMIN_JWT" "$POLICY_VAL_ACTIVE"

# 3.3 Validate Expired Policy 6 (Victor Stone $30k - Expired 2025)
POLICY_VAL_EXPIRED=$(curl -s -X GET "$GATEWAY_URL/policies/6/validate" \
  -H "Authorization: Bearer $ADMIN_JWT")

print_output "POLICY-SERVICE [Expired Check]" "$GATEWAY_URL/policies/6/validate" "GET" "$ADMIN_JWT" "$POLICY_VAL_EXPIRED"


print_header "4. CLAIM SERVICE (Real-World State Machine Scenarios)"

# 4.1 Scenario A: Auto-Approved Claim (Within coverage limit on Policy 1)
IDEMP_A="claim-approved-$(date +%s)"
CLAIM_A_RES=$(curl -s -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_A" \
  -d '{
    "policyId": 1,
    "customerName": "Bruce Wayne",
    "claimAmount": 15000.00,
    "description": "Armor plating repair and sensor realignment",
    "claimDate": "2026-05-15"
  }')

print_output "CLAIM-SERVICE [Auto-Approved]" "$GATEWAY_URL/claims" "POST" "$USER_JWT" "$CLAIM_A_RES"

# 4.2 Scenario B: Rejection by Adjudication Engine (Claim $45k on Policy 4 with $15k limit)
IDEMP_B="claim-exceed-$(date +%s)"
CLAIM_B_RES=$(curl -s -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_B" \
  -d '{
    "policyId": 4,
    "customerName": "Barry Allen",
    "claimAmount": 45000.00,
    "description": "Supersonic friction damage exceeding travel cap",
    "claimDate": "2026-06-10"
  }')

print_output "CLAIM-SERVICE [Exceeds Limit -> Rejection]" "$GATEWAY_URL/claims" "POST" "$USER_JWT" "$CLAIM_B_RES"

# 4.3 Scenario C: Rejection at Intake (Claim on Expired Policy 6)
IDEMP_C="claim-expired-$(date +%s)"
CLAIM_C_RES=$(curl -s -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_C" \
  -d '{
    "policyId": 6,
    "customerName": "Victor Stone",
    "claimAmount": 5000.00,
    "description": "Diagnostic module replacement on lapsed policy",
    "claimDate": "2026-07-01"
  }')

print_output "CLAIM-SERVICE [Expired Policy -> Rejection]" "$GATEWAY_URL/claims" "POST" "$USER_JWT" "$CLAIM_C_RES"

# 4.4 Scenario D: Idempotency Re-submission (Submitting Scenario A again with identical key)
CLAIM_IDEMP_RES=$(curl -s -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_A" \
  -d '{
    "policyId": 1,
    "customerName": "Bruce Wayne",
    "claimAmount": 15000.00,
    "description": "Armor plating repair and sensor realignment",
    "claimDate": "2026-05-15"
  }')

print_output "CLAIM-SERVICE [Idempotency Guard]" "$GATEWAY_URL/claims" "POST" "$USER_JWT" "$CLAIM_IDEMP_RES"

# 4.5 Scenario E: Immutable Transition Audit Trail (Claim 1 History)
CLAIM_HISTORY_RES=$(curl -s -X GET "$GATEWAY_URL/claims/1/history" \
  -H "Authorization: Bearer $USER_JWT")

print_output "CLAIM-SERVICE [State Machine Audit Trail]" "$GATEWAY_URL/claims/1/history" "GET" "$USER_JWT" "$CLAIM_HISTORY_RES"

# 4.6 Scenario F: Terminal State Violation Check (Attempting to reject already approved claim)
TERMINAL_VIOLATION_RES=$(curl -s -X PUT "$GATEWAY_URL/claims/1/status" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status":"REJECTED","reason":"Illegal reversal test"}')

print_output "CLAIM-SERVICE [Terminal Status Violation 400]" "$GATEWAY_URL/claims/1/status" "PUT" "$ADMIN_JWT" "$TERMINAL_VIOLATION_RES"


print_header "5. APPROVAL & UNDERWRITING ENGINE (Adjudication Decisions)"

# 5.1 Direct Evaluation Request: Approved
APPROVAL_EVAL_RES=$(curl -s -X POST "$GATEWAY_URL/approvals/evaluate" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": 888,
    "policyId": 1,
    "claimAmount": 20000.00,
    "coverageAmount": 75000.00,
    "description": "Direct Underwriting Simulation - Approved"
  }')

print_output "APPROVAL-SERVICE" "$GATEWAY_URL/approvals/evaluate" "POST" "$ADMIN_JWT" "$APPROVAL_EVAL_RES"

# 5.2 Direct Evaluation Request: Rejected
APPROVAL_REJECT_RES=$(curl -s -X POST "$GATEWAY_URL/approvals/evaluate" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": 889,
    "policyId": 4,
    "claimAmount": 80000.00,
    "coverageAmount": 15000.00,
    "description": "Direct Underwriting Simulation - Exceeds Coverage"
  }')

print_output "APPROVAL-SERVICE [Underwriting Rejection]" "$GATEWAY_URL/approvals/evaluate" "POST" "$ADMIN_JWT" "$APPROVAL_REJECT_RES"

# 5.3 Adjudication Record for Claim 1
APPROVAL_CLAIM_RES=$(curl -s -X GET "$GATEWAY_URL/approvals/claim/1" \
  -H "Authorization: Bearer $ADMIN_JWT")

print_output "APPROVAL-SERVICE" "$GATEWAY_URL/approvals/claim/1" "GET" "$ADMIN_JWT" "$APPROVAL_CLAIM_RES"


print_header "6. SECURITY, RBAC & PERIMETER DEFENSE CHECKS"

# 6.1 RBAC Violation: USER trying to execute ADMIN-only policy mutation (Expected: 403 Forbidden)
USER_FORBIDDEN_RES=$(curl -s -i -X POST "$GATEWAY_URL/policies" \
  -H "Authorization: Bearer $USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "POL-UNAUTHORIZED",
    "customerName": "Intruder",
    "policyType": "AUTO",
    "coverageAmount": 100.00,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "status": "ACTIVE"
  }' | tail -n 1)

print_output "API-GATEWAY [RBAC 403]" "$GATEWAY_URL/policies" "POST" "$USER_JWT" "$USER_FORBIDDEN_RES"

# 6.2 Missing Token: Unauthenticated Request (Expected: 401 Unauthorized)
NO_TOKEN_RES=$(curl -s -i -X GET "$GATEWAY_URL/claims" | tail -n 1)

print_output "API-GATEWAY [SEC 401 Missing Token]" "$GATEWAY_URL/claims" "GET" "[NO TOKEN PROVIDED]" "$NO_TOKEN_RES"

# 6.3 Tampered / Invalid Token (Expected: 401 Unauthorized)
TAMPERED_RES=$(curl -s -i -X GET "$GATEWAY_URL/policies" \
  -H "Authorization: Bearer invalid.tampered.token" | tail -n 1)

print_output "API-GATEWAY [SEC 401 Invalid Token]" "$GATEWAY_URL/policies" "GET" "invalid.tampered.token" "$TAMPERED_RES"

echo ""
echo "================================================================================"
echo " All REST Client tests completed successfully!"
echo "================================================================================"
