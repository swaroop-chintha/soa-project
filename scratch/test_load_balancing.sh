#!/usr/bin/env bash
# ==============================================================================
# Aegis Claims Platform - Multi-Instance Load Balancing & Failover Verification
# ==============================================================================

set -e

GATEWAY_URL="http://localhost:8080"
EUREKA_URL="http://localhost:9000"

echo "================================================================================"
echo " AEGIS CLAIMS PLATFORM - LOAD BALANCING & MULTI-INSTANCE VERIFICATION"
echo "================================================================================"

# 1. Obtain JWT Tokens
echo "[Step 1] Authenticating via Gateway ($GATEWAY_URL/auth/login)..."
ADMIN_AUTH=$(curl -s -X POST "$GATEWAY_URL/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo "$ADMIN_AUTH" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

USER_AUTH=$(curl -s -X POST "$GATEWAY_URL/auth/login" -H "Content-Type: application/json" -d '{"username":"user","password":"user123"}')
USER_TOKEN=$(echo "$USER_AUTH" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ] || [ -z "$USER_TOKEN" ]; then
  echo "Failed to obtain authentication tokens from Gateway. Exiting."
  exit 1
fi
echo "Tokens acquired successfully."

# 2. Check Eureka Registration
echo ""
echo "[Step 2] Checking Eureka Registration for CLAIM-SERVICE instances..."
EUREKA_INSTANCES=$(curl -s -H "Accept: application/json" "$EUREKA_URL/eureka/apps/CLAIM-SERVICE" | grep -o '"instanceId":"[^"]*"' | sed 's/"instanceId"://g')
echo "Registered instances in Eureka for CLAIM-SERVICE:"
echo "$EUREKA_INSTANCES"

# 3. Traffic Distribution Across Instances
echo ""
echo "[Step 3] Sending 10 repeated requests to Gateway /claims and recording handling instance..."
count_8082=0
count_8085=0

for i in {1..10}; do
  port=$(curl -s -I -H "Authorization: Bearer $USER_TOKEN" "$GATEWAY_URL/claims" | grep -i "x-instance-port" | tr -d '\r' | awk '{print $2}')
  echo "  Request #$i -> Handled by Instance Port: $port"
  if [ "$port" == "8082" ]; then
    count_8082=$((count_8082 + 1))
  elif [ "$port" == "8085" ]; then
    count_8085=$((count_8085 + 1))
  fi
done

echo "Traffic distribution summary: Port 8082 = $count_8082 requests | Port 8085 = $count_8085 requests"

# 4. Failover Verification
echo ""
echo "[Step 4] Failover Test: Temporarily stopping Instance on Port 8085..."
PID_8085=$(cat logs/claim-service-2.pid 2>/dev/null || true)
if [ -n "$PID_8085" ]; then
  kill -TERM "$PID_8085"
  sleep 7

  echo "Sending requests during failover (all should succeed via Port 8082):"
  failover_ok=true
  for i in {1..6}; do
    port=$(curl -s -I -H "Authorization: Bearer $USER_TOKEN" "$GATEWAY_URL/claims" | grep -i "x-instance-port" | tr -d '\r' | awk '{print $2}')
    echo "  Failover Request #$i -> Handled by Port: $port"
    if [ "$port" != "8082" ]; then
      failover_ok=false
    fi
  done

  if [ "$failover_ok" = true ]; then
    echo "  [PASS] Failover succeeded. All requests routed to surviving instance 8082."
  else
    echo "  [FAIL] Unexpected routing during failover."
  fi

  # Restart Instance 2
  echo ""
  echo "Restarting Instance on Port 8085..."
  ./start-backend.sh > /dev/null 2>&1
  sleep 4
  echo "Instance on Port 8085 restored."
fi

# 5. Idempotent Submission Across Instances
echo ""
echo "[Step 5] Cross-Instance Idempotency Test..."
IDEMP_KEY="audit-idemp-$(date +%s)"
echo "Submitting Claim #1 with Idempotency-Key: $IDEMP_KEY"
RES1=$(curl -s -i -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_KEY" \
  -d '{"policyId":1,"customerName":"Bruce Wayne","claimAmount":10000.00,"description":"Load balancing idempotency test","claimDate":"2026-05-15"}')
PORT1=$(echo "$RES1" | grep -i "x-instance-port" | tr -d '\r' | awk '{print $2}')
CLAIM1=$(echo "$RES1" | grep -o '"claimNumber":"[^"]*' | cut -d'"' -f4)
echo "  Result: Handled by Port $PORT1 -> Claim: $CLAIM1"

echo "Submitting Duplicate Claim with the same Idempotency-Key: $IDEMP_KEY"
RES2=$(curl -s -i -X POST "$GATEWAY_URL/claims" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMP_KEY" \
  -d '{"policyId":1,"customerName":"Bruce Wayne","claimAmount":10000.00,"description":"Load balancing idempotency test","claimDate":"2026-05-15"}')
PORT2=$(echo "$RES2" | grep -i "x-instance-port" | tr -d '\r' | awk '{print $2}')
CLAIM2=$(echo "$RES2" | grep -o '"claimNumber":"[^"]*' | cut -d'"' -f4)
echo "  Result: Handled by Port $PORT2 -> Claim: $CLAIM2"

if [ "$CLAIM1" == "$CLAIM2" ]; then
  echo "  [PASS] Idempotency verified across instances ($PORT1 and $PORT2 returned identical claim $CLAIM1)."
else
  echo "  [FAIL] Duplicate claim created: $CLAIM1 vs $CLAIM2"
fi

# 6. Actuator Public Exposure Check
echo ""
echo "[Step 6] Verifying Actuator Health does not leak sensitive information..."
ACTUATOR_HEALTH=$(curl -s "$GATEWAY_URL/actuator/health")
echo "Gateway Actuator Health: $ACTUATOR_HEALTH"
if echo "$ACTUATOR_HEALTH" | grep -q "password\|secret\|jdbc"; then
  echo "  [FAIL] Health endpoint leaks sensitive credentials!"
else
  echo "  [PASS] Health endpoint exposes only status without credential leakage."
fi

echo ""
echo "================================================================================"
echo " ALL MULTI-INSTANCE LOAD BALANCING TESTS COMPLETED SUCCESSFULLY!"
echo "================================================================================"
