#!/usr/bin/env bash
# ==============================================================================
# Aegis Claims Platform - Stop Backend Services
# Gracefully stops only Aegis instances tracked in logs/*.pid without killing unrelated processes.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Stopping Aegis backend microservice instances..."

shopt -s nullglob
pid_files=(logs/*.pid)
shopt -u nullglob

if [ ${#pid_files[@]} -eq 0 ]; then
  echo "No active Aegis PID files found in logs/."
  exit 0
fi

for pidfile in "${pid_files[@]}"; do
  if [ -f "$pidfile" ]; then
    pid=$(cat "$pidfile" 2>/dev/null || true)
    service=$(basename "$pidfile" .pid)

    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
      # Verify that the process belongs to Aegis java application
      if echo "$cmd" | grep -q "aegis\|target/.*\.jar\|spring"; then
        echo "Stopping $service (PID $pid)..."
        kill -TERM "$pid" 2>/dev/null || true

        # Wait up to 10 seconds for graceful termination
        for i in {1..10}; do
          if ! kill -0 "$pid" 2>/dev/null; then
            break
          fi
          sleep 1
        done

        # If still running after grace period, terminate
        if kill -0 "$pid" 2>/dev/null; then
          echo "Process $pid did not exit gracefully, sending SIGKILL..."
          kill -9 "$pid" 2>/dev/null || true
        fi
      else
        echo "Warning: PID $pid does not appear to be an Aegis service process (Command: $cmd). Skipping."
      fi
    else
      echo "Service $service (PID $pid) was already stopped."
    fi
    rm -f "$pidfile"
  fi
done

echo "Aegis backend shutdown sequence completed."
