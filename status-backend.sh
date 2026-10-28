#!/usr/bin/env bash
# ==============================================================================
# Aegis Claims Platform - Status Checker (Multi-Instance)
# ==============================================================================

echo "=========================================================="
echo " Aegis Microservices Health Status"
echo "=========================================================="

services=(
  "Eureka Discovery Registry:9000"
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
  res=$(curl -s -m 2 "http://localhost:${port}/actuator/health" 2>/dev/null || echo '{"status":"DOWN"}')
  status=$(echo "$res" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
  if [ "$status" == "UP" ]; then
    printf "  %-32s [Port %4s] : \033[0;32mUP\033[0m\n" "$name" "$port"
  else
    printf "  %-32s [Port %4s] : \033[0;31mDOWN / UNREACHABLE\033[0m\n" "$name" "$port"
  fi
done

echo ""
echo "Eureka Registered Service Instances:"
eureka_json=$(curl -s -H "Accept: application/json" http://localhost:9000/eureka/apps 2>/dev/null || echo "")
if [ -n "$eureka_json" ]; then
  echo "$eureka_json" | grep -o '"instanceId":"[^"]*"' | sed 's/"instanceId":/  - /g' || echo "  None"
else
  echo "  Eureka registry unreachable on port 9000"
fi
echo "=========================================================="
