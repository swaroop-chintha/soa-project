#!/usr/bin/env bash
# ==============================================================================
# Aegis Claims Platform - Multi-Instance Backend Services Launcher
# Starts Eureka Registry, Auth, Policy, Approval, Claim (2 instances), and API Gateway.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p logs

echo "=========================================================="
echo " Starting Aegis Microservices Stack (Multi-Instance Backend)"
echo "=========================================================="

# Load .env file into environment if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

JAVA_OPTS="-Deureka.instance.ip-address=127.0.0.1 -Deureka.instance.prefer-ip-address=true -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -DDB_HOST=${DB_HOST:-localhost} -DDB_PORT=${DB_PORT:-5432} -DDATABASE_USERNAME=${DATABASE_USERNAME:-vybhavswaroop} -DDATABASE_PASSWORD=${DATABASE_PASSWORD:-us2005VV#}"

# Helper to check if a port is available without killing unrelated processes
check_port_available() {
  local port="$1"
  local svc_name="$2"
  local pid_file="$3"

  local listening_pid
  listening_pid=$(lsof -ti :"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$listening_pid" ]; then
    if [ -f "$pid_file" ] && [ "$(cat "$pid_file" 2>/dev/null)" = "$listening_pid" ]; then
      echo "  [ALREADY RUNNING] $svc_name is already running on port $port (PID $listening_pid)."
      return 1
    else
      echo "  [ERROR] Port $port is already in use by PID $listening_pid (unrelated or existing process)."
      echo "  Cannot start $svc_name. Unrelated processes will NOT be terminated."
      echo "  Please free port $port manually or choose another port."
      exit 1
    fi
  fi
  return 0
}

wait_for_health() {
  local port="$1"
  local name="$2"
  local max_attempts="${3:-30}"
  for ((i=1; i<=max_attempts; i++)); do
    if curl -s -m 2 "http://localhost:${port}/actuator/health" | grep -q '"UP"'; then
      echo "  [OK] $name is UP on Port $port!"
      return 0
    fi
    sleep 1
  done
  echo "  [WARN] Timed out waiting for $name on port $port (see logs in ./logs/)."
  return 1
}

# 1. Eureka Discovery Server (Port 9000)
if check_port_available 9000 "Eureka Server" "logs/eureka-server.pid"; then
  echo "[1/7] Starting Eureka Discovery Server (Port 9000)..."
  nohup java $JAVA_OPTS -Dserver.port=9000 -jar eureka-server/target/eureka-server-1.0.0-SNAPSHOT.jar > logs/eureka-server.log 2>&1 &
  echo $! > logs/eureka-server.pid
fi
wait_for_health 9000 "Eureka Server" 35

# 2. Auth Service (Port 8084)
if check_port_available 8084 "Auth Service" "logs/auth-service.pid"; then
  echo "[2/7] Starting Auth Service (Port 8084)..."
  nohup java $JAVA_OPTS -Dserver.port=8084 -jar auth-service/target/auth-service-1.0.0-SNAPSHOT.jar > logs/auth-service.log 2>&1 &
  echo $! > logs/auth-service.pid
fi

# 3. Policy Service (Port 8081)
if check_port_available 8081 "Policy Service" "logs/policy-service.pid"; then
  echo "[3/7] Starting Policy Service (Port 8081)..."
  nohup java $JAVA_OPTS -Dserver.port=8081 -jar policy-service/target/policy-service-1.0.0-SNAPSHOT.jar > logs/policy-service.log 2>&1 &
  echo $! > logs/policy-service.pid
fi

# 4. Approval Service (Port 8083)
if check_port_available 8083 "Approval Service" "logs/approval-service.pid"; then
  echo "[4/7] Starting Approval Service (Port 8083)..."
  nohup java $JAVA_OPTS -Dserver.port=8083 -jar approval-service/target/approval-service-1.0.0-SNAPSHOT.jar > logs/approval-service.log 2>&1 &
  echo $! > logs/approval-service.pid
fi

# 5. Claim Service - Instance 1 (Port 8082)
if check_port_available 8082 "Claim Service (Instance 1)" "logs/claim-service-1.pid"; then
  echo "[5/7] Starting Claim Service - Instance 1 (Port 8082)..."
  nohup java $JAVA_OPTS -Dserver.port=8082 -jar claim-service/target/claim-service-1.0.0-SNAPSHOT.jar > logs/claim-service-1.log 2>&1 &
  echo $! > logs/claim-service-1.pid
fi

# 6. Claim Service - Instance 2 (Port 8085)
if check_port_available 8085 "Claim Service (Instance 2)" "logs/claim-service-2.pid"; then
  echo "[6/7] Starting Claim Service - Instance 2 (Port 8085)..."
  nohup java $JAVA_OPTS -Dserver.port=8085 -jar claim-service/target/claim-service-1.0.0-SNAPSHOT.jar > logs/claim-service-2.log 2>&1 &
  echo $! > logs/claim-service-2.pid
fi

# 7. API Gateway (Port 8080)
if check_port_available 8080 "API Gateway" "logs/api-gateway.pid"; then
  echo "[7/7] Starting API Gateway (Port 8080)..."
  nohup java $JAVA_OPTS -Dserver.port=8080 -jar api-gateway/target/api-gateway-1.0.0-SNAPSHOT.jar > logs/api-gateway.log 2>&1 &
  echo $! > logs/api-gateway.pid
fi

echo "Waiting for all microservice instances to become healthy and register with Eureka..."
sleep 5

echo ""
echo "=========================================================="
echo " Service Health Summary"
echo "=========================================================="
services=(
  "Eureka Registry:9000"
  "API Gateway (Edge):8080"
  "Auth Service:8084"
  "Policy Service:8081"
  "Approval Service:8083"
  "Claim Service (Instance 1):8082"
  "Claim Service (Instance 2):8085"
)

for svc in "${services[@]}"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  status=$(curl -s -m 2 "http://localhost:${port}/actuator/health" 2>/dev/null || echo "FAILED")
  if echo "$status" | grep -q '"UP"'; then
    printf "  [OK]   %-32s (Port %4s) -> UP\n" "$name" "$port"
  else
    printf "  [WAIT] %-32s (Port %4s) -> Starting/Unreachable\n" "$name" "$port"
  fi
done

echo ""
echo "=========================================================="
echo " Eureka Registered Instances"
echo "=========================================================="
curl -s -H "Accept: application/json" http://localhost:9000/eureka/apps 2>/dev/null \
  | grep -o '"instanceId":"[^"]*"' | sed 's/"instanceId":/  - /g' || echo "  None yet"

echo "=========================================================="
echo " All instances launched! Logs available in ./logs/"
echo "=========================================================="
